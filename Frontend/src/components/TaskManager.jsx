import React, { useEffect, useRef, useState } from 'react';
import './TaskManager.css';
import ProgressBar from './ProgressBar';
import { apibaseurl, callApi, imgurl } from '../lib';

const TaskManager = ({ logout }) => {
    const contentDiv = useRef();
    const tsktitle = useRef();
    const vs = useRef();
    const [isProgress, setIsProgress] = useState(false);
    const [data, setData] = useState(null);
    const [token, setToken] = useState("");
    const [activePage, setActivePage] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [taskData, setTaskData] = useState(null);
    const [errorData, setErrorData] = useState(null);

    const [showDropdown, setShowDropdown] = useState(false);
    const [options, setOptions] = useState([]);
    const [searchvalue, setSearchValue] = useState("");
    const [highlightIndex, setHighlightIndex] = useState(-1);

    const [vectorSearch, setVectorSearch] = useState("");
    const [isVectorResult, setIsVectorResult] = useState(false);

    useEffect(() => {
        const storedtoken = localStorage.getItem("token");
        if (storedtoken == undefined || storedtoken == "")
            return logout();

        const ps = Math.floor((contentDiv.current.offsetHeight - 40) / 40);
        setToken(storedtoken);
        setIsProgress(true);
        callApi("GET", apibaseurl + "/taskservice/getalltasks/1/" + ps, null, null, loadData, storedtoken);
    }, []);

    function loadTasks(page) {
        const ps = Math.floor((contentDiv.current.offsetHeight - 40) / 40);
        setIsProgress(true);
        setIsVectorResult(false);
        setActivePage(page - 1);
        callApi("GET", apibaseurl + "/taskservice/getalltasks/" + page + "/" + ps, null, null, loadData, token);
    }

    function loadData(res) {
        if (res.code !== 200) {
            alert(res.message);
            setIsProgress(false);
            return;
        }
        setData(res);
        setIsProgress(false);
    }

    function addTask() {
        setIsProgress(true);
        setErrorData(null);
        setTaskData({
            id: "",
            title: "",
            description: "",
            createdby: 0,
            assignedto: "",
            priority: 0,
            deadline: "",
            status: 0,
        });
        setSearchValue("");
        setOptions([]);
        setShowPopup(true);
        setTimeout(() => { tsktitle.current?.focus(); }, 0);
        setIsProgress(false);
    }

    function handleInput(e) {
        const { name, value } = e.target;
        setTaskData({ ...taskData, [name]: value });
    }

    function searchUser(e) {
        const { value } = e.target;
        setSearchValue(value);
        if (value.length === 0) {
            setOptions([]);
            setTaskData({ ...taskData, ['assignedto']: "" });
            setShowDropdown(false);
            return;
        }
        if (value.length % 2 === 0)
            callApi("GET", apibaseurl + "/authservice/searchuser/" + value, null, null, searchUserResponse, token);
    }

    function searchUserResponse(res) {
        setHighlightIndex(-1);
        setOptions(res.users);
        setShowDropdown(res.users.length > 0);
    }

    function selectUser(user) {
        setSearchValue(user.fullname + " (" + user.email + ")");
        setTaskData({ ...taskData, ['assignedto']: user.id });
        setShowDropdown(false);
    }

    function completeSearchUser(e) {
        setShowDropdown(false);
        if (options.length === 0)
            return;

        const index = highlightIndex >= 0 ? highlightIndex : 0;
        const user = options[index];

        setSearchValue(user.fullname + " (" + user.email + ")");
        setTaskData({ ...taskData, ['assignedto']: user.id });
    }

    function handleKeyDown(e) {
        if (!showDropdown || options.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex(highlightIndex => highlightIndex < options.length - 1 ? highlightIndex + 1 : 0);
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex(highlightIndex => highlightIndex > 0 ? highlightIndex - 1 : options.length - 1);
        }

        if (e.key === "Enter") {
            e.preventDefault();
            if (highlightIndex >= 0)
                selectUser(options[highlightIndex]);
        }
    }

    function validateData() {
        let errors = {};
        if (taskData?.title === "") errors.title = true;
        if (taskData?.description === "") errors.description = true;
        if (searchvalue === "") errors.assignedto = true;
        if (taskData?.priority === "") errors.priority = true;
        if (taskData?.deadline === "") errors.deadline = true;
        if (taskData?.status === "") errors.status = true;
        setErrorData(errors);
        return Object.keys(errors).length > 0;
    }

    function saveTask() {
        if (validateData())
            return;

        setIsProgress(true);
        if(!taskData?._id)
            callApi("POST", apibaseurl + "/taskservice/createtask", taskData, null, saveTaskHandler, token);
        else
            callApi("PUT", apibaseurl + "/taskservice/updatetask/" + taskData?._id, taskData, null, saveTaskHandler, token);
    }

    function saveTaskHandler(res) {
        alert(res.message);
        setIsProgress(false);
        if (res.code !== 200)
            return;

        setShowPopup(false);
        setTaskData(null);
        if (isVectorResult)
            vSearch();
        else
            loadTasks(activePage + 1);
    }

    function vSearch() {
        const query = vectorSearch.trim();
        if (query.length === 0)
            loadTasks(1);
        else {
            setIsProgress(true);
            setIsVectorResult(true);
            callApi("GET", apibaseurl + "/taskservice/vectorsearch/" + encodeURIComponent(query), null, null, loadData, token);
        }
    }

    function editTask(id) {
        setIsProgress(true);
        setErrorData(null);
        callApi("GET", apibaseurl + "/taskservice/gettask/" + id, null, null, editTaskHandler, token);
    }

    function editTaskHandler(res) {
        if (res.code !== 200) {
            alert(res.message);
            setIsProgress(false);
            return;
        }
        setTaskData(res.task);
        const assignedto = res.task?.assignedto;
        callApi("GET", apibaseurl + "/authservice/getuser/" + assignedto, null, null, loadSearchUser, token);

    }

    function loadSearchUser(res) {
        setSearchValue(res.user?.fullname + " (" + res.user?.email + ")");
        setOptions([]);
        setShowPopup(true);
        setTimeout(() => { tsktitle.current?.focus(); }, 0);
        setIsProgress(false);
    }

    function deleteTask(id) {
        const resp = confirm("Click OK to delete");
        if (!resp)
            return;

        setIsProgress(true);
        callApi("DELETE", apibaseurl + "/taskservice/deletetask/" + id, null, null, deleteTaskHandler, token);
    }

    function deleteTaskHandler(res) {
        alert(res.message);
        setIsProgress(false);
        if (res.code !== 200)
            return;

        setShowPopup(false);
        if (isVectorResult)
            vSearch();
        else
            loadTasks(activePage + 1);
    }

    return (
        <div className='tmanager'>
            <div className='tmanager-header'>
                <label>Task Manager</label>
                <div>
                    <label>Vector Search</label>
                    <input type='text' ref={vs} autoComplete='off' name='vectorSearch' value={vectorSearch} onChange={(e) => setVectorSearch(e.target.value)} />
                    <button onClick={() => vSearch()}>Search</button>
                </div>
            </div>
            <div className='tmanager-content' ref={contentDiv}>
                <table>
                    {isVectorResult &&
                        <caption>Vector search results: {data?.tasks?.length ?? 0} match{data?.tasks?.length === 1 ? "" : "es"}</caption>
                    }
                    <thead>
                        <tr>
                            <th style={{ 'width': '50px' }}>S#</th>
                            <th style={{ 'width': '200px' }}>Title</th>
                            <th style={{ 'width': '250px' }}>Description</th>
                            <th style={{ 'width': '100px' }}>Priority</th>
                            <th style={{ 'width': '100px' }}>Deadline</th>
                            <th style={{ 'width': '100px' }}>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                    {data?.tasks?.map((task, index) => (
                        <tr key={task._id}>
                            <td style={{ textAlign: 'center' }}>{data.page ? ((data.page - 1) * data.size) + (index + 1) : (index + 1)}</td>
                            <td>{task.title}</td>
                            <td>{task.description}</td>
                            <td style={{ textAlign: 'center', color: task.priority == 0 ? 'var(--primary-color)' : 'var(--red)' }}>{task.priority == 0 ? 'Normal' : 'High'}</td>
                            <td style={{ textAlign: 'center' }}>{task.deadline}</td>
                            <td style={{ textAlign: 'center', color: task.status == 0 ? 'var(--text-dark)' : task.status == 1 ? 'var(--maroon)' : 'var(--secondary-color)' }}>{task.status == 0 ? 'Assigned' : task.status == 1 ? 'In-Progress' : 'Completed'}</td>
                            <td>
                                <img src={imgurl + "edit.png"} alt='' onClick={() => editTask(task._id)} />
                                <img src={imgurl + "delete.png"} alt='' onClick={() => deleteTask(task._id)} />
                            </td>
                        </tr>
                    ))}
                    {isVectorResult && data?.tasks?.length === 0 &&
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center' }}>No matching tasks found</td>
                        </tr>
                    }
                    </tbody>
                </table>
            </div>
            <div className='tmanager-footer'>
                <button onClick={() => addTask()}>Add New</button>
                {!isVectorResult && <div className='pages'>{
                    Array.from({ length: data?.totalpages }, (_, index) => (
                        <label key={index} className={index == activePage ? 'active' : ''} onClick={() => loadTasks(index + 1)}>
                            {index + 1}
                        </label>
                    ))
                }</div>}
            </div>

            {showPopup &&
                <div className='overlay'>
                    <div className='popup'>
                        <span className='close' onClick={() => setShowPopup(false)}>&times;</span>
                        <h3>{taskData?.id == "" ? "New Task" : "Update Task"}</h3>
                        <label>Task Title*</label>
                        <input type='text' ref={tsktitle} className={errorData?.title ? 'error' : ''} autoComplete='off' name='title' value={taskData?.title} onChange={(e) => handleInput(e)} />
                        <label>Description*</label>
                        <textarea rows="2" className={errorData?.description ? 'error' : ''} name='description' value={taskData?.description} onChange={(e) => handleInput(e)}></textarea>
                        <label>Assigned To*</label>
                        <div className="dropdown">
                            <input type="text" autoComplete="off" className={errorData?.assignedto ? 'error' : ''} name='assignedto' value={searchvalue} onChange={(e) => searchUser(e)} onBlur={(e) => completeSearchUser(e)} onKeyDown={(e) => handleKeyDown(e)} />
                            {showDropdown &&
                                <ul>
                                    {options.map((item, index) => (
                                        <li key={item.id} className={highlightIndex === index ? "active" : ""} onMouseDown={() => selectUser(item)}>{item.fullname} ({item.email})</li>
                                    ))}
                                </ul>
                            }
                        </div>
                        <label>Priority*</label>
                        <select className={errorData?.priority ? 'error' : ''} name='priority' value={taskData?.priority} onChange={(e) => handleInput(e)}>
                            <option value={0}>Normal</option>
                            <option value={1}>High</option>
                        </select>
                        <label>Deadline (mm/dd/yyyy)*</label>
                        <input type='date' style={{ "height": "33px" }} className={errorData?.deadline ? 'error' : ''} autoComplete='off' name='deadline' value={taskData?.deadline} onChange={(e) => handleInput(e)} />
                        <label>Task Status*</label>
                        <select className={errorData?.status ? 'error' : ''} name='status' value={taskData?.status} onChange={(e) => handleInput(e)}>
                            <option value={0}>Assigned</option>
                            <option value={1}>In-Progress</option>
                            <option value={2}>Completed</option>
                        </select>
                        <button onClick={()=>saveTask()}>{taskData?.id == "" ? "Save" : "Update"}</button>
                    </div>
                </div>
            }

            <ProgressBar isProgress={isProgress} />
        </div>
    );
}

export default TaskManager;
