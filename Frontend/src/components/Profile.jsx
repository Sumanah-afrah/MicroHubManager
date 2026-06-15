import React, { useEffect, useState } from 'react';
import './Profile.css';
import ProgressBar from './ProgressBar';
import { apibaseurl, callApi, imgurl } from '../lib';

const Profile = ({logout}) => {
    const [data, setData] = useState(null);
    const [token, setToken] = useState("");
    const [isProgress, setIsProgress] = useState("");

    useEffect(()=>{
        const storedtoken = localStorage.getItem("token");
        if(storedtoken == undefined || storedtoken == "")
            return logout();
            
        setToken(storedtoken);
        setIsProgress(true);
        callApi("GET", apibaseurl + "/authservice/profile", null, null, loadData, storedtoken);
    },[]);

    function loadData(res){
        setData(res);
        setIsProgress(false);
    }
    
    if(!data) return ("");

    return (
        <div className='profile'>
            <div className='container'>
                <div className='info'>
                    <img src={imgurl + "user.png"} alt='' />
                    <div className='info-data'>
                        <label>{data.user[0].fullname}</label>
                        <span>{data.user[1].rolename}</span>
                    </div>
                </div>
                <div className='details'>
                    <div className='grid'>
                        <span>Name</span>
                        <span>{data.user[0].fullname}</span>
                    </div>
                    <div className='grid'>
                        <span>Phone Number</span>
                        <span>{data.user[0].phone}</span>
                    </div>
                    <div className='grid'>
                        <span>Email</span>
                        <span>{data.user[0].email}</span>
                    </div>
                    <div className='grid'>
                        <span>Role</span>
                        <span>{data.user[1].rolename}</span>
                    </div>
                </div>
            </div>

            <ProgressBar isProgress={isProgress}/>
        </div>
    );
}

export default Profile;
