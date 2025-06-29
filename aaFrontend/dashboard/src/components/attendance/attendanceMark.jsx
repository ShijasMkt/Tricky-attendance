import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { BounceLoader } from "react-spinners";
import { getValidAccessToken } from "../auth/tokenValidation";
import { formatDate } from "../../utils/formatDT";

export default function AttendanceMark() {
	const [staffs, setStaffs] = useState([]);
	const [formData, setFormData] = useState({
		staff_id: "",
		date: new Date().toISOString().split("T")[0],
		status: "P",
	});
	const [isLoading, setIsLoading] = useState(false);
	const toast = useRef(null);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			const token = await getValidAccessToken();
			const res = await fetch("http://127.0.0.1:8000/api/fetch_staff/", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});
			if (res.ok && isMounted) {
				const data = await res.json();
				setStaffs(data);
			}
		})();
		return () => (isMounted = false);
	}, []);

	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSelectStaff = (e) => {
		setFormData((prev) => ({ ...prev, staff_id: e.target.value }));
	};

	const markAttendance = async (e) => {
		e.preventDefault();
		const token = await getValidAccessToken();
		const body = JSON.stringify({
			data: {
				...formData,
				date: formatDate(new Date(formData.date)),
			},
		});

		const res = await fetch("http://127.0.0.1:8000/api/mark_Attendance/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body,
		});

		if (res.ok) {
			toast.current.show({
				severity: "success",
				summary: "Done",
				detail: "Attendance Marked!!",
			});
			setFormData({
				staff_id: "",
				date: new Date().toISOString().split("T")[0],
				status: "P",
			});
		} else {
			toast.current.show({
				severity: "error",
				summary: "Error",
				detail: "Could not mark attendance. Try again.",
			});
		}
	};

	const scanFaceAndMarkAttendance = async () => {
		setIsLoading(true);
		const token = await getValidAccessToken();

		try {
			const res = await fetch("http://127.0.0.1:8000/api/face_rec_mark_Attendance/", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const data = await res.json();
			setIsLoading(false);

			if (data.success) {
				toast.current.show({
					severity: "success",
					summary: "Face Recognized",
					detail: `${data.name} marked as Present.`,
				});

			} else {
				toast.current.show({
					severity: "error",
					summary: "Failed",
					detail: data.message || "No match found",
				});
			}
		} catch (error) {
			setIsLoading(false);
			toast.current.show({
				severity: "error",
				summary: "Error",
				detail: "Something went wrong. Please try again.",
			});
		}
	};

	return (
		<section id="attendanceMark-body" className="section-body">
			<Toast ref={toast} />

			{isLoading && (
				<div className="d-flex justify-content-center align-items-center">
					<BounceLoader size={100} color="#7d1329" />
				</div>
			)}

			<div className="container pt-3" style={{ display: isLoading ? "none" : "block" }}>
				<form onSubmit={markAttendance}>
					<div className="row">
						<div className="col-4">
							<label htmlFor="staffSelect" className="form-label mb-0">
								Select Staff:
							</label>
							<select
								id="staffSelect"
								className="form-control"
								value={formData.staff_id}
								onChange={handleSelectStaff}
								required
							>
								<option value="" disabled>
									-- Select Staff --
								</option>
								{staffs
									.sort((a, b) => a.staff_id.localeCompare(b.staff_id))
									.map((staff) => (
										<option key={staff.id} value={staff.id}>
											{staff.staff_id} - {staff.name}
										</option>
									))}
							</select>
						</div>

						<div className="col-3">
							<label htmlFor="date" className="form-label mb-0">
								Select Date:
							</label>
							<input
								type="date"
								className="form-control"
								name="date"
								value={formData.date}
								onChange={handleFormChange}
								required
							/>
						</div>

						<div className="col-3">
							<label htmlFor="status" className="form-label mb-0">
								Status:
							</label>
							<select
								name="status"
								className="form-control"
								value={formData.status}
								onChange={handleFormChange}
							>
								<option value="P">Present</option>
								<option value="A">Absent</option>
								<option value="L">Leave</option>
							</select>
						</div>

						<div className="col-2 text-center">
							<button type="submit" className="btn btn-success mt-3 w-100 mb-2">
								Submit
							</button>
							<button
								type="button"
								className="btn btn-primary w-100"
								onClick={scanFaceAndMarkAttendance}
								disabled={isLoading}
							>
								{isLoading ? "Scanning..." : "Scan Face"}
							</button>
						</div>
					</div>
				</form>
			</div>
		</section>
	);
}
