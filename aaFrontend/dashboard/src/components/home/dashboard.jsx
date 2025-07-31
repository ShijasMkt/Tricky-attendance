import React from 'react'
import Navbar from '../navbar/navbar';
import Sidebar from '../sidebar/sidebar';
import { Outlet } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className='container-fluid' >
      <div className="row">
        <div className="col-10 col-md-2 p-0"><Sidebar/></div>
        <div className="col-12 col-md-10">
          
            <div className="row pt-3">
              <div className="col-12 rounded">
                <Navbar/>
              </div>
            </div>
            
              <div className="col-12 pt-3">
                <Outlet/>
              </div>
            
          
        </div>
      </div>
        
        
    </div>
  )
}
