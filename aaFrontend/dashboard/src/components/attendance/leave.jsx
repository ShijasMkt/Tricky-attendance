import React from 'react'
import { useEffect, useState,useRef} from "react";
import "./attendance.css";
import { Toast } from 'primereact/toast';
import { formatDate } from '../utils/formatDT';
import { getValidAccessToken } from "../auth/tokenValidation";
import { useAuth } from "../auth/AuthContext";


export default function Leave() {
    const {logout} =useAuth();
    const [staffs, setStaffs] = useState([]);
    const [formData, setFormData] = useState({
        staff_id: '',
        date: '',
        status: 'L',
        reason:''
      });
    const toast = useRef(null);

    useEffect(() => {
        fetchStaffs();
      }, []);

    const fetchStaffs = async () => {
      await getValidAccessToken(logout);
        const res = await fetch("http://localhost:8000/api/fetch_staff/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials:'include'
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

      const markLeave = async (e) => {
          e.preventDefault();
          
          const formattedDate = formatDate(new Date(formData.date));
      
          const data = {
            ...formData,
            date: formattedDate, 
          };
          const body = JSON.stringify({ data });
          await getValidAccessToken(logout);
          const res = await fetch("http://localhost:8000/api/mark_Leave/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials:'include',
            body,
          });
      
          if (res.ok) {
            toast.current.show({ severity: 'success', summary: 'Done', detail: 'Leave Approved!!' });
            setFormData({
              staff_id: '',
              date: '',
              status: 'L',
              reason:''
            });
          } 
        };
  return (
    <section id='leave-body' className='section-body'>
        <div className="container pt-3">
        <form onSubmit={markLeave}>
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
            <div className="col-6 mt-3">
                <label htmlFor="reason" className="form-label mb-0">Reason:</label>
                <textarea value={formData.reason} onChange={handleFormChange} id="reason" className='form-control' rows={5} cols={50} required></textarea>
            </div>
            <div className="col-12 ">
              <button type="submit" className="btn btn-success mt-3">Approve</button>
            </div>
          </div>
        </form>
        </div>
        <Toast ref={toast}/>
    </section>
  )
}
