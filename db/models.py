"""здесь будут модели"""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Column, Integer, String, ForeignKey, JSON


"""User и Request"""


class UserType(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    active: bool
    name: str
    email: str
    phone: str
    created: datetime
    card_id: str
    user_type: int = Field(int, sa_column=Column(Integer, ForeignKey("usertype.id", ondelete='CASCADE'),
                                                 nullable=False))
    email_verified: bool
    telegram_id: int
    password: str


class RequestStatus(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str


class Request(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    status: int = Field(int, sa_column=Column(Integer, ForeignKey("requeststatus.id", ondelete='CASCADE'),
                                                 nullable=False))
    user: int = Field(int, sa_column=Column(Integer, ForeignKey("user.id", ondelete='CASCADE'),
                                                 nullable=False))
    issued_by: int = Field(int, sa_column=Column(Integer, ForeignKey("user.id", ondelete='CASCADE'),
                                            nullable=False))
    comment:str
    created: datetime
    takendate: datetime
    planned_return_date:datetime
    return_date: datetime


"""комнаты"""


class Terminal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name:str
    created:datetime


class Lab(SQLModel, table=True):
    id: int = Field(primary_key=True)
    name: str
    created: datetime


class Building(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    adress: str
    created: datetime


class Room(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    lab: int = Field(int, sa_column=Column(Integer, ForeignKey("lab.id", ondelete='CASCADE'), nullable=False))
    created: datetime
    building: int = Field(int, sa_column=Column(Integer, ForeignKey("building.id", ondelete='CASCADE'),
                                                nullable=False))
    type: str

class Section(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    room: int = Field(int, sa_column=Column(Integer, ForeignKey("room.id", ondelete='CASCADE'),
                                            nullable=False))


class TerminalAccess(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True) # здесь добавил
    room: int = Field(int, sa_column=Column(Integer, ForeignKey("room.id", ondelete='CASCADE'),
                                            nullable=False))
    terminal: int = Field(int, sa_column=Column(Integer, ForeignKey("terminal.id", ondelete='CASCADE'),
                                            nullable=False))


class Place(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    section: int = Field(int, sa_column=Column(Integer, ForeignKey("section.id", ondelete='CASCADE'),
                                            nullable=False))


"""UserAccess"""


class UserAccess(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user: int = Field(int, sa_column=Column(Integer, ForeignKey("user.id", ondelete='CASCADE'),
                                            nullable=False))
    room: int = Field(int, sa_column=Column(Integer, ForeignKey("room.id", ondelete='CASCADE'),
                                            nullable=False))


"""Нижняя ветка"""


class HardwareType(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    hardware_specifications_template: dict = Field(sa_type=JSON)


class Hardware(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: int = Field(int, sa_column=Column(Integer, ForeignKey("hardwaretype.id", ondelete='CASCADE'),
                                            nullable=False))
    image_link: str
    specifications: dict = Field(sa_type=JSON)
    item_specifications: dict = Field(sa_type=JSON)


class ItemStatus(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str


class GroupStatus(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str


class Group(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    group_key: str
    status: int = Field(int, sa_column=Column(Integer, ForeignKey("groupstatus.id", ondelete='CASCADE'),
                                            nullable=False))
    created: datetime
    parent: int = Field(int, sa_column=Column(Integer, ForeignKey("group.id", ondelete='CASCADE'),
                                            nullable=True))
    available: bool


class RequestGroup(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    group: int = Field(int, sa_column=Column(Integer, ForeignKey("group.id", ondelete='CASCADE'),
                                            nullable=True))
    request: int = Field(int, sa_column=Column(Integer, ForeignKey("request.id", ondelete='CASCADE'),
                                            nullable=True))


class Item(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    inv_key: str
    hardware: int = Field(int, sa_column=Column(Integer, ForeignKey("hardware.id", ondelete='CASCADE'),
                                            nullable=False))
    group: int
    status: int = Field(int, sa_column=Column(Integer, ForeignKey("itemstatus.id", ondelete='CASCADE'),
                                            nullable=False))
    owner: str
    place: int = Field(int, sa_column=Column(Integer, ForeignKey("place.id", ondelete='CASCADE'),
                                            nullable=False))
    available:bool
    specifications: dict = Field(sa_type=JSON)


class QualityComment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    request: int = Field(int, sa_column=Column(Integer, ForeignKey("request.id", ondelete='CASCADE'),
                                            nullable=False))
    grade: int
    comment: str
    item: int = Field(int, sa_column=Column(Integer, ForeignKey("item.id", ondelete='CASCADE'),
                                            nullable=False))
    photo_link:str


"""Истории операций"""


class OperationType(SQLModel, table=True):
    name: str = Field(primary_key=True)


class History(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    entity: str
    entity_id: int
    data: dict = Field(sa_type=JSON)
    created: datetime
    type: str = Field(int, sa_column=Column(String, ForeignKey(OperationType.name, ondelete='CASCADE'),
                                                 nullable=False))


