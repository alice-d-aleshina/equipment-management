"""Функции для операций с базой данных"""
from datetime import datetime
from typing import List, Dict, Any
from .supabase_client import get_supabase

# Операции со студентами
async def get_students_list() -> List[Dict[str, Any]]:
    """Получение списка всех студентов с информацией о доступе"""
    supabase = get_supabase()
    
    # Получаем студентов
    response = supabase.table('user').select(
        '*'
    ).eq(
        'user_type', 'student'
    ).execute()
    
    students = []
    for user in response.data:
        # Проверяем доступ
        access = supabase.table('useraccess').select(
            '*'
        ).eq(
            'user', user['id']
        ).execute()
        
        students.append({
            "id": user['id'],
            "name": user['name'],
            "email": user['email'],
            "phone": user['phone'],
            "card_id": user['card_id'],
            "active": user['active'],
            "hasAccess": len(access.data) > 0,
            "created": user['created']
        })
    
    return students

async def add_student(student_data: dict) -> Dict[str, Any]:
    """Добавление нового студента"""
    supabase = get_supabase()
    
    # Получаем id типа пользователя "student"
    student_type = supabase.table('usertype').select(
        '*'
    ).eq(
        'name', 'student'
    ).execute()
    
    if not student_type.data:
        return None
    
    # Создаем нового студента
    new_student = {
        "active": True,
        "name": student_data["name"],
        "email": student_data["email"],
        "phone": student_data["phone"],
        "created": datetime.now().isoformat(),
        "card_id": student_data["card_id"],
        "user_type": student_type.data[0]['id'],
        "email_verified": False,
        "telegram_id": 0,
        "password": ""
    }
    
    response = supabase.table('user').insert(new_student).execute()
    return response.data[0] if response.data else None

async def toggle_student_access(student_id: int, room_id: int, grant_access: bool) -> bool:
    """Управление доступом студента"""
    supabase = get_supabase()
    
    if grant_access:
        # Проверяем, нет ли уже доступа
        existing = supabase.table('useraccess').select(
            '*'
        ).eq(
            'user', student_id
        ).eq(
            'room', room_id
        ).execute()
        
        if not existing.data:
            # Добавляем доступ
            supabase.table('useraccess').insert({
                'user': student_id,
                'room': room_id
            }).execute()
    else:
        # Удаляем доступ
        supabase.table('useraccess').delete().eq(
            'user', student_id
        ).eq(
            'room', room_id
        ).execute()
    
    return True

# Операции с оборудованием
async def get_equipment_list() -> List[Dict[str, Any]]:
    """Получение списка всего оборудования с деталями"""
    supabase = get_supabase()
    
    response = supabase.table('item').select(
        '*,hardware(*),itemstatus(*),place(*),group(*)'
    ).execute()
    
    items = []
    for item in response.data:
        items.append({
            "id": item['inv_key'],
            "name": item['hardware']['name'],
            "group": item['group']['group_key'] if item.get('group') else None,
            "status": item['itemstatus']['name'],
            "owner": item['owner'],
            "location": item['place']['name'],
            "available": item['available'],
            "specifications": item['specifications']
        })
    
    return items

async def add_equipment(equipment_data: dict) -> Dict[str, Any]:
    """Добавление нового оборудования"""
    supabase = get_supabase()
    
    response = supabase.table('item').insert({
        "inv_key": equipment_data["inv_key"],
        "hardware": equipment_data["hardware_id"],
        "group": equipment_data.get("group_id"),
        "status": equipment_data["status_id"],
        "owner": equipment_data["owner"],
        "place": equipment_data["place_id"],
        "available": True,
        "specifications": equipment_data.get("specifications", {})
    }).execute()
    
    return response.data[0] if response.data else None

async def checkout_equipment(
    equipment_id: str,
    student_id: int,
    return_date: datetime
) -> Dict[str, Any]:
    """Выдача оборудования студенту"""
    supabase = get_supabase()
    
    # Получаем активный статус запроса
    status = supabase.table('requeststatus').select(
        '*'
    ).eq(
        'name', 'active'
    ).execute()
    
    if not status.data:
        return None
    
    # Создаем новый запрос
    request = {
        "status": status.data[0]['id'],
        "user": student_id,
        "issued_by": 1,  # ID администратора
        "comment": "Выдача оборудования",
        "created": datetime.now().isoformat(),
        "takendate": datetime.now().isoformat(),
        "planned_return_date": return_date.isoformat(),
        "return_date": None
    }
    
    request_response = supabase.table('request').insert(request).execute()
    
    if request_response.data:
        # Получаем статус "checked-out"
        checked_out = supabase.table('itemstatus').select(
            '*'
        ).eq(
            'name', 'checked-out'
        ).execute()
        
        if checked_out.data:
            # Обновляем статус оборудования
            supabase.table('item').update({
                "status": checked_out.data[0]['id'],
                "available": False
            }).eq(
                'inv_key', equipment_id
            ).execute()
            
            return request_response.data[0]
    
    return None

async def return_equipment(equipment_id: str) -> bool:
    """Возврат оборудования"""
    supabase = get_supabase()
    
    # Получаем статус "available"
    available = supabase.table('itemstatus').select(
        '*'
    ).eq(
        'name', 'available'
    ).execute()
    
    if available.data:
        # Обновляем статус оборудования
        supabase.table('item').update({
            "status": available.data[0]['id'],
            "available": True
        }).eq(
            'inv_key', equipment_id
        ).execute()
        
        # Закрываем активный запрос
        supabase.table('request').update({
            "status": 2,  # Статус "завершен"
            "return_date": datetime.now().isoformat()
        }).eq(
            'status', 1  # Активный статус
        ).is_(
            'return_date', None
        ).execute()
        
        return True
    
    return False

# Вспомогательные функции
async def get_available_rooms() -> List[Dict[str, Any]]:
    """Получение списка доступных комнат"""
    supabase = get_supabase()
    response = supabase.table('room').select('*').execute()
    return response.data

async def get_hardware_types() -> List[Dict[str, Any]]:
    """Получение списка типов оборудования"""
    supabase = get_supabase()
    response = supabase.table('hardwaretype').select('*').execute()
    return response.data
