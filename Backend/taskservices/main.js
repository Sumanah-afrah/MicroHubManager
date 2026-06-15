import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import taskRouter from './controller/taskControllers.js';
import { connectDB } from './config/db.js';

const app = express(); //Create express object
app.use(express.json()); //Use json() for transactions

dotenv.config(); //Read environment variables (.env)

app.use(cors({origin: ["http://localhost:8000"]})); //Middleware for Cross Origin

//Database Connection
connectDB();

//Register all router's here
app.use("/task", taskRouter);

//Default end point
app.get("/", async (req, res)=>{
    res.json({code: 200, message: "Started...."});
});

const PORT = process.env.PORT;
//Listener for the app
app.listen(PORT, async ()=>{
    console.log("Server running on http://localhost:" + PORT);
});