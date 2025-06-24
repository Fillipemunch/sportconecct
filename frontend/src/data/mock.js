// Mock data for SportConnect
export const mockUsers = [
  {
    id: '1',
    name: 'Lars Hansen',
    email: 'lars@example.com',
    age: 28,
    photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjNEY0NkU1Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIj5MSDwvdGV4dD4KPC9zdmc+',
    sports: ['football', 'running', 'cycling'],
    skillLevel: 'intermediate',
    location: 'Copenhagen, Denmark',
    bio: 'Passionate about staying active and meeting new people through sports!',
    eventsParticipated: 15,
    eventsCreated: 3,
    badges: ['Early Bird', 'Team Player', 'Consistent Performer']
  },
  {
    id: '2',
    name: 'Maria Silva',
    email: 'maria@example.com',
    age: 24,
    photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRUY0NDQ0Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIj5NUzwvdGV4dD4KPC9zdmc+',
    sports: ['tennis', 'basketball', 'fitness'],
    skillLevel: 'advanced',
    location: 'Aarhus, Denmark',
    bio: 'Tennis coach and fitness enthusiast. Love competitive sports!',
    eventsParticipated: 22,
    eventsCreated: 8,
    badges: ['Coach', 'Champion', 'Community Builder']
  }
];

export const mockEvents = [
  {
    id: '1',
    title: 'Morning Football Match',
    titleDa: 'Morgen Fodboldkamp',
    sport: 'football',
    date: '2025-06-15',
    time: '09:00',
    location: 'Fælledparken, Copenhagen',
    address: 'Fælledparken, 2100 København Ø, Denmark',
    description: 'Friendly football match for all skill levels. Bring your boots!',
    descriptionDa: 'Venlig fodboldkamp for alle færdighedsniveauer. Tag dine støvler med!',
    maxParticipants: 20,
    currentParticipants: 12,
    skillLevel: 'all',
    organizerId: '1',
    organizer: 'Lars Hansen',
    price: 0,
    participants: ['1', '2'],
    status: 'active',
    tags: ['outdoor', 'team-sport', 'free']
  },
  {
    id: '2',
    title: '5K Morning Run',
    titleDa: '5K Morgenløb',
    sport: 'running',
    date: '2025-06-16',
    time: '07:00',
    location: 'The Lakes, Copenhagen',
    address: 'Søerne, 2100 København, Denmark',
    description: 'Join us for an energizing morning run around the beautiful Copenhagen Lakes.',
    descriptionDa: 'Kom med til en energigivende morgenløb rundt om de smukke københavnske søer.',
    maxParticipants: 15,
    currentParticipants: 8,
    skillLevel: 'intermediate',
    organizerId: '2',
    organizer: 'Maria Silva',
    price: 0,
    participants: ['1', '2'],
    status: 'active',
    tags: ['outdoor', 'cardio', 'free']
  },
  {
    id: '3',
    title: 'Basketball Training Session',
    titleDa: 'Basketball Træningssession',
    sport: 'basketball',
    date: '2025-06-17',
    time: '18:30',
    location: 'Østerbro Idrætspark',
    address: 'Østerbro Idrætspark, 2100 København Ø, Denmark',
    description: 'Indoor basketball training focusing on fundamentals and team play.',
    descriptionDa: 'Indendørs basketballtræning med fokus på grundlæggende færdigheder og holdspil.',
    maxParticipants: 12,
    currentParticipants: 6,
    skillLevel: 'beginner',
    organizerId: '2',
    organizer: 'Maria Silva',
    price: 50,
    participants: ['2'],
    status: 'active',
    tags: ['indoor', 'team-sport', 'training']
  }
];

export const mockSports = [
  { id: 'football', name: 'Football', nameDa: 'Fodbold', icon: '⚽', color: '#10B981' },
  { id: 'basketball', name: 'Basketball', nameDa: 'Basketball', icon: '🏀', color: '#F59E0B' },
  { id: 'tennis', name: 'Tennis', nameDa: 'Tennis', icon: '🎾', color: '#EF4444' },
  { id: 'running', name: 'Running', nameDa: 'Løb', icon: '🏃', color: '#8B5CF6' },
  { id: 'cycling', name: 'Cycling', nameDa: 'Cykling', icon: '🚴', color: '#06B6D4' },
  { id: 'fitness', name: 'Fitness', nameDa: 'Fitness', icon: '💪', color: '#F97316' }
];

export const mockFriends = [
  { id: '2', name: 'Maria Silva', status: 'online', mutualEvents: 5 },
  { id: '3', name: 'Erik Andersen', status: 'offline', mutualEvents: 2 },
  { id: '4', name: 'Sarah Johnson', status: 'online', mutualEvents: 8 }
];

export const mockMessages = [
  {
    id: '1',
    eventId: '1',
    userId: '1',
    userName: 'Lars Hansen',
    message: 'Looking forward to the match! Who\'s bringing the ball?',
    messageDa: 'Glæder mig til kampen! Hvem tager bolden med?',
    timestamp: '2025-06-14T15:30:00Z'
  },
  {
    id: '2',
    eventId: '1',
    userId: '2',
    userName: 'Maria Silva',
    message: 'I can bring one! See you all tomorrow morning.',
    messageDa: 'Jeg kan tage en med! Vi ses i morgen tidlig.',
    timestamp: '2025-06-14T16:15:00Z'
  }
];

// Current user - this will be updated when auth is implemented
export let currentUser = null;

export const setCurrentUser = (user) => {
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const getCurrentUser = () => {
  if (currentUser) return currentUser;
  const stored = localStorage.getItem('currentUser');
  if (stored) {
    currentUser = JSON.parse(stored);
    return currentUser;
  }
  return null;
};

export const logout = () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
};