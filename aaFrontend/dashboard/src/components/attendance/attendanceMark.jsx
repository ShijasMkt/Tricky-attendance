import React, { useState, useEffect ,useRef} from 'react';
import { Toast } from 'primereact/toast';
import { formatDate } from '../../utils/formatDT';

export default function AttendanceMark() {
  const [staffs, setStaffs] = useState([]);
  const [formData, setFormData] = useState({
    staff_id: '',
    date: '',
    status: 'P',
  });
  const toast = useRef(null);


  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/fetch_staff/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      const data = await res.json();
      setStaffs(data);
    }
  };

  const handleSelectStaff = (e) => {
    const staffId = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      staff_id: staffId,
    }));
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const markAttendance = async (e) => {
    e.preventDefault();
    
    const formattedDate = formatDate(new Date(formData.date));

    const data = {
      ...formData,
      date: formattedDate, 
    };
    const body = JSON.stringify({ data });

    const res = await fetch("http://127.0.0.1:8000/api/mark_Attendance/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (res.ok) {
      toast.current.show({ severity: 'success', summary: 'Done', detail: 'Attendance Marked!!' });
      setFormData({
        staff_id: '',
        date: '',
        status: 'P',
      });
    } 
  };

  return (
    <section id="attendanceMark-body" className='section-body'>
      <div className="container pt-3">
        
        <form onSubmit={markAttendance}>
          <div className="row">
            <div className="col-4">
            <label htmlFor="staffSelect" className="form-label mb-0">Select Staff:</label>
              <select
                id="staffSelect"
                className="form-control"
                value={formData.staff_id}
                onChange={handleSelectStaff}
                required
              >
                <option value="" disabled>-- Select Staff --</option>
                {staffs.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.staff_id} - {staff.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-3">
              <label htmlFor="date" className="form-label mb-0">Select Date:</label>
              <input
                type="date"
                className="form-control"
                id="date"
                value={formData.date}
                onChange={handleFormChange}
              required />
            </div>
            <div className="col-3">
              <label htmlFor="status" className="form-label mb-0">Status:</label>
              <select
                id="status"
                className="form-control"
                value={formData.status}
                onChange={handleFormChange}
              >
                <option value="P">Present</option>
                <option value="A">Absent</option>
                <option value="L">Leave</option>
              </select>
            </div>
            <div className="col-2 text-center">
              <button type="submit" className="btn btn-success mt-3">Submit</button>
            </div>
          </div>
        </form>
      </div>
      <Toast ref={toast} />
    </section>
  );
}
