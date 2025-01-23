import React, { useEffect,useState,useRef } from 'react'
import { useLocation } from 'react-router-dom';
import './navbar.css'
import { logoutFunc } from '../../utils/logout';
import { Menu } from 'primereact/menu';
        

export default function Navbar() {
    const menu = useRef(null);
    const [page,setPage]=useState('');
    const location = useLocation();
    let menuItems = [
        { label: 'Settings', icon: 'pi pi-cog' },
        { label: 'Logout', icon: 'pi pi-sign-out', command: logoutFunc}
    ];
    useEffect(()=>{
        switch (location.pathname) {
            case '/':
                setPage('Dashboard')
                break;
            case '/staff':
                setPage('Staff Overview')
                break;
            case '/attendance/view':
                setPage('Attendance Overview')
                break;
            case '/attendance/mark':
                setPage('Mark Attendance')
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
                
                <img src="src/assets/admin.png" alt="" width={50} />
                
            
            </div>
        </div>
        <Menu model={menuItems} popup ref={menu} />
      </div>
    

  

    
       
    
  )}
        
 
