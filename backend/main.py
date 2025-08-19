from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List
from datetime import date, datetime
from sqlalchemy import create_engine, Column, Integer, String, Date, ForeignKey, Enum
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, joinedload
import enum

app = FastAPI()

origins = [
    "https://symplora-backend-m1irn6mel-pratham-kubsads-projects.vercel.app",  # your Vercel app
    "http://localhost:5173",  # local dev (vite default)
]

# CORS setup for frontend (React on Vite at port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# SQLAlchemy setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./leave_mgmt.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()

# Enum for leave status
class LeaveStatus(str, enum.Enum):
    pending = "Pending"
    approved = "Approved"
    rejected = "Rejected"

# Employee model
class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    department = Column(String, nullable=False)
    joining_date = Column(Date, nullable=False)
    leave_balance = Column(Integer, default=20)
    leaves = relationship("LeaveRequest", back_populates="employee")

# LeaveRequest model
class LeaveRequest(Base):
    __tablename__ = "leaves"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(Enum(LeaveStatus), default=LeaveStatus.pending)
    applied_on = Column(Date, default=datetime.now)
    employee = relationship("Employee", back_populates="leaves")

Base.metadata.create_all(bind=engine)

# Pydantic models
class EmployeeCreate(BaseModel):
    name: str
    email: EmailStr
    department: str
    joining_date: date

class EmployeeOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    department: str
    joining_date: date
    leave_balance: int

    class Config:
        from_attributes = True

# Mini employee info for embedding in LeaveOut
class EmployeeMiniOut(BaseModel):
    id: int
    name: str
    department: str

    class Config:
        from_attributes = True

class LeaveApply(BaseModel):
    employee_id: int
    start_date: date
    end_date: date

class LeaveOut(BaseModel):
    id: int
    employee_id: int
    start_date: date
    end_date: date
    status: LeaveStatus
    applied_on: date
    employee: EmployeeMiniOut  # Nested employee info here

    class Config:
        from_attributes = True

class LeaveBalanceOut(BaseModel):
    balance: int
    leavehistory: List[LeaveOut]

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Add employee
@app.post("/employees/", response_model=EmployeeOut)
def add_employee(employee: EmployeeCreate):
    db = next(get_db())
    if db.query(Employee).filter(Employee.email == employee.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    if employee.joining_date < date.today().replace(year=2000):
        raise HTTPException(status_code=400, detail="Invalid joining date")
    new_emp = Employee(
        name=employee.name,
        email=employee.email,
        department=employee.department,
        joining_date=employee.joining_date,
    )
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return new_emp

# List all employees
@app.get("/employees/", response_model=List[EmployeeOut])
def list_employees():
    db = next(get_db())
    return db.query(Employee).all()

# Apply for leave
@app.post("/leaves/apply/", response_model=LeaveOut)
def apply_leave(req: LeaveApply):
    db = next(get_db())
    emp = db.query(Employee).filter(Employee.id == req.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    if req.start_date < emp.joining_date:
        raise HTTPException(status_code=400, detail="Cannot apply for leave before joining date")
    if req.start_date > req.end_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    overlaps = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == req.employee_id,
        LeaveRequest.status.in_([LeaveStatus.pending, LeaveStatus.approved]),
        LeaveRequest.start_date <= req.end_date,
        LeaveRequest.end_date >= req.start_date
    ).first()
    if overlaps:
        raise HTTPException(status_code=400, detail="Overlapping leave request exists")
    days = (req.end_date - req.start_date).days + 1
    if emp.leave_balance < days:
        raise HTTPException(status_code=400, detail="Insufficient leave balance")
    leave = LeaveRequest(
        employee_id=req.employee_id,
        start_date=req.start_date,
        end_date=req.end_date,
        status=LeaveStatus.pending,
        applied_on=datetime.now().date()
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    # eager load employee relationship for response
    leave.employee = emp
    return leave

# List all leaves (with embedded employee info)
@app.get("/leaves/", response_model=List[LeaveOut])
def list_leaves():
    db = next(get_db())
    leaves = db.query(LeaveRequest).options(joinedload(LeaveRequest.employee)).all()
    return leaves

# Approve/reject leave
@app.post("/leaves/{leave_id}/{action}", response_model=LeaveOut)
def act_on_leave(leave_id: int, action: LeaveStatus):
    db = next(get_db())
    leave = db.query(LeaveRequest).options(joinedload(LeaveRequest.employee)).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if leave.status != LeaveStatus.pending:
        raise HTTPException(status_code=400, detail="Request already processed")
    emp = db.query(Employee).filter(Employee.id == leave.employee_id).first()
    days = (leave.end_date - leave.start_date).days + 1
    if action == LeaveStatus.approved:
        if emp.leave_balance < days:
            raise HTTPException(status_code=400, detail="Insufficient leave balance")
        emp.leave_balance -= days
        leave.status = LeaveStatus.approved
    elif action == LeaveStatus.rejected:
        leave.status = LeaveStatus.rejected
    db.commit()
    db.refresh(leave)
    return leave

# Get leave balance and history (with embedded employee info)
@app.get("/employees/{emp_id}/leave", response_model=LeaveBalanceOut)
def get_leave_balance(emp_id: int):
    db = next(get_db())
    emp = db.query(Employee).filter(Employee.id == emp_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    leaves = db.query(LeaveRequest).options(joinedload(LeaveRequest.employee)).filter(LeaveRequest.employee_id == emp_id).all()
    leavehistory = [LeaveOut.from_orm(leave) for leave in leaves]
    return LeaveBalanceOut(balance=emp.leave_balance, leavehistory=leavehistory)
