const BASE = "http://localhost:8000";

export async function addEmployee(data) {
  const res = await fetch(`${BASE}/employees/`, {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Error");
  return res.json();
}

export async function listEmployees() {
  const res = await fetch(`${BASE}/employees/`);
  return res.json();
}

export async function applyLeave(data) {
  const res = await fetch(`${BASE}/leaves/apply/`, {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Error");
  return res.json(); // Now returns { leave, warning }
}

export async function listLeaves() {
  const res = await fetch(`${BASE}/leaves/`);
  return res.json();
}

export async function actOnLeave(leaveId, action) {
  const res = await fetch(`${BASE}/leaves/${leaveId}/${action.charAt(0).toUpperCase() + action.slice(1)}`, {
    method: "POST"
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Error");
  return res.json();
}

export async function getLeaveBalance(empId) {
  const res = await fetch(`${BASE}/employees/${empId}/leave`);
  return res.json();
}