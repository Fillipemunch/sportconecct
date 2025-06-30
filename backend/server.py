from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timedelta

# Import local modules
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import *
from database import connect_to_mongo, close_mongo_connection, get_document, get_documents, create_document, update_document, delete_document, count_documents, aggregate_documents
from auth import authenticate_user, create_access_token, get_current_user, get_current_user_optional, get_password_hash, verify_password
from sports_data import get_all_sports, get_sport_by_id
from utils import generate_id, validate_date_format, validate_time_format, is_valid_base64_image, generate_avatar_base64, calculate_mutual_events, generate_event_tags, sanitize_text, get_user_badges

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

# Create the main app with lifespan management
app = FastAPI(lifespan=lifespan)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# AUTH ENDPOINTS
# ============================================================================

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = await get_document("users", {"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Generate user ID and avatar
        user_id = generate_id()
        avatar = generate_avatar_base64(user_data.name)
        
        # Create user document
        user_doc = {
            "id": user_id,
            "name": sanitize_text(user_data.name),
            "email": user_data.email,
            "password": hashed_password,
            "age": user_data.age,
            "location": sanitize_text(user_data.location),
            "bio": sanitize_text(user_data.bio or ""),
            "sports": user_data.sports,
            "skill_level": user_data.skill_level,
            "photo": user_data.photo if is_valid_base64_image(user_data.photo) else avatar,
            "events_participated": 0,
            "events_created": 0,
            "badges": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await create_document("users", user_doc)
        
        # Remove password from response
        del user_doc["password"]
        user_obj = User(**user_doc)
        
        # Create access token
        access_token = create_access_token(data={"sub": user_id})
        
        return Token(access_token=access_token, user=user_obj)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@api_router.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Login user"""
    try:
        # Authenticate user
        user = await authenticate_user(user_credentials.email, user_credentials.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Create access token
        access_token = create_access_token(data={"sub": user["id"]})
        
        # Remove password from response
        del user["password"]
        user_obj = User(**user)
        
        return Token(access_token=access_token, user=user_obj)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

# ============================================================================
# USER ENDPOINTS
# ============================================================================

@api_router.put("/users/profile", response_model=User)
async def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update user profile"""
    try:
        update_dict = {}
        
        if update_data.name is not None:
            update_dict["name"] = sanitize_text(update_data.name)
        if update_data.age is not None:
            update_dict["age"] = update_data.age
        if update_data.location is not None:
            update_dict["location"] = sanitize_text(update_data.location)
        if update_data.bio is not None:
            update_dict["bio"] = sanitize_text(update_data.bio)
        if update_data.sports is not None:
            update_dict["sports"] = update_data.sports
        if update_data.skill_level is not None:
            update_dict["skill_level"] = update_data.skill_level
        if update_data.photo is not None and is_valid_base64_image(update_data.photo):
            update_dict["photo"] = update_data.photo
        
        update_dict["updated_at"] = datetime.utcnow()
        
        # Update user in database
        success = await update_document("users", {"id": current_user.id}, update_dict)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get updated user
        updated_user = await get_document("users", {"id": current_user.id})
        if "password" in updated_user:
            del updated_user["password"]
        
        return User(**updated_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed"
        )

@api_router.get("/users/stats", response_model=UserStats)
async def get_user_stats(current_user: User = Depends(get_current_user)):
    """Get user statistics"""
    try:
        # Count friends
        friends_count = await count_documents("friendships", {
            "$or": [
                {"user_id": current_user.id, "status": "accepted"},
                {"friend_id": current_user.id, "status": "accepted"}
            ]
        })
        
        return UserStats(
            events_participated=current_user.events_participated,
            events_created=current_user.events_created,
            badges_count=len(current_user.badges),
            friends_count=friends_count,
            sports_count=len(current_user.sports)
        )
        
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user stats"
        )

# ============================================================================
# SPORTS ENDPOINTS
# ============================================================================

@api_router.get("/sports", response_model=List[Sport])
async def get_sports():
    """Get all available sports"""
    return [Sport(**sport) for sport in get_all_sports()]

# ============================================================================
# EVENT ENDPOINTS
# ============================================================================

@api_router.post("/events", response_model=Event)
async def create_event(
    event_data: EventCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new event"""
    try:
        # Validate date and time formats
        if not validate_date_format(event_data.date):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD"
            )
        
        if not validate_time_format(event_data.time):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid time format. Use HH:MM"
            )
        
        # Validate sport exists
        if not get_sport_by_id(event_data.sport):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid sport"
            )
        
        # Generate event ID and tags
        event_id = generate_id()
        tags = generate_event_tags(event_data.dict())
        
        # Create event document
        event_doc = {
            "id": event_id,
            "title": sanitize_text(event_data.title),
            "title_da": sanitize_text(event_data.title_da),
            "sport": event_data.sport,
            "date": event_data.date,
            "time": event_data.time,
            "location": sanitize_text(event_data.location),
            "address": sanitize_text(event_data.address),
            "description": sanitize_text(event_data.description),
            "description_da": sanitize_text(event_data.description_da),
            "max_participants": event_data.max_participants,
            "skill_level": event_data.skill_level,
            "price": event_data.price,
            "organizer_id": current_user.id,
            "organizer_name": current_user.name,
            "current_participants": 1,
            "participants": [current_user.id],
            "status": EventStatus.ACTIVE,
            "tags": tags,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await create_document("events", event_doc)
        
        # Update user's events_created count
        await update_document(
            "users", 
            {"id": current_user.id}, 
            {
                "events_created": current_user.events_created + 1,
                "badges": get_user_badges(current_user.events_participated, current_user.events_created + 1)
            }
        )
        
        return Event(**event_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Event creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Event creation failed"
        )

@api_router.get("/events", response_model=List[Event])
async def get_events(
    sport: Optional[str] = Query(None),
    date_filter: Optional[str] = Query(None),
    skill_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    skip: int = Query(0, ge=0)
):
    """Get events with filters"""
    try:
        query = {"status": "active"}
        
        if sport and sport != "all":
            query["sport"] = sport
        
        if skill_level and skill_level != "all":
            query["skill_level"] = {"$in": [skill_level, "all"]}
        
        if date_filter:
            today = datetime.utcnow().strftime("%Y-%m-%d")
            tomorrow = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d")
            week_end = (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d")
            
            if date_filter == "today":
                query["date"] = today
            elif date_filter == "tomorrow":
                query["date"] = tomorrow
            elif date_filter == "thisWeek":
                query["date"] = {"$lte": week_end, "$gte": today}
        
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"title_da": {"$regex": search, "$options": "i"}},
                {"location": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"description_da": {"$regex": search, "$options": "i"}}
            ]
        
        events = await get_documents(
            "events", 
            query, 
            limit=limit, 
            skip=skip,
            sort=[("date", 1), ("time", 1)]
        )
        
        return [Event(**event) for event in events]
        
    except Exception as e:
        logger.error(f"Events fetch error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch events"
        )

@api_router.get("/events/{event_id}", response_model=EventWithParticipants)
async def get_event(event_id: str):
    """Get event by ID with participant details"""
    try:
        # Convert to ObjectId for MongoDB query
        from bson import ObjectId
        try:
            query = {"_id": ObjectId(event_id)}
        except:
            query = {"id": event_id}
        
        event = await get_document("events", {"id": event_id})
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        # Get participant details
        participant_details = []
        if event["participants"]:
            participants = await get_documents("users", {"id": {"$in": event["participants"]}})
            participant_details = [
                EventParticipant(
                    id=p["id"],
                    name=p["name"],
                    photo=p.get("photo")
                ) for p in participants
            ]
        
        event_obj = EventWithParticipants(**event, participant_details=participant_details)
        return event_obj
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Event fetch error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch event"
        )

@api_router.post("/events/{event_id}/join")
async def join_event(
    event_id: str,
    current_user: User = Depends(get_current_user)
):
    """Join an event"""
    try:
        # Get event
        event = await get_document("events", {"id": event_id})
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        # Check if already joined
        if current_user.id in event["participants"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already joined this event"
            )
        
        # Check if event is full
        if len(event["participants"]) >= event["max_participants"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event is full"
            )
        
        # Add user to participants
        updated_participants = event["participants"] + [current_user.id]
        await update_document(
            "events",
            {"id": event_id},
            {
                "participants": updated_participants,
                "current_participants": len(updated_participants),
                "updated_at": datetime.utcnow()
            }
        )
        
        # Update user's events_participated count
        await update_document(
            "users",
            {"id": current_user.id},
            {
                "events_participated": current_user.events_participated + 1,
                "badges": get_user_badges(current_user.events_participated + 1, current_user.events_created)
            }
        )
        
        return {"message": "Successfully joined event"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Join event error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to join event"
        )

@api_router.post("/events/{event_id}/leave")
async def leave_event(
    event_id: str,
    current_user: User = Depends(get_current_user)
):
    """Leave an event"""
    try:
        # Get event
        event = await get_document("events", {"id": event_id})
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        # Check if user is in participants
        if current_user.id not in event["participants"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not joined in this event"
            )
        
        # Check if user is organizer
        if current_user.id == event["organizer_id"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organizer cannot leave their own event"
            )
        
        # Remove user from participants
        updated_participants = [p for p in event["participants"] if p != current_user.id]
        await update_document(
            "events",
            {"id": event_id},
            {
                "participants": updated_participants,
                "current_participants": len(updated_participants),
                "updated_at": datetime.utcnow()
            }
        )
        
        # Update user's events_participated count
        new_count = max(0, current_user.events_participated - 1)
        await update_document(
            "users",
            {"id": current_user.id},
            {
                "events_participated": new_count,
                "badges": get_user_badges(new_count, current_user.events_created)
            }
        )
        
        return {"message": "Successfully left event"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Leave event error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to leave event"
        )

# ============================================================================
# MESSAGE ENDPOINTS  
# ============================================================================

@api_router.get("/events/{event_id}/messages", response_model=List[Message])
async def get_event_messages(
    event_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get messages for an event"""
    try:
        # Check if user is participant of the event
        event = await get_document("events", {"id": event_id})
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        if current_user.id not in event["participants"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be a participant to view messages"
            )
        
        # Get messages for the event
        messages = await get_documents(
            "messages",
            {"event_id": event_id},
            sort=[("created_at", 1)]
        )
        
        return [Message(**msg) for msg in messages]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Messages fetch error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch messages"
        )

@api_router.post("/events/{event_id}/messages", response_model=Message)
async def create_message(
    event_id: str,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a message in an event"""
    try:
        # Check if user is participant of the event
        event = await get_document("events", {"id": event_id})
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        if current_user.id not in event["participants"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be a participant to send messages"
            )
        
        # Create message document
        message_id = generate_id()
        message_doc = {
            "id": message_id,
            "event_id": event_id,
            "user_id": current_user.id,
            "user_name": current_user.name,
            "message": sanitize_text(message_data.message),
            "message_da": sanitize_text(message_data.message_da),
            "created_at": datetime.utcnow()
        }
        
        await create_document("messages", message_doc)
        
        return Message(**message_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Message creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create message"
        )

# ============================================================================
# FRIENDS ENDPOINTS
# ============================================================================

@api_router.get("/friends", response_model=List[FriendInfo])
async def get_friends(current_user: User = Depends(get_current_user)):
    """Get user's friends list"""
    try:
        # Get accepted friendships where user is either sender or receiver
        friendships = await get_documents("friendships", {
            "$or": [
                {"user_id": current_user.id, "status": "accepted"},
                {"friend_id": current_user.id, "status": "accepted"}
            ]
        })
        
        # Get friend IDs
        friend_ids = []
        for friendship in friendships:
            if friendship["user_id"] == current_user.id:
                friend_ids.append(friendship["friend_id"])
            else:
                friend_ids.append(friendship["user_id"])
        
        if not friend_ids:
            return []
        
        # Get friend details
        friends = await get_documents("users", {"id": {"$in": friend_ids}})
        
        # Calculate mutual events for each friend
        friend_infos = []
        for friend in friends:
            # Get events both users participated in
            user_events = await get_documents("events", {"participants": current_user.id})
            friend_events = await get_documents("events", {"participants": friend["id"]})
            
            user_event_ids = [e["id"] for e in user_events]
            friend_event_ids = [e["id"] for e in friend_events]
            mutual_events = calculate_mutual_events(user_event_ids, friend_event_ids)
            
            friend_info = FriendInfo(
                id=friend["id"],
                name=friend["name"],
                photo=friend.get("photo"),
                location=friend["location"],
                sports=friend.get("sports", []),
                age=friend["age"],
                status="offline",  # In real app, this would be from online status
                mutual_events=mutual_events
            )
            friend_infos.append(friend_info)
        
        return friend_infos
        
    except Exception as e:
        logger.error(f"Friends fetch error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch friends"
        )

@api_router.get("/friends/suggestions", response_model=List[FriendInfo])
async def get_friend_suggestions(
    current_user: User = Depends(get_current_user),
    limit: int = Query(10, le=20)
):
    """Get friend suggestions"""
    try:
        # Get existing friend IDs
        friendships = await get_documents("friendships", {
            "$or": [
                {"user_id": current_user.id},
                {"friend_id": current_user.id}
            ]
        })
        
        existing_friend_ids = set()
        for friendship in friendships:
            if friendship["user_id"] == current_user.id:
                existing_friend_ids.add(friendship["friend_id"])
            else:
                existing_friend_ids.add(friendship["user_id"])
        
        # Exclude current user and existing friends
        exclude_ids = list(existing_friend_ids) + [current_user.id]
        
        # Find users with similar sports interests
        suggestions = await get_documents(
            "users",
            {
                "id": {"$nin": exclude_ids},
                "sports": {"$in": current_user.sports} if current_user.sports else {}
            },
            limit=limit
        )
        
        # If not enough suggestions, add random users
        if len(suggestions) < limit:
            additional = await get_documents(
                "users",
                {"id": {"$nin": exclude_ids + [s["id"] for s in suggestions]}},
                limit=limit - len(suggestions)
            )
            suggestions.extend(additional)
        
        # Convert to FriendInfo
        friend_suggestions = []
        for user in suggestions:
            friend_info = FriendInfo(
                id=user["id"],
                name=user["name"],
                photo=user.get("photo"),
                location=user["location"],
                sports=user.get("sports", []),
                age=user["age"],
                status="offline",
                mutual_events=0
            )
            friend_suggestions.append(friend_info)
        
        return friend_suggestions
        
    except Exception as e:
        logger.error(f"Friend suggestions error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get friend suggestions"
        )

@api_router.post("/friends/{user_id}")
async def add_friend(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Send friend request"""
    try:
        # Check if user exists
        target_user = await get_document("users", {"id": user_id})
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot add yourself as friend"
            )
        
        # Check if friendship already exists
        existing = await get_document("friendships", {
            "$or": [
                {"user_id": current_user.id, "friend_id": user_id},
                {"user_id": user_id, "friend_id": current_user.id}
            ]
        })
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Friendship already exists"
            )
        
        # Create friendship (auto-accepted for simplicity)
        friendship_id = generate_id()
        friendship_doc = {
            "id": friendship_id,
            "user_id": current_user.id,
            "friend_id": user_id,
            "status": "accepted",  # Auto-accept for simplicity
            "mutual_events": 0,
            "created_at": datetime.utcnow()
        }
        
        await create_document("friendships", friendship_doc)
        
        return {"message": "Friend added successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Add friend error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add friend"
        )

@api_router.delete("/friends/{user_id}")
async def remove_friend(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Remove friend"""
    try:
        # Find and delete friendship
        deleted = await delete_document("friendships", {
            "$or": [
                {"user_id": current_user.id, "friend_id": user_id},
                {"user_id": user_id, "friend_id": current_user.id}
            ]
        })
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Friendship not found"
            )
        
        return {"message": "Friend removed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Remove friend error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove friend"
        )

# Basic hello world endpoint
@api_router.get("/")
async def root():
    return {"message": "SportConnect API is running!"}

# Include the router in the main app
app.include_router(api_router)