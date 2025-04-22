from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

import db.crud as crud

app = FastAPI(
    title="Equipment Management API",
    description="API для управления оборудованием и студентами",
    version="1.0.0"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Корневой маршрут
@app.get("/")
async def root():
    """Корневой маршрут с информацией об API"""
    return {
        "name": "Equipment Management API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "endpoints": {
            "students": "/api/students",
            "equipment": "/api/equipment",
            "rooms": "/api/rooms",
            "hardware_types": "/api/hardware-types"
        }
    }

# Модели данных для API
class StudentBase(BaseModel):
    name: str
    email: str
    phone: str
    card_id: str

class Student(StudentBase):
    id: int
    active: bool
    hasAccess: bool
    created: Optional[str]

class Equipment(BaseModel):
    id: str
    name: str
    group: Optional[str]
    status: str
    owner: str
    location: str
    available: bool
    specifications: Optional[dict]

class EquipmentBase(BaseModel):
    inv_key: str
    hardware_id: int
    group_id: Optional[int]
    status_id: int
    owner: str
    place_id: int
    specifications: Optional[dict] = {}

class CheckoutData(BaseModel):
    student_id: int
    return_date: datetime

# API endpoints для студентов
@app.get("/api/students", response_model=List[Student])
async def list_students():
    """Получение списка всех студентов"""
    return await crud.get_students_list()

@app.post("/api/students")
async def create_student(student: StudentBase):
    """Добавление нового студента"""
    result = await crud.add_student(student.dict())
    if not result:
        raise HTTPException(status_code=400, detail="Не удалось создать студента")
    return {"success": True, "student_id": result["id"]}

@app.post("/api/students/{student_id}/access")
async def manage_access(
    student_id: int,
    room_id: int,
    grant_access: bool
):
    """Управление доступом студента"""
    result = await crud.toggle_student_access(student_id, room_id, grant_access)
    if not result:
        raise HTTPException(status_code=400, detail="Не удалось изменить доступ")
    return {"success": True}

# API endpoints для оборудования
@app.get("/api/equipment", response_model=List[Equipment])
async def list_equipment():
    """Получение списка всего оборудования"""
    return await crud.get_equipment_list()

@app.post("/api/equipment")
async def create_equipment(equipment: EquipmentBase):
    """Добавление нового оборудования"""
    result = await crud.add_equipment(equipment.dict())
    if not result:
        raise HTTPException(status_code=400, detail="Не удалось добавить оборудование")
    return {"success": True, "equipment_id": result["inv_key"]}

@app.post("/api/equipment/{equipment_id}/checkout")
async def checkout_item(
    equipment_id: str,
    checkout_data: CheckoutData
):
    """Выдача оборудования студенту"""
    result = await crud.checkout_equipment(
        equipment_id,
        checkout_data.student_id,
        checkout_data.return_date
    )
    if not result:
        raise HTTPException(status_code=400, detail="Не удалось выдать оборудование")
    return {"success": True, "request_id": result["id"]}

@app.post("/api/equipment/{equipment_id}/return")
async def return_item(equipment_id: str):
    """Возврат оборудования"""
    result = await crud.return_equipment(equipment_id)
    if not result:
        raise HTTPException(status_code=400, detail="Не удалось вернуть оборудование")
    return {"success": True}

# Вспомогательные endpoints
@app.get("/api/rooms")
async def list_rooms():
    """Получение списка доступных комнат"""
    return await crud.get_available_rooms()

@app.get("/api/hardware-types")
async def list_hardware_types():
    """Получение списка типов оборудования"""
    return await crud.get_hardware_types() 