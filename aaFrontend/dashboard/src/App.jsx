import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate, Link ,ScrollRestoration} from "react-router-dom";
import './App.css'
import "bootstrap/dist/css/bootstrap.min.css";
import 'primereact/resources/themes/bootstrap4-light-blue/theme.css';
import 'primeicons/primeicons.css';
import Login from './components/login/login';
import Dashboard from './components/home/dashboard';
import Overview from './components/home/overview';
import Staff from './components/staff/staff';
import StaffBiometrics from './components/staff/staffBiometrics';
import AttendanceView from './components/attendance/attendanceView';
import AttendanceMark from './components/attendance/attendanceMark';
import Leave from './components/attendance/leave';
import { useAuth } from './components/auth/AuthContext';
import { DotLoader } from 'react-spinners';

function App() {
  
  const {isLoggedIn}=useAuth();

  if (isLoggedIn==null) return (
    <div className='loader-page'>
      <DotLoader/>
    </div>
  )
  return (
    <>
    
      <Router>
        <Routes>
          <Route path='/' element={isLoggedIn?<Dashboard/>:<Login/>}>
            <Route index element={<Overview/>}/>
            <Route path='*' element={<Navigate to="/" />}/>
            <Route path='staff/view' element={<Staff/>}/>
            <Route path='staff/biometrics' element={<StaffBiometrics/>}/>
            <Route path='attendance/view' element={<AttendanceView />} />
            <Route path='attendance/mark' element={<AttendanceMark />} />
            <Route path='attendance/leave' element={<Leave />} />
          </Route>
        </Routes>
      </Router>
      
    </>
  )
}

export default App
