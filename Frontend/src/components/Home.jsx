import React, { useEffect, useState } from 'react';
import './Home.css';
import { apibaseurl, callApi, imgurl } from '../lib';
import ProgressBar from './ProgressBar';
import Profile from './Profile';
import UserManager from './UserManager';
import TaskManager from './TaskManager';

const Home = () => {
    const [fullname, setFullname] = useState("");
    const [isProgress, setIsProgress] = useState("");
    const [token, setToken] = useState("");
    const [menuList, setMenuList] = useState([]);
    const [activeComponent, setActiveComponent] = useState(null);
    const [activeMenu, setActiveMenu] = useState(0);

    useEffect(()=>{
        const storedtoken = localStorage.getItem("token");
        if(!storedtoken)
            logout();
        else{
            setToken(storedtoken);
            setIsProgress(true);
            callApi("GET", apibaseurl + "/authservice/uinfo", null, null, loadUinfo, storedtoken);
        }
    }, []);

    function loadUinfo(res){
        setIsProgress(false);
        if(res.code != 200)
            return;
        setFullname(res.fullname);
        setMenuList(res.menulist);
    }

    function logout(){
        localStorage.clear();
        window.location.replace("/");
    }

    function loadModule(mid){
        setIsProgress(true);
        setActiveMenu(mid);
        const component = {
            3: <TaskManager logout={logout} />,
            4: <UserManager logout={logout} />,
            5: <Profile logout={logout} />
        };
        setActiveComponent(component[mid]);
        setIsProgress(false);
    }

    return (
        <div className='home'>
            <div className='home-header'>
                <img src="/logo.png" alt='' />
                <div className='info'>
                    {fullname}
                    <img src="/shutdown.png" alt='' onClick={()=>logout()} />
                </div>
            </div>
            <div className='home-workspace'>
                <div className='home-menus'>
                    <ul>
                        {menuList.map((m)=>(
                            <li key={m.mid} className={activeMenu==m.mid? 'active': ''} onClick={()=>loadModule(m.mid)}><img src={imgurl + m.icon} alt='' />{m.menu}</li>
                        ))}
                    </ul>
                </div>
                <div className='home-content'>{activeComponent}</div>
            </div>
            <div className='home-footer'>Copyright @ 2026. All rights reserved.</div>

            <ProgressBar isProgress={isProgress}/>
        </div>
    );
}

export default Home;
