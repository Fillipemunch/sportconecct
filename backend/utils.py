from datetime import datetime
from typing import List, Dict, Any
import uuid
import base64
import re

def generate_id() -> str:
    """Generate a unique ID"""
    return str(uuid.uuid4())

def validate_date_format(date_string: str) -> bool:
    """Validate date format (YYYY-MM-DD)"""
    try:
        datetime.strptime(date_string, "%Y-%m-%d")
        return True
    except ValueError:
        return False

def validate_time_format(time_string: str) -> bool:
    """Validate time format (HH:MM)"""
    try:
        datetime.strptime(time_string, "%H:%M")
        return True
    except ValueError:
        return False

def is_valid_base64_image(image_string: str) -> bool:
    """Check if string is a valid base64 image"""
    if not image_string:
        return False
    
    # Check if it starts with data:image
    if not image_string.startswith('data:image/'):
        return False
    
    try:
        # Extract the base64 part
        base64_part = image_string.split(',')[1]
        base64.b64decode(base64_part)
        return True
    except:
        return False

def generate_avatar_base64(name: str, color: str = "#4F46E5") -> str:
    """Generate a simple SVG avatar in base64 format"""
    initials = ''.join([n[0].upper() for n in name.split()[:2]])
    
    svg = f'''<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="{color}"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20" font-family="Arial">{initials}</text>
    </svg>'''
    
    svg_base64 = base64.b64encode(svg.encode('utf-8')).decode('utf-8')
    return f"data:image/svg+xml;base64,{svg_base64}"

def calculate_mutual_events(user_events: List[str], friend_events: List[str]) -> int:
    """Calculate number of mutual events between two users"""
    return len(set(user_events) & set(friend_events))

def generate_event_tags(event_data: Dict[str, Any]) -> List[str]:
    """Generate tags for an event based on its properties"""
    tags = []
    
    if event_data.get('price', 0) == 0:
        tags.append('free')
    else:
        tags.append('paid')
    
    location = event_data.get('location', '').lower()
    if 'indoor' in location or 'gym' in location or 'center' in location:
        tags.append('indoor')
    else:
        tags.append('outdoor')
    
    sport = event_data.get('sport', '')
    if sport:
        tags.append(sport)
    
    skill_level = event_data.get('skill_level', '')
    if skill_level and skill_level != 'all':
        tags.append(skill_level)
    
    return tags

def sanitize_text(text: str) -> str:
    """Sanitize text input"""
    if not text:
        return ""
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    return text.strip()

def format_datetime_for_db(date_str: str, time_str: str) -> datetime:
    """Combine date and time strings into datetime object"""
    datetime_str = f"{date_str} {time_str}"
    return datetime.strptime(datetime_str, "%Y-%m-%d %H:%M")

def get_user_badges(events_participated: int, events_created: int) -> List[str]:
    """Generate user badges based on activity"""
    badges = []
    
    if events_participated >= 1:
        badges.append("First Timer")
    if events_participated >= 5:
        badges.append("Active Player")
    if events_participated >= 10:
        badges.append("Sports Enthusiast")
    if events_participated >= 25:
        badges.append("Community Champion")
    
    if events_created >= 1:
        badges.append("Event Organizer")
    if events_created >= 5:
        badges.append("Community Builder")
    if events_created >= 10:
        badges.append("Sports Leader")
    
    return badges