import React, { useEffect, useState, useRef } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Toast } from "primereact/toast";
import { drawImageOnCanvas } from "../../utils/imageDraw";
import "./staff.css";
import { getValidAccessToken } from "../auth/tokenValidation";

export default function StaffBiometrics() {
	const [staffs, setStaffs] = useState([]);
	const [isStaffSelected, setIsStaffSelected] = useState(false);
	const [selectedStaff, setSelectedStaff] = useState();
	const [addImg, setAddImg] = useState(false);
	const [formData, setFormData] = useState({
		staff_id: "",
		img: null,
	});
	const [imgSrc, setImgSrc] = useState();
	const [crop, setCrop] = useState({
		unit: "%",
		width: 75,
		height: 75,
		x: 10,
		y: 10,
	});
	const [completedCrop, setCompletedCrop] = useState(null);
	const [isImageLoaded, setIsImageLoaded] = useState(false);
	const [isCropCompleted, setIsCropCompleted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const imgRef = useRef(null);
	const canvasRef = useRef(null);
	const toast = useRef(null);
	const fileInputRef = useRef(null);

	const MAX_PHOTOS = 3;

	useEffect(() => {
		fetchStaffs();
	}, []);

	useEffect(() => {
		cancelClicked();
	}, [selectedStaff]);

	useEffect(() => {
		if (completedCrop && imgRef.current && canvasRef.current) {
			drawImageOnCanvas(imgRef.current, canvasRef.current, completedCrop);
		}
	}, [completedCrop]);

	const fetchStaffs = async () => {
		setLoading(true);
		try {
			const token = await getValidAccessToken();
			const res = await fetch("http://127.0.0.1:8000/api/fetch_staff/", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});
			if (res.ok) {
				const data = await res.json();
				console.log(data);
				setStaffs(data);
				setLoading(false);
				return data;
			}
		} catch (error) {
			toast.current.show({
				severity: "error",
				summary: "Error",
				detail: "Failed to fetch staff data",
				life: 3000,
			});
		}
		setLoading(false);
		return [];
	};

	const handleSelectStaff = (e) => {
		const staffId = e.target.value;
		const staff = staffs.find((s) => s.id.toString() === staffId);
		setFormData((prevData) => ({
			...prevData,
			staff_id: staffId,
		}));
		setSelectedStaff(staff);
		setIsStaffSelected(true);
	};

	const handleFileSelect = (e) => {
		if (e.target.files && e.target.files.length > 0) {
			const reader = new FileReader();
			reader.addEventListener("load", () => {
				const img = new Image();
				img.src = reader.result;

				img.onload = () => {
					setIsImageLoaded(true);
					const maxWidth = 500;
					const maxHeight = 500;
					let scaleFactor = 1;

					if (img.width > maxWidth || img.height > maxHeight) {
						const scaleX = maxWidth / img.width;
						const scaleY = maxHeight / img.height;
						scaleFactor = Math.min(scaleX, scaleY);
					}

					const canvas = document.createElement("canvas");
					const ctx = canvas.getContext("2d");

					canvas.width = img.width * scaleFactor;
					canvas.height = img.height * scaleFactor;

					ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

					const resizedImage = canvas.toDataURL();
					setImgSrc(resizedImage);

					// Reset crop state
					setCompletedCrop(null);
					setIsCropCompleted(false);

					// Set default crop
					const defaultCrop = {
						unit: "%",
						width: 75,
						height: 75,
						x: 10,
						y: 10,
					};
					setCrop(defaultCrop);

					// Need to wait for image to fully load before initial drawing
					setTimeout(() => {
						if (imgRef.current && canvasRef.current) {
							setCompletedCrop(defaultCrop);
							setIsCropCompleted(true);
						}
					}, 100);
				};
			});
			reader.readAsDataURL(e.target.files[0]);
		}
	};

	const handleCompleteCrop = (crop) => {
		if (imgRef.current && canvasRef.current) {
			setCompletedCrop(crop);
			setIsCropCompleted(true);
		}
	};

	const cancelClicked = () => {
		setImgSrc(null);
		setCrop({
			unit: "%",
			width: 75,
			height: 75,
			x: 10,
			y: 10,
		});
		setCompletedCrop(null);
		setIsImageLoaded(false);
		setIsCropCompleted(false);
		setAddImg(false);

		if (canvasRef.current) {
			const ctx = canvasRef.current.getContext("2d");
			ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
		}

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const getCroppedImageBlob = () => {
		if (!completedCrop || !canvasRef.current) return null;
		return new Promise((resolve) => {
			canvasRef.current.toBlob(
				(blob) => {
					resolve(blob);
				},
				"image/png",
				1
			);
		});
	};

	const saveImage = async () => {
		if (!completedCrop) {
			toast.current.show({
				severity: "warn",
				summary: "Warning",
				detail: "Please crop the image first",
				life: 3000,
			});
			return;
		}

		// Check if the staff already has the maximum number of photos
		if (selectedStaff.images && selectedStaff.images.length >= MAX_PHOTOS) {
			toast.current.show({
				severity: "warn",
				summary: "Upload Limit",
				detail: `Maximum ${MAX_PHOTOS} photos allowed per staff member`,
				life: 3000,
			});
			return;
		}

		setLoading(true);
		try {
			const blob = await getCroppedImageBlob();
			if (!blob) {
				toast.current.show({
					severity: "error",
					summary: "Crop Error",
					detail: "Unable to retrieve cropped image",
					life: 3000,
				});
				setLoading(false);
				return;
			}

			const data = new FormData();
			data.append("staffID", selectedStaff.id);
			data.append("img", blob, `${selectedStaff.name}_image.png`);
			const token = await getValidAccessToken();
			const res = await fetch("http://127.0.0.1:8000/api/upload_staff_img/", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: data,
			});

			if (res.ok) {
				toast.current.show({
					severity: "success",
					summary: "Success",
					detail: "Image uploaded successfully",
					life: 3000,
				});

				const updatedStaffs = await fetchStaffs();
				const updatedStaff = updatedStaffs.find(
					(staff) => staff.id === selectedStaff.id
				);

				if (updatedStaff) {
					setSelectedStaff(updatedStaff);
				}

				cancelClicked();
			} else {
				toast.current.show({
					severity: "error",
					summary: "Error",
					detail: "Failed to upload image",
					life: 3000,
				});
			}
		} catch (error) {
			toast.current.show({
				severity: "error",
				summary: "Error",
				detail: "An unexpected error occurred",
				life: 3000,
			});
		}
		setLoading(false);
	};

	const deleteImage = async (imageId) => {
		setDeleteLoading(true);
		try {
			const token = await getValidAccessToken();
			const res = await fetch(`http://127.0.0.1:8000/api/delete_staff_img/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					imageId: imageId,
					staffId: selectedStaff.id,
				}),
			});

			if (res.ok) {
				toast.current.show({
					severity: "success",
					summary: "Success",
					detail: "Image deleted successfully",
					life: 3000,
				});

				const updatedStaffs = await fetchStaffs();
				const updatedStaff = updatedStaffs.find(
					(staff) => staff.id === selectedStaff.id
				);

				if (updatedStaff) {
					setSelectedStaff(updatedStaff);
				}
			} else {
				toast.current.show({
					severity: "error",
					summary: "Error",
					detail: "Failed to delete image",
					life: 3000,
				});
			}
		} catch (error) {
			toast.current.show({
				severity: "error",
				summary: "Error",
				detail: "An unexpected error occurred",
				life: 3000,
			});
		}
		setDeleteLoading(false);
	};

	const triggerFileInput = () => {
		fileInputRef.current.click();
	};

	const canvasSize = Math.round(
		completedCrop ? Math.min(completedCrop.width, completedCrop.height) : 0
	);

	const canvasStyles = {
		width: canvasSize,
		height: canvasSize,
		borderRadius: "50%",
		display: completedCrop ? "block" : "none",
	};
	return (
		<section id="staffBio-body" className="section-body">
			<div className="container pt-3">
				<div className="card border-0">
					<div className="card-body">
						<div className="row mb-4">
							<div className="col-md-6">
								<label htmlFor="staffSelect" className="form-label fw-bold">
									Select Staff
								</label>
								<div className="input-group">
									<span className="input-group-text">
										<i className="bi bi-person"></i>
									</span>
									<select
										id="staffSelect"
										className="form-select"
										value={formData.staff_id}
										onChange={handleSelectStaff}
										disabled={loading}
									>
										<option value="" disabled>
											-- Select Staff --
										</option>
										{staffs.map((staff) => (
											<option key={staff.id} value={staff.id}>
												{staff.staff_id} - {staff.name}
											</option>
										))}
									</select>
								</div>
							</div>
						</div>

						{loading && (
							<div className="text-center my-4">
								<div className="spinner-border text-primary" role="status">
									<span className="visually-hidden">Loading...</span>
								</div>
								<p className="mt-2">Loading data...</p>
							</div>
						)}

						{isStaffSelected && !loading && (
							<div className="staff-details">
								<div className="row mb-4">
									<div className="col-md-6">
										<div className="card h-100">
											<div className="card-header bg-light">
												<h6 className="mb-0">Staff Information</h6>
											</div>
											<div className="card-body">
												<div className="mb-3">
													<strong>ID:</strong> {selectedStaff.staff_id}
												</div>
												<div className="mb-3">
													<strong>Name:</strong> {selectedStaff.name}
												</div>
											</div>
										</div>
									</div>

									<div className="col-md-6">
										<div className="card h-100">
											<div className="card-header bg-light d-flex justify-content-between align-items-center">
												<h6 className="mb-0">Staff Photo</h6>
												<div>
													{!addImg &&
														selectedStaff.images &&
														selectedStaff.images.length < MAX_PHOTOS && (
															<button
																className="btn btn-sm btn-primary"
																onClick={() => setAddImg(true)}
																disabled={loading || deleteLoading}
															>
																Add Photo
															</button>
														)}
													{!addImg &&
														selectedStaff.images &&
														selectedStaff.images.length >= MAX_PHOTOS && (
															<span className="badge bg-warning text-dark me-2">
																Max photos limit reached ({MAX_PHOTOS})
															</span>
														)}
												</div>
											</div>
											<div className="card-body">
												{addImg ? (
													<div className="image-upload-container">
														<div className="mb-3">
															<input
																type="file"
																className="form-control d-none"
																ref={fileInputRef}
																accept="image/*"
																onChange={handleFileSelect}
															/>
															{!imgSrc && (
																<div className="text-center">
																	<button
																		className="btn btn-outline-primary mb-3"
																		onClick={triggerFileInput}
																	>
																		<i className="bi bi-upload me-2"></i>
																		Select Image
																	</button>
																	<p className="text-muted small">
																		Please select a clear face image for better
																		recognition
																	</p>
																</div>
															)}
														</div>

														{imgSrc && (
															<div className="crop-container">
																<div className="text-center mb-3">
																	<p className="text-muted">
																		Drag to position and resize the circular
																		crop area
																	</p>
																</div>
																<div className="cropper-area">
																	<ReactCrop
																		crop={crop}
																		onChange={(c) => {
																			setCrop(c);
																			// Update canvas on every change
																			if (imgRef.current && canvasRef.current) {
																				setCompletedCrop(c);
																			}
																		}}
																		aspect={1}
																		onComplete={handleCompleteCrop}
																		locked={false}
																		circularCrop={true}
																	>
																		<img
																			ref={imgRef}
																			src={imgSrc}
																			alt="Upload preview"
																			className="img-fluid"
																			onLoad={() => {
																				// Set initial crop when image loads
																				if (
																					imgRef.current &&
																					canvasRef.current
																				) {
																					setCompletedCrop(crop);
																					setIsCropCompleted(true);
																					drawImageOnCanvas(
																						imgRef.current,
																						canvasRef.current,
																						crop
																					);
																				}
																			}}
																		/>
																	</ReactCrop>
																</div>

																<div className="preview-container text-center mt-3">
																	<h6>Preview</h6>
																	<div className="canvas-wrapper d-inline-block border">
																		<canvas
																			ref={canvasRef}
																			style={canvasStyles}
																			width={completedCrop?.width ?? 0}
																			height={completedCrop?.height ?? 0}
																		/>
																	</div>
																</div>

																<div className="action-buttons mt-4 d-flex justify-content-center gap-2">
																	<button
																		type="button"
																		className="btn btn-secondary"
																		onClick={cancelClicked}
																		disabled={loading}
																	>
																		Cancel
																	</button>
																	<button
																		type="button"
																		className="btn btn-success"
																		onClick={saveImage}
																		disabled={!completedCrop || loading}
																	>
																		{loading ? (
																			<>
																				<span
																					className="spinner-border spinner-border-sm me-2"
																					role="status"
																					aria-hidden="true"
																				></span>
																				Saving...
																			</>
																		) : (
																			"Save Photo"
																		)}
																	</button>
																</div>
															</div>
														)}
													</div>
												) : (
													<div className="text-center">
														{selectedStaff.images &&
														selectedStaff.images.length > 0 ? (
															<div className="staff-photos">
																<div className="row">
																	{selectedStaff.images.map((imgObj, index) => (
																		<div
																			key={index}
																			className={`${
																				selectedStaff.images.length === 1
																					? "col-sm-8"
																					: "col-sm-4"
																			} mb-3`}
																		>
																			<div className="staff-photo-item position-relative">
																				<img
																					src={`http://127.0.0.1:8000${imgObj.image}`}
																					alt={`${selectedStaff.name}'s photo`}
																					className="img-thumbnail rounded-circle"
																					width={120}
																					height={120}
																				/>
																				<button
																					className="btn btn-sm btn-danger position-absolute top-0 end-0"
																					onClick={() => deleteImage(imgObj.id)}
																					disabled={deleteLoading}
																					title="Delete photo"
																				>
																					{deleteLoading ? (
																						<span
																							className="spinner-border spinner-border-sm"
																							role="status"
																							aria-hidden="true"
																						></span>
																					) : (
																						<i className="bi bi-trash"></i>
																					)}
																				</button>
																			</div>
																			<div className="small text-muted mt-1">
																				Image {index + 1}
																			</div>
																		</div>
																	))}
																</div>
																<div className="text-muted mt-2 small">
																	{MAX_PHOTOS - selectedStaff.images.length} of{" "}
																	{MAX_PHOTOS} photos remaining
																</div>
															</div>
														) : (
															<div className="no-photo-container text-center py-4">
																<div className="avatar-placeholder mb-3">
																	<i className="bi bi-person-circle fs-1 text-secondary"></i>
																</div>
																<p className="text-muted">
																	No photos available
																</p>
															</div>
														)}
													</div>
												)}
											</div>
										</div>
									</div>
								</div>

								<div className="row">
									<div className="col-12">
										<div className="card">
											<div className="card-header bg-light">
												<h6 className="mb-0">Biometric Data</h6>
											</div>
											<div className="card-body">
												<div className="row">
													<div className="col-md-6">
														<div className="fingerprint-section">
															<h6 className="text-primary mb-3">
																Fingerprint Status
															</h6>
															<div className="alert alert-info">
																<i className="bi bi-fingerprint me-2"></i>
																Fingerprint functionality coming soon
															</div>
														</div>
													</div>
													<div className="col-md-6">
														<h6 className="text-primary mb-3">
															Other Biometrics
														</h6>
														<div className="alert alert-info">
															<i className="bi bi-credit-card-2-front me-2"></i>
															Additional biometric options will be available in
															future updates
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						{!isStaffSelected && !loading && (
							<div className="text-center py-5">
								<div className="empty-state">
									<i className="bi bi-person-circle fs-1 text-secondary mb-3"></i>
									<h5>No Staff Selected</h5>
									<p className="text-muted">
										Please select a staff member from the dropdown above to view
										and manage their biometric data
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
			<Toast ref={toast} />
		</section>
	);
}
