import React from 'react'
import { useEffect, useState,useRef} from "react";
import "./staff.css";
import { Toast } from 'primereact/toast';
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { drawImageOnCanvas } from '../../utils/imageDraw';

export default function StaffBiometrics() {

  useEffect(() => {
    fetchStaffs();
  }, []);
  
  
  const [staffs, setStaffs] = useState([]);
  const [isStaffSelected,setIsStaffSelected]=useState(false);
  const [selectedStaff,setSelectedStaff]=useState();
  const [addImg,setAddImg]=useState(false);
  const [formData, setFormData] = useState({
    staff_id: '',
    img:null
  });
  const [imgSrc, setImgSrc] = useState();
	const [crop, setCrop] = useState({
		unit: "%",
		width: 50,
		height: 50,
		x: 10,
		y: 10,
	});
	const [completedCrop, setCompletedCrop] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isCropCompleted,setIsCropCompleted]=useState(false);
	const imgRef = useRef(null);
	const canvasRef = useRef(null);
  const toast = useRef(null);

  useEffect(()=>{
    cancelClicked()
  },[selectedStaff])

const fetchStaffs = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/fetch_staff/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      const data = await res.json();
      setStaffs(data);
      return data; 
    }
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
    setIsStaffSelected(true)
    
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = () => {
          
          setIsImageLoaded(true)
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
          setImgSrc(resizedImage); // Update the state with the resized image

          setCrop({
            unit: "%",
            width: 75, // Default width, this can be adjusted
            height: 75, // Default height, this can be adjusted
            x: 10, // Default position (can be adjusted)
            y: 10, // Default position (can be adjusted)
          });

        };
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCompleteCrop = (crop) => {
    setIsCropCompleted(true)
    drawImageOnCanvas(imgRef.current, canvasRef.current, crop);
    setCompletedCrop(crop);
  };

  const canvasStyles = {
    width: Math.round(completedCrop?.width ?? 0),
    height: Math.round(completedCrop?.height ?? 0),
    borderRadius: "50%",
  };

  const cancelClicked = () => {
    setImgSrc(null);
    setCrop({
      unit: "%",
      width: 50,
      height: 50,
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

  const saveImage=async()=>{
    if (completedCrop) {
      const blob = await getCroppedImageBlob();
      if (!blob) {
        Swal.fire({
          icon: "error",
          title: "Crop Error",
          text: "Unable to retrieve cropped image.",
        });
        return;
      }

      const data = new FormData();
      data.append("staffID", selectedStaff.id);
      data.append("img", blob, `${selectedStaff.name}_image.png`);
      

      const res = await fetch("http://127.0.0.1:8000/api/upload_staff_img/", {
        method: "POST",
        body: data,
      });
      if(res.ok){
        toast.current.show({ severity: 'success', summary: 'Done', detail: 'Image Uploaded!!' });
        
        const updatedStaffs = await fetchStaffs();
        const updatedStaff = updatedStaffs.find(staff => staff.id === selectedStaff.id);
  
        if (updatedStaff) {
          setSelectedStaff(updatedStaff);
        }
  
        cancelClicked();
      }
    }
  }

  
  return (
    <section id='staffBio-body' className='section-body'>
      <div className="container pt-3">
      <div className="row">
        <div className="col-4">
          <label htmlFor="staffSelect" className="form-label mb-0">Select Staff:</label>
              <select
                id="staffSelect"
                className="form-control"
                value={formData.staff_id}
                onChange={handleSelectStaff}
                required
              >
                <option value="" disabled>-- Select Staff --</option>
                {staffs.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.staff_id} - {staff.name}
                  </option>
                ))}
              </select>
        </div>
        {isStaffSelected?<>
        <div className="col-12 mt-3 staff-bio-view">
          <div><h6>Staff Name:</h6> {selectedStaff.name}</div>
          <div><h6>Staff Photo:</h6>
          {addImg?<>
          <div className='add-img'>
            <div>
            <input
              type="file"
              id="img"
              accept="image/*"
              required
              onChange={handleFileSelect}
            />
            </div>
            <span className='edit-span' onClick={cancelClicked}>Cancel</span>
            <div className="CropperWrapper">
              <ReactCrop
                crop={crop}
                onChange={setCrop}
                aspect={1}
                onComplete={handleCompleteCrop}
                locked={true}
                circularCrop={true}
              >
              {imgSrc && (
                <>
                <img ref={imgRef} src={imgSrc} alt="cropper image" width={350}/>
                </>
              )}
            </ReactCrop>
            {!isCropCompleted && isImageLoaded &&(
              <><span>Please set the crop!!</span></>
            )}
            
              <div className="CanvasWrapper">
                <canvas ref={canvasRef} style={canvasStyles} />
              </div>
          
          </div>
            {isCropCompleted && (
              <>
              <div className="col-12 mt-2 ms-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={saveImage}
                >
                  SAVE
                </button>
                </div>
              </>
            )}   
          </div>
          </>:<>
          {selectedStaff.staff_img?<>
            <img
              src={`http://127.0.0.1:8000${selectedStaff.staff_img}`}
              alt=""
              className="staffImg"
              width={150}
              height={150}
            />
            <span className='ms-3 edit-span' onClick={()=>setAddImg(true)}>Edit Image</span>
          </>:<>
          <div>No Image Found!!</div>
          <button className='btn btn-info btn-sm' onClick={()=>setAddImg(true)}>Add Image</button>
          </>}
          </>}
          </div>

          <div><h6>Staff Fingerprint:</h6><span>Coming Soon!!</span></div>
        </div>
        </>:<>
        <div className="col-12 mt-3">
        <span>Please Select a staff</span>
        </div>
        </>}
        
      </div>
      </div>
      <Toast ref={toast} />
    </section>
  )
}
