# Additional endpoints for messages and friends - to be added to server.py

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