import React from 'react';
import './sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
    const location = useLocation();
    const navigateTo = useNavigate();

    const menuItems = [
        { label: 'Dashboard', icon: 'pi pi-home', path: '/' },
        { label: 'Staff', icon: 'pi pi-users', path: '/staff' },
    ];

    return (
        <div className="sidebar-body">
            <div className="text-center pt-5">
                <img src="src/assets/logo.svg" alt="Logo" width={150} />
            </div>
            <div className="menu-sec mt-3">
                <ul className="custom-menu">
                    {menuItems.map((item, index) => (
                        <li
                            key={index}
                            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => navigateTo(item.path)}
                        >
                            <i className={item.icon}></i>
                            <span>{item.label}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
