import React, { useRef, useState, useEffect } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
import { getValidAccessToken } from "../auth/tokenValidation";
import { Toast } from "primereact/toast";
import { useAuth } from "../auth/AuthContext";


export default function FaceScan({ onClose }) {
	const {logout} =useAuth();
	const toast = useRef(null);
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const cameraRef = useRef(null);
	const faceDetectionRef = useRef(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let isCancelled = false;

		faceDetectionRef.current = new FaceDetection({
			locateFile: (file) =>
				`https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
		});

		faceDetectionRef.current.setOptions({
			model: "short",
			minDetectionConfidence: 0.5,
		});

		faceDetectionRef.current.onResults(onResults);

		cameraRef.current = new Camera(videoRef.current, {
			onFrame: async () => {
				if (!isCancelled) {
					await faceDetectionRef.current.send({ image: videoRef.current });
				}
			},
			width: 640,
			height: 380,
		});

		cameraRef.current.start();

		return () => {
			isCancelled = true;
			if (cameraRef.current) {
				cameraRef.current.stop();
				cameraRef.current = null;
			}
			if (videoRef.current?.srcObject) {
				videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
				videoRef.current.srcObject = null;
			}
			if (faceDetectionRef.current) {
				faceDetectionRef.current.close?.();
				faceDetectionRef.current = null;
			}
		};
	}, []);

	const onResults = (results) => {
		const canvasCtx = canvasRef.current.getContext("2d");
		canvasCtx.save();
		canvasCtx.clearRect(
			0,
			0,
			canvasRef.current.width,
			canvasRef.current.height
		);
		canvasCtx.drawImage(
			results.image,
			0,
			0,
			canvasRef.current.width,
			canvasRef.current.height
		);

		if (results.detections.length > 0) {
			for (const detection of results.detections) {
				const box = detection.boundingBox;
				const x = (box.xCenter - box.width / 2) * canvasRef.current.width;
				const y = (box.yCenter - box.height / 2) * canvasRef.current.height;
				const width = box.width * canvasRef.current.width;
				const height = box.height * canvasRef.current.height;

				canvasCtx.strokeStyle = "red";
				canvasCtx.lineWidth = 2;
				canvasCtx.strokeRect(x, y, width, height);
			}
		}
		canvasCtx.restore();
	};

	const handleCaptureAndSend = async () => {
		setIsLoading(true);
		const canvas = document.createElement("canvas");
		const video = videoRef.current;

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		const ctx = canvas.getContext("2d");
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

		canvas.toBlob(async (blob) => {
			const formData = new FormData();
			formData.append("image", blob, "frame.jpg");
			await getValidAccessToken(logout);
			try {
				const res = await fetch(
					"http://localhost:8000/api/face_rec_mark_Attendance/",
					{
						method: "POST",
						credentials:'include',
						body: formData,
					}
				);

				const data = await res.json();
				toast.current.show({
					severity: data.success ? "success" : "warn",
					summary: data.success ? "Welcome" : "Not Recognized",
					detail: data.name || data.message,
					life: 5000,
				});
			} catch {
				toast.current.show({
					severity: "error",
					summary: "Error",
					detail: "Failed to mark attendance",
					life: 3000,
				});
			} finally {
				setIsLoading(false);
				setTimeout(() => {
					onClose();
				}, 3500);
			}
		}, "image/jpeg");
	};

	return (
		<section id="face-scan">
			<Toast ref={toast} position="center" />
			<div className="container">
				<div className="text-center mt-3">
					<video ref={videoRef} style={{ display: "none" }} />
					<canvas ref={canvasRef} width={640} height={380} />
					<div className="mt-2">
						<button
							className="btn btn-success"
							onClick={handleCaptureAndSend}
							disabled={isLoading}
						>
							{isLoading ? "Uploading..." : "Capture & Recognize"}
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
