import React, { useEffect,useState,useRef } from 'react'
import { useLocation } from 'react-router-dom';
import './navbar.css'
import { Menu } from 'primereact/menu';
import { useAuth } from '../auth/AuthContext';
        

export default function Navbar() {
    const{logout}=useAuth();
    const menu = useRef(null);
    const [page,setPage]=useState('');
    const location = useLocation();

    const handleLogout=async()=>{
        logout();
    }
    let menuItems = [
        { label: 'Settings', icon: 'pi pi-cog' },
        { label: 'Logout', icon: 'pi pi-sign-out', command: handleLogout}
    ];

    
    useEffect(()=>{
        switch (location.pathname) {
            case '/':
                setPage('Dashboard')
                break;
            case '/staff/view':
                setPage('Staff Overview')
                break;
            case '/staff/biometrics':
                setPage('Staff Biometrics')
                break;    
            case '/attendance/view':
                setPage('Attendance Overview')
                break;
            case '/attendance/mark':
                setPage('Mark Attendance')
                break;
            case '/attendance/leave':
                setPage('Leave Management')
                break;
            default:
                break;
        }
    },[location])
  return (
    
      <div className='navbar-body'>
        <div className="d-flex justify-content-between align-items-center">
            <div >
            <h4 className='mb-0 fw-bold'>{page}</h4>
            </div>
            <div onClick={(event) => menu.current.toggle(event)} className='d-flex gap-2 admin-box'>
                <div className='text-end'>
                <h6 className='fw-bold'>Admin</h6>
                <span>(Super Admin)</span>
                </div>
                
                <img src="/assets/admin.png" alt="admin" width={40} height={'100%'}/>
                
            
            </div>
        </div>
        <Menu model={menuItems} popup ref={menu} />
      </div>
    

  

    
       
    
  )}
        
 
