import React, { useEffect, useRef, useState } from "react";
import "./attendance.css";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { formatDate, formatTime } from "../../utils/formatDT";
import { Toast } from "primereact/toast";

export default function AttendanceView() {
	const toast = useRef(null);
	const [attendance, setAttendance] = useState({
		present: [],
		absent: [],
		leave: [],
	});
	const [editPage, setEditPage] = useState("");
	const [confirmPassDialog, setConfirmPassDialog] = useState(false);
	const [editDialog, setEditDialog] = useState(false);
	const [confirmPass, setConfirmPass] = useState("");
	const [editAttendanceList, setEditAttendanceList] = useState([]);

	const getTodayDate = () => {
		return formatDate(new Date());
	};

	const [selectedDate, setSelectedDate] = useState(new Date());

	useEffect(() => {
		const today = getTodayDate();
		fetchAttendance(today);
	}, []);

	const fetchAttendance = async (date) => {
		const body = JSON.stringify({ date });
		const res = await fetch("http://127.0.0.1:8000/api/fetch_Attendance/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
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

	const handleDateChange = (e) => {
		const newDate = e.value;
		setSelectedDate(newDate);
		const formattedDate = formatDate(newDate);
		fetchAttendance(formattedDate);
	};

	const editClicked = (cardClicked) => {
		setEditPage(cardClicked);
		setConfirmPassDialog(true);
	};

	const confirmPassDialogFooter = () => {
		return (
			<>
				<button onClick={checkUser} className="btn btn-sm btn-primary">
					Confirm
				</button>
			</>
		);
	};

	const checkUser = () => {
    if (confirmPass === "4552") {
      setConfirmPassDialog(false);
      toast.current.show({
        severity: "success",
        summary: "Verified",
        detail: "User is verified",
      });
  
      const updatedList = attendance[editPage.toLowerCase()].map((item) => {
        let finalTimestamp = item.timestamp;
  
        // Use 'time' if 'timestamp' is not available
        if (!finalTimestamp && item.time) {
          finalTimestamp = item.time;
        }
  
        // If neither timestamp nor time exists, fallback to 9:00 or 0:00
        if (!finalTimestamp) {
          const fallbackTime = new Date(selectedDate);
          const defaultHour = editPage === "Present" ? 9 : 0;
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
    } else {
      toast.current.show({
        severity: "error",
        summary: "Unauthorized",
        detail: "Please enter the correct password!!",
      });
    }
  };
  
  
  

	const updateStatus = (index, newStatus) => {
		const updatedList = [...editAttendanceList];
		updatedList[index].status = newStatus;
		setEditAttendanceList(updatedList);
	};

	
  const updateTimestamp = (index, newTime) => {
    const updatedList = [...editAttendanceList];
    if (newTime) {
      const date = new Date(selectedDate); // base date
      date.setHours(newTime.getHours());
      date.setMinutes(newTime.getMinutes());
      date.setSeconds(0);
      date.setMilliseconds(0);
      updatedList[index].timestamp = date.toISOString();
    }
    setEditAttendanceList(updatedList);
  };
  

	const submitEditChanges = async () => {
    const formattedDate = formatDate(selectedDate); // Keep the original selected date
  
    const data = {
      date: formattedDate,
      data: editAttendanceList.map(item => ({
        staff_id: item.staff_id,
        status: item.status,
        timestamp: item.timestamp,  
      })),
    };
    

    const response = await fetch("http://127.0.0.1:8000/api/update_Attendance/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  
    if (response.ok) {
      toast.current.show({ severity: 'success', summary: 'Updated', detail: 'Attendance updated successfully' });
      setEditDialog(false);
      fetchAttendance(formattedDate); // Refresh with updated data
    } else {
      toast.current.show({ severity: 'error', summary: 'Failed', detail: 'Failed to update attendance' });
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
							<div className="col-4">
								<div className="card present-card">
									<h4 className="card-title">Present </h4>
									<i
										className="pi pi-pencil edit-btn"
										onClick={() => editClicked("Present")}
									></i>
									<div className="card-body">
										{attendance.present.length > 0 ? (
											attendance.present.map((staff) => (
												<div key={staff.staff_id}>
													{staff.staff_name} - <b>{formatTime(staff.time)}</b>{" "}
												</div>
											))
										) : (
											<span>No staff present</span>
										)}
									</div>
								</div>
							</div>
							<div className="col-4">
								<div className="card absent-card">
									<h4 className="card-title">Absent</h4>
									<i className="pi pi-pencil edit-btn" onClick={() => editClicked("Absent")}></i>
									<div className="card-body">
										{attendance.absent.length > 0 ? (
											attendance.absent.map((staff) => (
												<div key={staff.staff_id}>{staff.staff_name}</div>
											))
										) : (
											<span>No staff absent</span>
										)}
									</div>
								</div>
							</div>
							<div className="col-4">
								<div className="card leave-card">
									<h4 className="card-title">Leave</h4>
									<i className="pi pi-pencil edit-btn" onClick={() => editClicked("Leave")}></i>
									<div className="card-body">
										{attendance.leave.length > 0 ? (
											attendance.leave.map((staff) => (
												<div key={staff.staff_id}>
													{staff.staff_name} - <span>({staff.remarks})</span>
												</div>
											))
										) : (
											<span>No staff on leave</span>
										)}
									</div>
								</div>
							</div>
						</div>
					) : (
						<span>!! No Attendance data for the given date</span>
					)}
				</div>
			</section>
			<Dialog
				header="Are you the User?"
				visible={confirmPassDialog}
				onHide={() => setConfirmPassDialog(false)}
				footer={confirmPassDialogFooter}
			>
				<label htmlFor="confirmPass">Enter Password:</label>
				<input
					id="confirmPass"
					type="password"
					onChange={(e) => {
						setConfirmPass(e.target.value);
					}}
					className="mt-2 form-control"
				/>
			</Dialog>
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
