
from pydantic import BaseModel

class SigninSchema(BaseModel):
    username:str
    password:str

class SignupSchema(BaseModel):
    fullname:str
    phone:str
    email:str
    password:str
    retypepassword:str

class UserSchema(BaseModel):
    fullname:str
    phone:str
    email:str
    password:str
    role:int
    status:int

class TasksSchema(BaseModel):
    title: str
    description: str
    createdby: int
    assignedto: int
    priority: int
    deadline: str
    status: int
        