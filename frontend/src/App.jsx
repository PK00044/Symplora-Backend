import React, { useState, useEffect } from "react";
import {
  addEmployee,
  listEmployees,
  applyLeave,
  listLeaves,
  actOnLeave,
  getLeaveBalance,
} from "./api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    listEmployees().then(setEmployees);
    listLeaves().then(setLeaves);
  };
  
const [user, setUser] = useState(null);
const [loginForm, setLoginForm] = useState({ email: "", password: "" });

const handleLoginChange = (e) =>
  setLoginForm({ ...loginForm, [e.target.name]: e.target.value });

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    });
    if (!res.ok) throw new Error((await res.json()).detail);
    const data = await res.json();
    setUser(data);
    if (data.role === "HR") refresh(); // HR loads all data
  } catch (err) {
    toast.error(err.message);
  }
};

  // Employee Form
  const [empForm, setEmpForm] = useState({
    name: "",
    email: "",
    department: "",
    joining_date: "",
  });
  const handleEmpChange = (e) =>
    setEmpForm({ ...empForm, [e.target.name]: e.target.value });
  const handleEmpSubmit = async (e) => {
    e.preventDefault();
    try {
      await addEmployee(empForm);
      toast.success("Employee added!");
      refresh();
      setEmpForm({ name: "", email: "", department: "", joining_date: "" });
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Leave Form
  const [leaveForm, setLeaveForm] = useState({
    employee_id: "",
    start_date: "",
    end_date: "",
  });
  const handleLeaveChange = (e) =>
    setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value });
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await applyLeave(leaveForm);
      toast.success("Leave request submitted!");
      if (res.warning) toast.warning(res.warning);
      refresh();
      setLeaveForm({ employee_id: "", start_date: "", end_date: "" });
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Leave Actions
  const handleLeaveAction = async (id, action) => {
    try {
      await actOnLeave(id, action);
      toast.success(`Leave ${action}ed!`);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Leave Balance
  const handleBalance = async () => {
    if (!selectedEmp) return;
    try {
      const res = await getLeaveBalance(selectedEmp);
      setBalance(res);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">
        Mini Leave Management System
      </h1>

      {/* Add Employee */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Add Employee</h2>
        <form
          onSubmit={handleEmpSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              name="name"
              id="name"
              className="border p-2 rounded w-full"
              placeholder="Name"
              value={empForm.name}
              onChange={handleEmpChange}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              name="email"
              id="email"
              className="border p-2 rounded w-full"
              placeholder="Email"
              value={empForm.email}
              onChange={handleEmpChange}
              required
              type="email"
            />
          </div>
          <div>
            <label
              htmlFor="department"
              className="block text-sm font-medium mb-1"
            >
              Department
            </label>
            <input
              name="department"
              id="department"
              className="border p-2 rounded w-full"
              placeholder="Department"
              value={empForm.department}
              onChange={handleEmpChange}
              required
            />
          </div>
          <div>
            <label
              htmlFor="joining_date"
              className="block text-sm font-medium mb-1"
            >
              Joining Date
            </label>
            <input
              name="joining_date"
              id="joining_date"
              type="date"
              className="border p-2 rounded w-full"
              value={empForm.joining_date}
              onChange={handleEmpChange}
              required
            />
          </div>
          <div className="self-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Employee List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Employees</h2>
        <table className="w-full text-sm border rounded overflow-hidden">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Department</th>
              <th className="p-2">Joining Date</th>
              <th className="p-2">Leave Balance</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-2 font-medium">{e.name}</td>
                <td className="p-2">{e.email}</td>
                <td className="p-2">{e.department}</td>
                <td className="p-2">{e.joining_date}</td>
                <td className="p-2 text-green-700 font-semibold">
                  {e.leave_balance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Apply Leave */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Apply Leave</h2>
        <form
          onSubmit={handleLeaveSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div>
            <label
              htmlFor="employee_id"
              className="block text-sm font-medium mb-1"
            >
              Employee
            </label>
            <select
              name="employee_id"
              id="employee_id"
              className="border p-2 rounded w-full"
              value={leaveForm.employee_id}
              onChange={handleLeaveChange}
              required
            >
              <option value="">Select Employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="start_date"
              className="block text-sm font-medium mb-1"
            >
              Start Date
            </label>
            <input
              name="start_date"
              id="start_date"
              type="date"
              className="border p-2 rounded w-full"
              value={leaveForm.start_date}
              onChange={handleLeaveChange}
              required
            />
          </div>
          <div>
            <label
              htmlFor="end_date"
              className="block text-sm font-medium mb-1"
            >
              End Date
            </label>
            <input
              name="end_date"
              id="end_date"
              type="date"
              className="border p-2 rounded w-full"
              value={leaveForm.end_date}
              onChange={handleLeaveChange}
              required
            />
          </div>
          <div className="self-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </form>
      </div>

      {/* Leave Requests */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Leave Requests</h2>
        <table className="w-full text-sm border rounded overflow-hidden">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="p-2">Employee</th>
              <th className="p-2">Department</th>
              <th className="p-2">Start</th>
              <th className="p-2">End</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-2">{l.employee.name}</td>
                <td className="p-2">{l.employee.department}</td>
                <td className="p-2">{l.start_date}</td>
                <td className="p-2">{l.end_date}</td>
                <td
                  className={`p-2 font-bold ${
                    l.status === "Pending"
                      ? "text-yellow-600"
                      : l.status === "Approved"
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {l.status}
                </td>
                <td className="p-2">
                  {l.status === "Pending" && (
                    <>
                      <button
                        onClick={() => handleLeaveAction(l.id, "approved")}
                        className="bg-green-600 text-white px-2 py-1 rounded mr-2 hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleLeaveAction(l.id, "rejected")}
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leave Balance */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Check Leave Balance</h2>
        <select
          className="border p-2 rounded"
          value={selectedEmp}
          onChange={(e) => setSelectedEmp(e.target.value)}
        >
          <option value="">Select Employee</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <button
          className="ml-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          onClick={handleBalance}
        >
          Check
        </button>
        {balance && (
          <div className="mt-2 p-2 bg-gray-100 rounded">
            <p className="font-semibold">Balance: {balance.balance}</p>
            <ul>
              {balance.leavehistory.map((l) => (
                <li key={l.id}>
                  {l.start_date} to {l.end_date} ({l.status})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}
