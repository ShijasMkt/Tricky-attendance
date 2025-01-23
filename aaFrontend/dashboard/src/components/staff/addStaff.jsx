import React from 'react'
import './staff.css'
import { useState } from 'react'
import Cookies from 'js-cookie'
import Swal from "sweetalert2";

export default function AddStaff({onClose}) {
    
    const [formData,setFormData]=useState({
        'staff_id':'',
        'name':'',
        'phone':'',
        'email':'',
        'designation':'',
        'birthday':'',
        'address':'',
        'salary':0,
        'joined_date':''
    })
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [id]: value,
        }));
    };

    const saveStaff=async(e)=>{
        const token=Cookies.get("accessToken");
        e.preventDefault()
        const body = JSON.stringify({ formData });
            const res = await fetch("http://127.0.0.1:8080/api/create_staff/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    
                },
                body,
            });
            if(res.ok){
                Swal.fire({
                    icon: "success",
                    title: "Staff Added",
                    text: "you've successfully added a staff",
                  })
                  .then(
                    onClose()
                  )
            }
    }
  return (
    <section id='add-staff'>
    <div className='container'>
      
        <form action="" onSubmit={saveStaff}>
        <div className="row">
        <div className="col-4 form-group">
            <label htmlFor="staff_id" className='form-label mb-0'>Staff ID</label>
            <input value={formData.staff_id} onChange={handleChange} type="text" id='staff_id' placeholder='Enter Staff ID' className='form-control' required/>
        </div>
        <div className="col-4 form-group">
            <label htmlFor="name" className='form-label mb-0'>Full Name</label>
            <input value={formData.name} onChange={handleChange} type="text" id='name' placeholder='Enter Full Name' className='form-control ' required/>
        </div>
        <div className="col-4 form-group">
            <label htmlFor="phone" className='form-label mb-0'>Phone No</label>
            <input value={formData.phone} onChange={handleChange} type="text" maxLength={10} id='phone' placeholder='Enter Phone Number' className='form-control' required/>
        </div>
      </div>

      
      <div className="row pt-3">
        
        <div className="col-4 form-group">
            <label htmlFor="email" className='form-label mb-0'>Email</label>
            <input value={formData.email} onChange={handleChange} type="email" id='email' placeholder='Enter Email' className='form-control' required/>
        </div>
        <div className="col-4 form-group">
            <label htmlFor="designation" className='form-label mb-0' >Designation</label>
            <input value={formData.designation} onChange={handleChange} type="text" id='designation' placeholder='Enter Designation' className='form-control' required/>
        </div>
        <div className="col-4 form-group">
            <label htmlFor="birthday" className='form-label mb-0'>Birthday</label>
            <input value={formData.birthday} onChange={handleChange} type="date" id='birthday'  className='form-control' required/>
        </div>
      </div>

      <div className="row pt-3">
        
        <div className="col-6 form-group">
            <label htmlFor="address" className='form-label mb-0'>Address</label>
            <textarea value={formData.address} onChange={handleChange} id='address' placeholder='Enter Address' rows={5} cols={50} className='form-control' required/>
        </div>
        <div className="col-6">
            <div className="row">
            <div className="col-8 form-group">
            <label htmlFor="salary" className='form-label mb-0'>Salary</label>
            <input value={formData.salary} onChange={handleChange} type="number" id='salary' placeholder='' className='form-control' required/>
            </div>
            <div className="col-8 form-group mt-3">
            <label htmlFor="joined_date" className='form-label mb-0'>Date Joined </label>
            <input value={formData.joined_date} onChange={handleChange} type="date" id='joined_date' placeholder='' className='form-control' required/>
            </div>
            </div>
        </div>
        
      </div>

      <div className='text-center pt-3'>
        <button type='submit' className='btn btn-theme'>Save</button>
      </div>
      </form>
    </div>
    </section>
  )
}
