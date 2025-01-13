import React, { useEffect } from 'react'
import './staff.css'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import AddStaff from './addStaff';
import Swal from 'sweetalert2';
        

export default function Staff() {
  useEffect(()=>{
    fetchStaffs()
  },[])
  const [staffs,setStaffs]=useState()
  const [staffToDelete,setStaffToDelete]=useState()
  const [addVisible,setAddVisible]=useState(false)
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [staffView,setStaffView]=useState(false)
  const [deleteStaffDialog,setDeleteStaffDialog]=useState(false)

  const fetchStaffs=async()=>{
    
    const res = await fetch("http://127.0.0.1:8080/api/fetch_staff/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if(res.ok){
      const data = await res.json();
      setStaffs(data)
    }
  }

  const deleteStaff=async()=>{
    const staffID=staffToDelete.staff_id
    const body = JSON.stringify({ staffID });
    const res = await fetch("http://127.0.0.1:8080/api/delete_staff/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json", 
        },
        body,
    });
    if(res.ok){
      setDeleteStaffDialog(false)
        Swal.fire({
            icon: "success",
            title: "Staff Deleted",
            text: "you've successfully deleted a staff",
          })
          .then(
            fetchStaffs()
          )
        }
  }

  const closeEvent=()=>{
    fetchStaffs()
    setAddVisible(false)
  }

  const tableHeader=(<div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
    <span className="text-xl text-900 font-bold">Staffs</span> <Button label="Add Staff" icon="pi pi-plus" onClick={() => setAddVisible(true)}/>
  </div>)

const formatCurrency = (value) => {
  return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
};

const onRowSelect = () => {
  setStaffView(true)
};

const onRowUnselect = () => {
  setStaffView(false)
  setSelectedStaff([])
};

const actionBodyTemplate = (rowData) => {
  return (
      <React.Fragment>
          
          <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteStaff(rowData)} />
      </React.Fragment>
  );
};

const confirmDeleteStaff = (staff) => {
  setStaffToDelete(staff);
  setDeleteStaffDialog(true);
};

const deleteStaffDialogFooter = (
  <React.Fragment>
      <Button label="No" icon="pi pi-times" outlined onClick={()=>setDeleteStaffDialog(false)} />
      <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteStaff} />
  </React.Fragment>
);




  return (
    <div className='staff-body'>
      <div className="container pt-3">
      <div className="card ">
      <DataTable   value={staffs}  selectionMode={'single'} selection={selectedStaff} onSelectionChange={(e) => {setSelectedStaff(e.value);}} 
        onRowSelect={onRowSelect} onRowUnselect={onRowUnselect}  tableStyle={{ minWidth: '50rem'}} showGridlines header={tableHeader}  >
          <Column field="staff_id" header="Staff ID"></Column>
          <Column field="name" header="Name"></Column>
          <Column field='designation' header="Designation"></Column>
          <Column field='phone' header="Phone"></Column>
          <Column body={actionBodyTemplate}></Column>
      </DataTable>
      </div>

      <Dialog header="Add Staff" visible={addVisible} onHide={()=>setAddVisible(false)}>
            <AddStaff onClose={closeEvent}/>
      </Dialog>

      <Dialog header={`Staff #${selectedStaff.staff_id}`} visible={staffView} style={{ width: '50vw' }} onHide={onRowUnselect}>
          <div className="container">
            {selectedStaff.name?<>
              <div className="row">
              <div className="col-4">
                <div className="card p-3">
                <img src="src/assets/logo.svg" alt="" width={150}/>
                </div>
              </div>
              <div className="col-8">
                <div className="card p-3 ">
                  <h5 className='fw-bold'>{selectedStaff.name}</h5>
                  <span>{selectedStaff.designation}</span>
                  <span>{selectedStaff.phone}</span>
                  <span>{selectedStaff.email}</span>
                </div>
              </div>
              <div className="col-6 pt-3">
                <div className="card p-3">
                  <h6 className='fw-bold'>Address:</h6>
                  <span>{selectedStaff.address}</span>
                </div>
              </div>
              <div className="col-6 pt-3">
                <div className="card p-3">
                <span>DOB: {selectedStaff.birthday}</span>
                <span>Date Joined: {selectedStaff.joined_date}</span>
                <span>Salary: {formatCurrency(selectedStaff.salary)}</span>
                </div>
              </div>
            </div>
            </>:<></>}
          </div>
      </Dialog>

      <Dialog visible={deleteStaffDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} footer={deleteStaffDialogFooter} header="Confirm" modal  onHide={()=>setDeleteStaffDialog(false)}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {staffToDelete && (
                        <span>
                            Are you sure you want to delete <b>{staffToDelete.name}</b>?
                        </span>
                    )}
                </div>
        </Dialog>
      </div>
    </div>
  )
}
