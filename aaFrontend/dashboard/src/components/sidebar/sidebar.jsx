import React, { useState } from "react";
import "./sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
	const location = useLocation();
	const navigateTo = useNavigate();
	const [expandedMenu, setExpandedMenu] = useState(null);

	const menuItems = [
		{ label: "Dashboard", icon: "pi pi-home", path: "/" },
		{
			label: "Staff",
			icon: "pi pi-users",
			path: "/staff/view",
			subItems: [
				{ label: "View Staffs", path: "/staff/view" },
				{ label: "Staff Biometrics", path: "/staff/biometrics" },
			],
		},
		{
			label: "Attendance",
			icon: "pi pi-calendar",
			path: "/attendance/view",
			subItems: [
				{ label: "View Attendance", path: "/attendance/view" },
				{ label: "Leave Management", path: "/attendance/leave" },
			],
		},
		{ label: "Mark Attendance", icon:"pi pi-check-square",path: "/attendance/mark" },
	];

	const handleMenuClick = (item) => {
		if (item.subItems) {
			setExpandedMenu(expandedMenu === item.label ? null : item.label);
			navigateTo(item.path);
		} else {
			navigateTo(item.path);
			setExpandedMenu(null);
		}
	};

	const isActive = (item) => {
		if (item.subItems) {
			return (
				item.subItems.some((subItem) => location.pathname === subItem.path) ||
				expandedMenu === item.label
			);
		}
		return location.pathname === item.path;
	};

	return (
		<div className="sidebar-body">
			<div className="logo">
				<img
					className="img-fluid"
					src="/assets/logo.svg"
					alt="Logo"
					width={150}
				/>
			</div>
			<div className="menu-sec">
				<ul className="custom-menu">
					{menuItems.map((item, index) => (
						<React.Fragment key={index}>
							{/* Main menu item */}
							<li
								className={`menu-item ${isActive(item) ? "active" : ""}`}
								onClick={() => handleMenuClick(item)}
							>
								<i className={item.icon}></i>
								<span>{item.label}</span>
								{item.subItems && (
									<i
										className={`submenu-icon ${
											expandedMenu === item.label ? "expanded" : ""
										}`}
									></i>
								)}
							</li>

							{/* Submenu items */}
							{item.subItems && expandedMenu === item.label && (
								<ul className="submenu">
									{item.subItems.map((subItem, subIndex) => (
										<li
											key={subIndex}
											className={`menu-item ${
												location.pathname === subItem.path ? "active" : ""
											}`}
											onClick={() => navigateTo(subItem.path)}
										>
											<span>{subItem.label}</span>
										</li>
									))}
								</ul>
							)}
						</React.Fragment>
					))}
				</ul>
			</div>
		</div>
	);
}
