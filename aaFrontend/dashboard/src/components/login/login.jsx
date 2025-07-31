import React from 'react'
import { useState,useRef } from 'react';
import "./login.css"
import { Toast } from 'primereact/toast';
import { useAuth } from '../auth/AuthContext';
        

export default function Login() {
    const {login}=useAuth();
    const toast = useRef(null);
    const [formData, setFormData] = useState({
		uName: "",
		password: "",
	});
    const {uName,password} =formData;
    const handleChange = (e) => {
		const { id, value } = e.target;
		setFormData((prevState) => ({
			...prevState,
			[id]: value,
		}));
	};

    const checkLogin=async(e)=>{
        e.preventDefault();
        
            const body = JSON.stringify({ uName, password });
            const res = await fetch("http://localhost:8000/api/check_login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials:'include',
                body,
            });
           
            
            if(res.ok){
                toast.current.show({severity:'success', summary: 'Success', detail:'Logged In', life: 3000});
                login();
            }
            else{
                toast.current.show({severity:'error', summary: 'Error', detail:'Invalid credentials!', life: 3000});
            }
            
            
        
    }
  return (
    <div className='login-body'>
    <Toast ref={toast} />
    <div className='row justify-content-center align-items-center'>
        <div className="col-md-4">
            
                <div className="card">
                    <div className="card-body">
                        <div className="text-center">
                            <img src="/assets/logo.svg" alt="" width={200}/>
                        </div>
                        <form  className='mt-3' >
                        <div className="input-sec ">
                            <label htmlFor="uName" className='fw-bold'>Username</label>
                            <input value={uName} onChange={handleChange} type="text" id='uName' className='form-control ' placeholder='Enter Username' required/>
                        </div>
                        <div className="input-sec mt-3">
                            <label htmlFor="pass" className='fw-bold'>Password</label>
                            <input value={password} onChange={handleChange} type="password" id='password' className="form-control " placeholder='Enter Password' required/>
                        </div>
                        <div className="text-center">
                            <button className='btn btn-login mt-3' type='submit' onClick={checkLogin}>Login</button>
                        </div>
                        </form>
                        
                    </div>
                </div>
            
        </div>
    </div>
    
    
    </div>
  )
}
