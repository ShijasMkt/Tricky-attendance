import React, { useEffect, useRef, useState } from "react";
import { formatDate, formatTime } from "../../utils/formatDT";
import "./overview.css";
import { useNavigate, useLocation } from "react-router-dom";
import { getValidAccessToken } from "../auth/tokenValidation";

export default function Overview() {
	const navigateTo = useNavigate();

	const [attendance, setAttendance] = useState({
		present: [],
		absent: [],
		leave: [],
	});

  

	const getTodayDate = () => {
		return formatDate(new Date());
	};

	useEffect(() => {
		const today = getTodayDate();
		fetchAttendance(today);
	}, []);

	const fetchAttendance = async (date) => {
		const body = JSON.stringify({ date });
		const token=await getValidAccessToken();
		const res = await fetch("http://127.0.0.1:8000/api/fetch_Attendance/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body,
		});
		if (res.ok) {
			const data = await res.json();
			const present = data.filter((item) => item.status === "P");
			const absent = data.filter((item) => item.status === "A");
			const leave = data.filter((item) => item.status === "L");

			console.log(present);

			setAttendance({
				present,
				absent,
				leave,
			});
		} else {
			setAttendance({
				present: [],
				absent: [],
				leave: [],
			});
		}
	};

	const toStaffPage = () => {
		navigateTo("/staff/view");
	};

	return (
		<section id="overview-body" className="section-body">
			<div className="row">
				<div className="col-9">
					<div className="card p-3">
						<div className="card-header bg-white border-0 p-0">
							<h6 className="mb-2">Today's Attendance</h6>
						</div>
            <div className="card-body">
							
						</div>
					</div>
				</div>
				<div className="col-3">
					<div className="card p-3">
						<div className="card-header bg-white border-0 p-0">
							<h6 className="mb-2">Total Employees</h6>
						</div>
						<div className="card-body">
							<span className="card-num">5</span>
							<span className="card-link" onClick={toStaffPage}>
								See detail →
							</span>
						</div>
					</div>
          <div className="card p-3 mt-3">
						<div className="card-header bg-white border-0 p-0">
							<h6 className="mb-2">Attendance Rate</h6>
						</div>
						<div className="card-body">
							<span className="card-num">95%</span>
						</div>
					</div>
				</div>
			
			</div>
			
		</section>
	);
}
