import React, { useEffect, useRef, useState } from "react";
import { formatDate, formatTime } from "../utils/formatDT";
import "./overview.css";
import { useNavigate, useLocation } from "react-router-dom";
import { getValidAccessToken } from "../auth/tokenValidation";
import { useAuth } from "../auth/AuthContext";


export default function Overview() {
	const {logout} =useAuth();
	const navigateTo = useNavigate();
	const [timeNow, setTimeNow] = useState(new Date());
	const [attendance, setAttendance] = useState({
		present: [],
		absent: [],
		leave: [],
	});

	const [totalEmployees, setTotalEmployees] = useState(0);
	const [attendanceRate, setAttendanceRate] = useState(0);

	function formatDateLong(date) {
		const d = new Date(date);
		const day = String(d.getDate()).padStart(2, "0"); 
		const month = d.toLocaleString("default", { month: "long" }); 
		const year = d.getFullYear();

		return `${day} ${month} ${year}`;
	}

	const getTodayDate = () => {
		return formatDate(new Date());
	};

	useEffect(() => {
		const interval = setInterval(() => {
			setTimeNow(new Date());
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const today = getTodayDate();
		fetchAttendance(today);
		fetchTotalEmployees();
	}, []);

	useEffect(() => {
		if (attendance.present.length > 0) {
			console.log(attendance);
			const rate = (attendance.present.length / totalEmployees) * 100;
			setAttendanceRate(rate);
		}
	}, [attendance.present.length, totalEmployees]);

	const fetchAttendance = async (date) => {
		await getValidAccessToken(logout);
		const body = JSON.stringify({ date });
		const res = await fetch("http://localhost:8000/api/fetch_Attendance/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials:'include',
			body,
		});
		if (res.ok) {
			const data = await res.json();
			const present = data.filter((item) => item.status === "P");
			const absent = data.filter((item) => item.status === "A");
			const leave = data.filter((item) => item.status === "L");

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

	const fetchTotalEmployees = async () => {
		await getValidAccessToken(logout);
		const res = await fetch(
			"http://localhost:8000/api/fetch_total_employees/",
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials:'include',
			}
		);
		if (res.ok) {
			const data = await res.json();
			setTotalEmployees(data);
		}
	};

	const toStaffPage = () => {
		navigateTo("/staff/view");
	};

	return (
		<section id="overview-body" className="section-body">
			<div className="container">
				<div className="row">
					<div className="col-9">
						<div className="col-12">
							<div className="card p-3">
								<div className="d-flex justify-content-around date-display">
									<span>{formatDateLong(timeNow)}</span>
									<span>{formatTime(timeNow)}</span>
								</div>
							</div>
						</div>
						<div className="col-12">
							<div className="p-3">
								<h6 className="mb-4">Today's Log</h6>

								{attendance.present.map((presentStaff) => (
									<div className="logged-block" key={presentStaff.staff_id}>
										<img
											src={`http://localhost:8000${presentStaff.staff_data.images[0].image}`}
											alt={`${presentStaff.staff_name}'s photo`}
											className="img-thumbnail rounded-circle"
											width={60}
											height={60}
										/>
										<span>#{presentStaff.staff_data.staff_id}</span>
										<span>{presentStaff.staff_name}</span>
										<span className="text-success">
											{formatTime(presentStaff.time)}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
					<div className="col-3">
						<div className="card p-3">
							<div className="card-header bg-white border-0 p-0">
								<h6 className="mb-2">Total Employees</h6>
							</div>
							<div className="card-body">
								<span className="card-num">{totalEmployees}</span>
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
								<span className="card-num">{attendanceRate}%</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
