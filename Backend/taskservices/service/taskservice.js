import Tasks from "../models/tasks.js";
import * as vectorService from "./vectorService.js";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const SECRETE_KEY = process.env.SECRETE_KEY;

export async function createTask(data, token) {
    try {
        const payload = jwt.verify(token, SECRETE_KEY);
        data.createdby =  payload.crid;
        data.vector = await vectorService.generateVector(`${data.title} ${data.description}`);
        await Tasks.create(data);
        return {code: 200, message: "New task has been created"};
    } catch (error) {
        return {code: 500, message: error.message};
    }
}

export async function getAllTasks(page, size, token)
{
    let response;
    try {
        const payload = jwt.verify(token, SECRETE_KEY);
        const skip = (page - 1) * size;
        const tasks = await Tasks.find({createdby: payload.crid})
                                .skip(skip)
                                .limit(size)
                                .sort({_id: 1});

        const totalrecords = await Tasks.countDocuments({createdby: payload.crid});
        response = {code: 200, page: page, size: size, totalpages: Math.ceil(totalrecords / size), tasks: tasks};
    }catch (e)
    {
        response = {code: 500, message: e.message};
    }
    return response;
}

export async function deleteTask(id, token)
{
    let response;
    try{
        const payload = jwt.verify(token, SECRETE_KEY); //Autorization

        await Tasks.findOneAndDelete({_id: id});

        response = {code: 200, message: "Task has been deleted"};
    }catch(e)
    {
        response = {code: 500, message: e.message};
    }
    return response;
}

export async function getTask(id, token) {
    let response;
    try {
        const payload = jwt.verify(token, SECRETE_KEY);
        const task = await Tasks.findOne({ _id: id });
        response = { code: 200, task: task };
    } catch (e) {
        response = { code: 500, message: e.message };
    }
    return response;
}

export async function updateTask(id, data, token) {
    let response;
    try {
        const payload = jwt.verify(token, SECRETE_KEY);
        data.vector = await vectorService.generateVector(`${data.title} ${data.description}`);
        await Tasks.findOneAndUpdate({ _id: id }, data);
        response = { code: 200, message: "Task has been updated" };
    } catch (e) {
        response = { code: 500, message: e.message };
    }
    return response;
}

//Vector Search
export async function vectorSearch(query, token)
{
    let response;
    try
    {
        const payload = jwt.verify(token, SECRETE_KEY); //Authoeization

        const queryVector = await vectorService.generateVector(query);

        const tasks = await Tasks.find({createdby: payload.crid});

        for (const task of tasks)
        {
            if (!Array.isArray(task.vector) || task.vector.length === 0)
            {
                task.vector = await vectorService.generateVector(`${task.title} ${task.description}`);
                await task.save();
            }
        }

        const searchResult = tasks.map(task=>{
            const similarity = vectorService.cosineSimilarity(queryVector, task.vector);
            return {...task._doc, similarity};
        })
        .filter(task => task.similarity > 0.10)
        .sort((a,b)=>b.similarity - a.similarity)
        .slice(0, 5);

        response = {code: 200, tasks: searchResult};
    }catch(e)
    {
        response = {code: 500, message: e.message};
    }
    return response;
}
