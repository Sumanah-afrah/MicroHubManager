from fastapi import APIRouter, Header
from models.schemas import TasksSchema
import httpx

router = APIRouter(prefix="/taskservice")

SPRING_URL = "http://localhost:8002/"

@router.post("/createtask")
async def createTask(T: TasksSchema, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPRING_URL + "task/createtask",
            json=T.model_dump(),
            headers = {"Token": Token}
        )
    return response.json() # Returns back the response received from spring

@router.get("/getalltasks/{PAGE}/{SIZE}")
async def getAllTasks(PAGE: int, SIZE:int, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            SPRING_URL + f"task/getalltasks/{PAGE}/{SIZE}",
            headers = {"Token": Token}
        )
    return response.json()

@router.get("/gettask/{ID}")
async def getTask(ID: str, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            SPRING_URL + f"task/gettask/{ID}",
            headers = {"Token": Token}
        )
    return response.json()

@router.put("/updatetask/{ID}")
async def updateTask(ID: str, T: TasksSchema, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.put(
            SPRING_URL + f"task/updatetask/{ID}",
            json=T.model_dump(),
            headers = {"Token": Token}
        )
    return response.json()

@router.delete("/deletetask/{ID}")
async def deleteTask(ID: str, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            SPRING_URL + f"task/deletetask/{ID}",
            headers = {"Token": Token}
        )
    return response.json()

@router.get("/vectorsearch/{QUERY}")
async def vectorSearch(QUERY: str, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            SPRING_URL + f"task/vectorsearch/{QUERY}", headers={'Token': Token})
    return response.json()
