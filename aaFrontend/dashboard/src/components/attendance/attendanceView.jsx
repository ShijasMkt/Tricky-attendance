import React, { useEffect, useRef, useState } from "react";
import "./attendance.css";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { formatDate, formatTime } from "../utils/formatDT";
import { Toast } from "primereact/toast";
import { getValidAccessToken } from "../auth/tokenValidation";
import { useAuth } from "../auth/AuthContext";

export default function AttendanceView() {
	const {logout} =useAuth();
	const toast = useRef(null);
	const [attendance, setAttendance] = useState({ present: [], absent: [], leave: [] });
	const [editPage, setEditPage] = useState("");
	const [editDialog, setEditDialog] = useState(false);
	const [editAttendanceList, setEditAttendanceList] = useState([]);
	const [selectedDate, setSelectedDate] = useState(new Date());

	useEffect(() => {
		const today = formatDate(new Date());
		fetchAttendance(today);
	}, []);

	const fetchAttendance = async (date) => {
		await getValidAccessToken(logout);
		const res = await fetch("http://localhost:8000/api/fetch_Attendance/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials:'include',
			body: JSON.stringify({ date }),
		});

		if (res.ok) {
			const data = await res.json();
			const present = data.filter((item) => item.status === "P");
			const absent = data.filter((item) => item.status === "A");
			const leave = data.filter((item) => item.status === "L");
			setAttendance({ present, absent, leave });
		} else {
			setAttendance({ present: [], absent: [], leave: [] });
		}
	};

	const handleDateChange = (e) => {
		const newDate = e.value;
		setSelectedDate(newDate);
		fetchAttendance(formatDate(newDate));
	};

	const editClicked = (cardClicked) => {
		setEditPage(cardClicked);

		const updatedList = attendance[cardClicked.toLowerCase()].map((item) => {
			let finalTimestamp = item.timestamp || item.time;

			if (!finalTimestamp) {
				const fallbackTime = new Date(selectedDate);
				const defaultHour = cardClicked === "Present" ? 9 : 0;
				fallbackTime.setHours(defaultHour, 0, 0, 0);
				finalTimestamp = fallbackTime.toISOString();
			}

			return {
				...item,
				timestamp: finalTimestamp,
			};
		});

		setEditAttendanceList(updatedList);
		setEditDialog(true);
	};

	const updateStatus = (index, newStatus) => {
		const updatedList = [...editAttendanceList];
		updatedList[index].status = newStatus;
		setEditAttendanceList(updatedList);
	};

	const updateTimestamp = (index, newTime) => {
		const updatedList = [...editAttendanceList];
		if (newTime) {
			const date = new Date(selectedDate);
			date.setHours(newTime.getHours());
			date.setMinutes(newTime.getMinutes());
			date.setSeconds(0);
			date.setMilliseconds(0);
			updatedList[index].timestamp = date.toISOString();
		}
		setEditAttendanceList(updatedList);
	};

	const submitEditChanges = async () => {
		const formattedDate = formatDate(selectedDate);
		const token = await getValidAccessToken();
		if (!token) return;
		const data = {
			date: formattedDate,
			data: editAttendanceList.map((item) => ({
				staff_id: item.staff_id,
				status: item.status,
				timestamp: item.timestamp,
			})),
		};

		const response = await fetch("http://localhost:8000/api/update_Attendance/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials:'include',
			body: JSON.stringify(data),
		});

		if (response.ok) {
			toast.current.show({ severity: "success", summary: "Updated", detail: "Attendance updated successfully" });
			setEditDialog(false);
			fetchAttendance(formattedDate);
		} else {
			toast.current.show({ severity: "error", summary: "Failed", detail: "Failed to update attendance" });
		}
	};

	return (
		<>
			<section id="attendanceView-body" className="section-body">
				<div className="container pt-3">
					<div className="d-flex justify-content-center">
						<Calendar
							value={selectedDate}
							onChange={handleDateChange}
							dateFormat="yy-mm-dd"
							showIcon
						/>
					</div>

					{attendance ? (
						<div className="row pt-3">
							{["present", "absent", "leave"].map((type) => (
								<div key={type} className="col-lg-4 mt-2 mt-lg-0">
									<div className={`card ${type}-card`}>
										<h4 className="card-title">{type.charAt(0).toUpperCase() + type.slice(1)}</h4>
										<i className="pi pi-pencil edit-btn" onClick={() => editClicked(type.charAt(0).toUpperCase() + type.slice(1))}></i>
										<div className="card-body">
											{attendance[type].length > 0 ? (
												attendance[type].map((staff) => (
													<div key={staff.staff_id}>
														{staff.staff_name}
														{type === "present" && <b> - {formatTime(staff.time)}</b>}
														{type === "leave" && staff.remarks && <span> ({staff.remarks})</span>}
													</div>
												))
											) : (
												<span>No staff {type}</span>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<span>!! No Attendance data for the given date</span>
					)}
				</div>
			</section>

			<Dialog
				header={`Edit ${editPage} Attendance`}
				visible={editDialog}
				onHide={() => setEditDialog(false)}
				style={{ width: "60vw" }}
			>
				<div>
					{editAttendanceList.length > 0 ? (
						editAttendanceList.map((staff, index) => (
							<div key={staff.staff_id} className="mb-3 p-2 border rounded">
								<div className="d-flex justify-content-between align-items-center">
									<strong>{staff.staff_name}</strong>
								</div>
								<div className="row mt-2">
									<div className="col-md-6">
										<label>Status</label>
										<select
											className="form-select"
											value={staff.status}
											onChange={(e) => updateStatus(index, e.target.value)}
										>
											<option value="P">Present</option>
											<option value="A">Absent</option>
											<option value="L">Leave</option>
										</select>
									</div>
									<div className="col-md-6">
										<label>Timestamp</label>
										<Calendar
											value={staff.timestamp ? new Date(staff.timestamp) : null}
											onChange={(e) => updateTimestamp(index, e.value)}
											timeOnly
											hourFormat="24"
											className="w-100"
										/>
									</div>
								</div>
							</div>
						))
					) : (
						<span>No data available for editing</span>
					)}
					<div className="mt-3 text-end">
						<button className="btn btn-success" onClick={submitEditChanges}>
							Submit Changes
						</button>
					</div>
				</div>
			</Dialog>

			<Toast ref={toast} />
		</>
	);
}
