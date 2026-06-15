import React, { useEffect, useRef, useState } from 'react';
import './UserManager.css';
import ProgressBar from './ProgressBar';
import { apibaseurl, callApi, imgurl } from '../lib';

const UserManager = ({logout}) => {
    const [data, setData] = useState(null);
    const [token, setToken] = useState("");
    const [isProgress, setIsProgress] = useState("");
    const [activePage, setActivePage] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const contentDiv = useRef();
    const fname = useRef();
    const [userData, setUserData] = useState(null);
    const [rolesData, setRolesData] = useState(null);
    const [errorData, setErrorData] = useState(null);

    useEffect(()=>{
        const storedtoken = localStorage.getItem("token");
        if(storedtoken == undefined || storedtoken == "")
            return logout();
            
        const ps = Math.floor((contentDiv.current.offsetHeight - 40) / 40);
        setToken(storedtoken);
        setIsProgress(true);
        callApi("GET", apibaseurl + "/authservice/getallusers/1/" + ps, null, null, loadData, storedtoken);
    },[]);

    function loadUsers(page){
        const ps = Math.floor((contentDiv.current.offsetHeight - 40) / 40);
        setIsProgress(true);
        setActivePage(page - 1);
        callApi("GET", apibaseurl + "/authservice/getallusers/" + page + "/" + ps, null, null, loadData, token);
    }

    function loadData(res){
        if(res.code !== 200){
            alert(res.message);
            setIsProgress(false);
            return;
        }
        setData(res);
        setIsProgress(false);
    }

    function handleInput(e){
        const {name, value} = e.target;
        setUserData({...userData, [name] : value});
    }

    function addUser(){
        setIsProgress(true);
        setRolesData(null);
        setErrorData(null);
        setUserData({
            id: "",
            fullname: "",
            phone: "",
            email: "",
            password: "",
            role: 1,
            status: 1
        });
        setRolesData(data.roles);
        setShowPopup(true);
        setTimeout(() => {fname.current?.focus();}, 0);
        setIsProgress(false);
    }

    function editUser(user){
        setRolesData(null);
        setErrorData(null);
        setUserData(user);
        setRolesData(data.roles);
        setShowPopup(true);
        setTimeout(() => {fname.current?.focus();}, 0);
    }

    function deleteUser(id){
        const resp = confirm("Click OK to delete");
        if(!resp)
            return;

        setIsProgress(true);
        callApi("DELETE", apibaseurl + "/authservice/deleteuser/" + id, null, null, deleteUserHandler, token);
    }

    function deleteUserHandler(res){
        alert(res.message);
        setIsProgress(false);
        loadUsers(activePage + 1);
    }

    function validateData(){
        let errors = {};
        if(userData.fullname === "") errors.fullname = true;
        if(userData.phone === "") errors.phone = true;
        if(userData.role === "") errors.role = true;
        if(userData.email === "") errors.email = true;
        if(userData.password === "") errors.password = true;
        setErrorData(errors);
        return Object.keys(errors).length > 0;
    }

    function saveUser(){
        if(validateData())
            return;

        setIsProgress(true);
        if(userData?.id === "")
            callApi("POST", apibaseurl + "/authservice/saveuser", userData, null, saveUserHandler, token);
        else
            callApi("PUT", apibaseurl + "/authservice/updateuser/" + userData?.id, userData, null, saveUserHandler, token);
    }

    function saveUserHandler(res){
        alert(res.message);
        setIsProgress(false);
        if(res.code !== 200)      
            return;

        setShowPopup(false);
        setUserData(null);
        loadUsers(activePage + 1);
    }

    return (
        <div className='umanager'>
            <div className='umanager-header'>
                <label>User Manager</label>
            </div>
            <div className='umanager-content' ref={contentDiv}>
                <table>
                    <thead>
                        <tr>
                            <th style={{'width':'50px'}}>S#</th>
                            <th style={{'width':'250px'}}>Full Name</th>
                            <th style={{'width':'150px'}}>Phone Number</th>
                            <th style={{'width':'250px'}}>Registered Email</th>
                            <th></th>
                        </tr>
                    </thead>
                    {data?.users.map((user, index)=>(
                        <tr key={user.id}>
                            <td style={{'text-align':'center'}}>{((data.page - 1) * data.size) + (index + 1)}</td>
                            <td>{user.fullname}</td>
                            <td style={{'text-align':'center'}}>{user.phone}</td>
                            <td>{user.email}</td>
                            <td>
                                <img src={imgurl + "edit.png"} alt='' onClick={()=>editUser(user)} />
                                <img src={imgurl + "delete.png"} alt='' onClick={()=>deleteUser(user.id)} />
                            </td>
                        </tr>
                    ))}
                </table>
            </div>
            <div className='umanager-footer'>
                <button onClick={()=>addUser()}>Add New</button>
                <div className='pages'>{
                    Array.from({ length: data?.totalpages}, (_, index) => (
                        <label key={index} className={index == activePage? 'active': ''} onClick={()=>loadUsers(index + 1)}>
                            {index + 1}
                        </label>
                    ))
                }</div>
            </div>

            {showPopup && 
                <div className='overlay'>
                    <div className='popup'>
                        <span className='close' onClick={()=>setShowPopup(false)}>&times;</span>
                        <h3>{userData?.id == "" ? "New User" : "Update User"}</h3>
                        <label>Full Name*</label>
                        <input type='text' ref={fname} className={errorData?.fullname ? 'error' : ''} autoComplete='off' name='fullname' value={userData?.fullname} onChange={(e)=>handleInput(e)} />
                        <label>Phone Number*</label>
                        <input type='text' className={errorData?.phone ? 'error' : ''} autoComplete='off' name='phone' value={userData?.phone} onChange={(e)=>handleInput(e)} />
                        <label>Role*</label>
                        <select className={errorData?.role ? 'error' : ''} disabled={userData?.id === ""} name='role' value={userData?.role} onChange={(e)=>handleInput(e)}>
                            {rolesData?.map((r)=>(
                                <option value={r.role}>{r.rolename}</option>
                            ))}
                        </select>
                        <label>Email*</label>
                        <input type='text' className={errorData?.email ? 'error' : ''} autoComplete='off' name='email' value={userData?.email} onChange={(e)=>handleInput(e)} />
                        <label>Password*</label>
                        <input type='password' className={errorData?.password ? 'error' : ''} autoComplete='off' name='password' value={userData?.password} onChange={(e)=>handleInput(e)} />
                        <button onClick={()=>saveUser()}>{userData?.id == "" ? "Save" : "Update"}</button>
                    </div>
                </div>
            }

            <ProgressBar isProgress={isProgress}/>
        </div>
    );
}

export default UserManager;
