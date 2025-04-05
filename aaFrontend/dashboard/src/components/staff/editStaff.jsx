import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export default function EditStaff({ staff, onClose }) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if(staff){
            setFormData(staff)
        }
    }, [staff]);

    const saveEdit=async(e)=>{
                e.preventDefault()
                const body = JSON.stringify({ formData });
                    const res = await fetch("http://127.0.0.1:8000/api/edit_staff/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            
                        },
                        body,
                    });
                    if(res.ok){
                        onClose();
                    }
    }

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [id]: value,
        }));
    };
  return (
    <section id='add-staff'>
    <div className='container'>
      
        {formData.name?<>
        <form action="" onSubmit={saveEdit}>
        <div className="row">
        <div className="col-4 form-group">
            <label htmlFor="staff_id" className='form-label mb-0'>Staff ID</label>
            <input value={formData.staff_id} onChange={handleChange} type="text" id='staff_id' placeholder='' className='form-control' disabled/>
        </div>
        <div className="col-4 form-group">
            <label htmlFor="name" className='form-label mb-0'>Full Name</label>
            <input value={formData.name} onChange={handleChange} type="text" id='name' placeholder='' className='form-control ' required/>
        </div>
        <div className="col-4 form-group">
            <label htmlFor="phone" className='form-label mb-0'>Phone</label>
            <input value={formData.phone} onChange={handleChange} type="text" maxLength={10} id='phone' placeholder='' className='form-control' required/>
        </div>
      </div>

      
      <div className="row pt-3">
        
        <div className="col-4 form-group">
            <label htmlFor="email" className='form-label mb-0'>Email</label>
            <input value={formData.email} onChange={handleChange} type="email" id='email' placeholder='' className='form-control' required/>
        </div>
        <div className="col-4 form-group">
            <label htmlFor="designation" className='form-label mb-0' >Designation</label>
            <input value={formData.designation} onChange={handleChange} type="text" id='designation' placeholder='' className='form-control' required/>
        </div>
        <div className="col-4 form-group">
            <label htmlFor="birthday" className='form-label mb-0'>Birthday</label>
            <input value={formData.birthday} onChange={handleChange} type="date" id='birthday' placeholder='' className='form-control' required/>
        </div>
      </div>

      <div className="row pt-3">
        
        <div className="col-6 form-group">
            <label htmlFor="address" className='form-label mb-0'>Address</label>
            <textarea value={formData.address} onChange={handleChange} id='address' rows={5} cols={50} className='form-control' required/>
        </div>
        <div className="col-6">
            <div className="row">
            <div className="col-6 form-group">
            <label htmlFor="salary" className='form-label mb-0'>Salary</label>
            <input value={formData.salary} onChange={handleChange} type="number" id='salary' placeholder='' className='form-control' required/>
            </div>
            <div className="col-6 form-group ">
            <label htmlFor="joined_date" className='form-label mb-0'>Date Joined </label>
            <input value={formData.joined_date} onChange={handleChange} type="date" id='joined_date' placeholder='' className='form-control' required/>
            </div>
            <div className="col-6 form-group mt-3">
            <label htmlFor="status" className='form-label mb-0'>Status </label>
            <select
                id="status"
                className="form-select"
                value={formData.status ? "true" : "false"}
                onChange={(e) => 
                    setFormData((prevState) => ({
                        ...prevState,
                        status: e.target.value === "true",
                    }))
                }
            >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
            </select>
            </div>
            </div>
        </div>
        
      </div>

      <div className='text-center pt-3'>
        <button type='submit' className='btn btn-theme'>Save</button>
      </div>
      </form>
        </>:<></>}
    </div>
    </section>
  )
}
