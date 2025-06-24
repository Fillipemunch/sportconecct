from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class SkillLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    ALL = "all"

class EventStatus(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class FriendshipStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

# User Models
class UserBase(BaseModel):
    name: str
    email: EmailStr
    age: int = Field(..., ge=13, le=100)
    location: str
    bio: Optional[str] = ""
    sports: List[str] = []
    skill_level: SkillLevel
    photo: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(None, ge=13, le=100)
    location: Optional[str] = None
    bio: Optional[str] = None
    sports: Optional[List[str]] = None
    skill_level: Optional[SkillLevel] = None
    photo: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str
    events_participated: int = 0
    events_created: int = 0
    badges: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

# Event Models
class EventBase(BaseModel):
    title: str
    title_da: str
    sport: str
    date: str  # YYYY-MM-DD format
    time: str  # HH:MM format
    location: str
    address: str
    description: str
    description_da: str
    max_participants: int = Field(..., ge=2, le=100)
    skill_level: SkillLevel
    price: float = Field(..., ge=0)

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    title_da: Optional[str] = None
    sport: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    description_da: Optional[str] = None
    max_participants: Optional[int] = Field(None, ge=2, le=100)
    skill_level: Optional[SkillLevel] = None
    price: Optional[float] = Field(None, ge=0)

class Event(EventBase):
    id: str
    organizer_id: str
    organizer_name: str
    current_participants: int = 1
    participants: List[str] = []
    status: EventStatus = EventStatus.ACTIVE
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

# Message Models
class MessageBase(BaseModel):
    message: str
    message_da: str

class MessageCreate(MessageBase):
    event_id: str

class Message(MessageBase):
    id: str
    event_id: str
    user_id: str
    user_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

# Friendship Models
class FriendshipCreate(BaseModel):
    friend_id: str

class Friendship(BaseModel):
    id: str
    user_id: str
    friend_id: str
    status: FriendshipStatus = FriendshipStatus.PENDING
    mutual_events: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

class FriendInfo(BaseModel):
    id: str
    name: str
    photo: Optional[str] = None
    location: str
    sports: List[str] = []
    age: int
    status: str = "offline"
    mutual_events: int = 0

# Sports Model
class Sport(BaseModel):
    id: str
    name: str
    name_da: str
    icon: str
    color: str

# Response Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class EventParticipant(BaseModel):
    id: str
    name: str
    photo: Optional[str] = None

class EventWithParticipants(Event):
    participant_details: List[EventParticipant] = []

# Statistics Model
class UserStats(BaseModel):
    events_participated: int
    events_created: int
    badges_count: int
    friends_count: int
    sports_count: int

# API Response Models
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    per_page: int
    pages: int