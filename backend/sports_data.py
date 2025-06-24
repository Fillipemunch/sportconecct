# Sports data that will be used in the application
SPORTS_DATA = [
    {
        "id": "football",
        "name": "Football",
        "name_da": "Fodbold",
        "icon": "⚽",
        "color": "#10B981"
    },
    {
        "id": "basketball",
        "name": "Basketball",
        "name_da": "Basketball",
        "icon": "🏀",
        "color": "#F59E0B"
    },
    {
        "id": "tennis",
        "name": "Tennis",
        "name_da": "Tennis",
        "icon": "🎾",
        "color": "#EF4444"
    },
    {
        "id": "running",
        "name": "Running",
        "name_da": "Løb",
        "icon": "🏃",
        "color": "#8B5CF6"
    },
    {
        "id": "cycling",
        "name": "Cycling",
        "name_da": "Cykling",
        "icon": "🚴",
        "color": "#06B6D4"
    },
    {
        "id": "fitness",
        "name": "Fitness",
        "name_da": "Fitness",
        "icon": "💪",
        "color": "#F97316"
    }
]

def get_sport_by_id(sport_id: str):
    """Get sport information by ID"""
    return next((sport for sport in SPORTS_DATA if sport["id"] == sport_id), None)

def get_all_sports():
    """Get all sports data"""
    return SPORTS_DATA