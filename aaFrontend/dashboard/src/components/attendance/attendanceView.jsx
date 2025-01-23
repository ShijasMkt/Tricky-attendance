import React, { useEffect, useState } from "react";
import "./attendance.css";
import { Calendar } from "primereact/calendar";

export default function AttendanceView() {
  const [attendance, setAttendance] = useState(null);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); 
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTodayDate = () => {
    return formatDate(new Date());
  };

  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const today = getTodayDate();
    fetchAttendance(today);
  }, []);

  const fetchAttendance = async (date) => {
    const body = JSON.stringify({ date });
    const res = await fetch("http://127.0.0.1:8080/api/fetch_Attendance/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
    if (res.ok) {
      const data = await res.json();
      setAttendance(data);
    } else {
      setAttendance(null);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.value; 
    setSelectedDate(newDate);
    const formattedDate = formatDate(newDate);
    fetchAttendance(formattedDate);
  };

  return (
    <section id="attendanceView-body">
      <div className="container pt-3">
        <div className="d-flex justify-content-center">
          <Calendar
            value={selectedDate}
            onChange={handleDateChange}
            dateFormat="yy-mm-dd"
            showIcon
          />
        </div>
        {attendance ? (
          <div className="row pt-3">
            <div className="col-4">
              <div className="card present-card">
                <h4 className="card-title">Present</h4>
                <div className="card-body">{attendance.present}</div>
              </div>
            </div>
            <div className="col-4">
              <div className="card absent-card">
                <h4 className="card-title">Absent</h4>
                <div className="card-body">{attendance.absent}</div>
              </div>
            </div>
            <div className="col-4">
              <div className="card leave-card">
                <h4 className="card-title">Leave</h4>
                <div className="card-body">{attendance.leave}</div>
              </div>
            </div>
          </div>
        ) : (
          <span>!! No Attendance data in the given date</span>
        )}
      </div>
    </section>
  );
}
