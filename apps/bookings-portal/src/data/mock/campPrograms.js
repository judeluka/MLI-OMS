export const campPrograms = [
  {
    id: 'intensive-english-dublin',
    name: 'Intensive English Summer Camp',
    description: 'Our flagship 20-lesson per week English language program designed for rapid improvement in speaking, listening, reading, and writing skills.',
    location: 'Dublin Campus',
    targetAge: '12-17 years',
    targetLevel: 'Beginner to Advanced',
    duration: '1-4 weeks',
    maxStudents: 180,
    features: [
      '20 lessons per week (15 hours)',
      'Small class sizes (max 15 students)',
      'Interactive learning methods',
      'Weekly progress assessments',
      'Certificate of completion',
      'Mixed nationality classes'
    ],
    imageUrl: '/images/camps/intensive-english-dublin.jpg',
    sessions: [
      {
        id: 'ie-dub-jul1',
        startDate: '2024-07-01',
        endDate: '2024-07-14',
        availableSpaces: 45,
        status: 'available'
      },
      {
        id: 'ie-dub-jul15',
        startDate: '2024-07-15',
        endDate: '2024-07-28',
        availableSpaces: 23,
        status: 'available'
      },
      {
        id: 'ie-dub-aug1',
        startDate: '2024-08-01',
        endDate: '2024-08-14',
        availableSpaces: 8,
        status: 'limited'
      },
      {
        id: 'ie-dub-aug15',
        startDate: '2024-08-15',
        endDate: '2024-08-28',
        availableSpaces: 0,
        status: 'full'
      }
    ]
  },
  {
    id: 'english-adventure-cork',
    name: 'English with Adventure Sports Camp',
    description: 'Combine English language learning with thrilling outdoor activities including kayaking, rock climbing, and hiking in beautiful Cork.',
    location: 'Cork Campus',
    targetAge: '14-17 years',
    targetLevel: 'Intermediate to Advanced',
    duration: '2-3 weeks',
    maxStudents: 120,
    features: [
      '15 lessons per week (11.25 hours)',
      '10 hours adventure activities per week',
      'Qualified adventure sports instructors',
      'All safety equipment provided',
      'English through outdoor challenges',
      'Leadership development focus'
    ],
    imageUrl: '/images/camps/adventure-cork.jpg',
    sessions: [
      {
        id: 'ea-cork-jul1',
        startDate: '2024-07-01',
        endDate: '2024-07-21',
        availableSpaces: 32,
        status: 'available'
      },
      {
        id: 'ea-cork-jul22',
        startDate: '2024-07-22',
        endDate: '2024-08-11',
        availableSpaces: 15,
        status: 'available'
      },
      {
        id: 'ea-cork-aug12',
        startDate: '2024-08-12',
        endDate: '2024-09-01',
        availableSpaces: 6,
        status: 'limited'
      }
    ]
  },
  {
    id: 'english-arts-galway',
    name: 'English & Creative Arts Camp',
    description: 'Perfect blend of English language learning and creative expression through drama, music, visual arts, and creative writing workshops.',
    location: 'Galway Campus',
    targetAge: '13-16 years',
    targetLevel: 'Elementary to Upper-Intermediate',
    duration: '2-4 weeks',
    maxStudents: 100,
    features: [
      '15 lessons per week (11.25 hours)',
      '8 hours creative workshops per week',
      'Drama and performance projects',
      'Art exhibition at program end',
      'Creative writing portfolio',
      'Guest artist masterclasses'
    ],
    imageUrl: '/images/camps/arts-galway.jpg',
    sessions: [
      {
        id: 'ea-gal-jul8',
        startDate: '2024-07-08',
        endDate: '2024-07-21',
        availableSpaces: 28,
        status: 'available'
      },
      {
        id: 'ea-gal-jul22',
        startDate: '2024-07-22',
        endDate: '2024-08-04',
        availableSpaces: 19,
        status: 'available'
      },
      {
        id: 'ea-gal-aug5',
        startDate: '2024-08-05',
        endDate: '2024-08-18',
        availableSpaces: 12,
        status: 'available'
      }
    ]
  },
  {
    id: 'business-english-dublin',
    name: 'Future Leaders Business English',
    description: 'Specialized program for ambitious students aged 16-18, focusing on business English, leadership skills, and career preparation.',
    location: 'Dublin Business Campus',
    targetAge: '16-18 years',
    targetLevel: 'Intermediate to Advanced',
    duration: '2-3 weeks',
    maxStudents: 60,
    features: [
      '25 lessons per week (18.75 hours)',
      'Business case studies',
      'Presentation skills development',
      'Mock interview training',
      'Company visit opportunities',
      'LinkedIn profile workshop'
    ],
    imageUrl: '/images/camps/business-dublin.jpg',
    sessions: [
      {
        id: 'bl-dub-jul8',
        startDate: '2024-07-08',
        endDate: '2024-07-21',
        availableSpaces: 18,
        status: 'available'
      },
      {
        id: 'bl-dub-jul29',
        startDate: '2024-07-29',
        endDate: '2024-08-11',
        availableSpaces: 12,
        status: 'available'
      }
    ]
  }
];

export const accommodationTypes = [
  {
    id: 'on-campus-twin',
    name: 'On-campus Residential Twin Room',
    description: 'Shared twin room in our modern on-campus residence with ensuite bathroom, study area, and common spaces.',
    features: ['Ensuite bathroom', 'Study desk', 'Wardrobe space', '24/7 supervision', 'Common room access', 'Laundry facilities'],
    imageUrl: '/images/accommodation/on-campus-twin.jpg',
    pricePerWeek: 280,
    availability: 'high'
  },
  {
    id: 'on-campus-single',
    name: 'On-campus Residential Single Room',
    description: 'Private single room in our premium residence with ensuite bathroom and enhanced amenities.',
    features: ['Private ensuite', 'Premium furnishing', 'Mini-fridge', 'Study area', '24/7 supervision', 'Premium common areas'],
    imageUrl: '/images/accommodation/on-campus-single.jpg',
    pricePerWeek: 420,
    availability: 'medium'
  },
  {
    id: 'host-family-single',
    name: 'Host Family Placement - Single Room',
    description: 'Live with carefully selected Irish host families for authentic cultural immersion and language practice.',
    features: ['Private bedroom', 'Breakfast & dinner included', 'Family activities', 'Cultural immersion', 'Irish family support', 'Weekend activities'],
    imageUrl: '/images/accommodation/host-family.jpg',
    pricePerWeek: 320,
    availability: 'high'
  },
  {
    id: 'host-family-twin',
    name: 'Host Family Placement - Twin Room',
    description: 'Share a room with another student in a welcoming Irish host family environment.',
    features: ['Shared room', 'All meals included', 'Family activities', 'Cultural exchange', 'Supervised environment', 'Local experiences'],
    imageUrl: '/images/accommodation/host-family-twin.jpg',
    pricePerWeek: 250,
    availability: 'high'
  },
  {
    id: 'partner-hotel',
    name: 'Partner Hotel Standard Room',
    description: 'Comfortable hotel accommodation for groups preferring hotel-style services and amenities.',
    features: ['Hotel services', 'Daily housekeeping', 'Restaurant access', 'Group supervision', 'Central location', 'Modern amenities'],
    imageUrl: '/images/accommodation/partner-hotel.jpg',
    pricePerWeek: 380,
    availability: 'medium'
  }
];

export const packageOptions = [
  {
    id: 'standard',
    name: 'Standard Package',
    description: 'Essential camp experience with all core elements included.',
    included: [
      'English lessons as per program',
      'Accommodation (selected type)',
      'All meals (breakfast, lunch, dinner)',
      'Course materials and books',
      'Welcome orientation',
      'Certificate of completion',
      '24/7 supervision and support',
      'Basic activity program'
    ],
    priceModifier: 0,
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium Package',
    description: 'Enhanced experience with additional excursions and premium services.',
    included: [
      'All Standard Package inclusions',
      'Weekly full-day excursions',
      'Airport transfer service',
      'Premium welcome pack',
      'Additional evening activities',
      'Progress report and feedback',
      'Photo package of camp experience',
      'Emergency phone support'
    ],
    priceModifier: 150,
    popular: true
  },
  {
    id: 'deluxe',
    name: 'Deluxe Package',
    description: 'Ultimate camp experience with exclusive activities and personalized services.',
    included: [
      'All Premium Package inclusions',
      'Private tutoring sessions (2 hours/week)',
      'Exclusive cultural workshops',
      'VIP excursions and experiences',
      'Personal progress coaching',
      'Digital portfolio creation',
      'Alumni network access',
      'Post-camp online support (3 months)'
    ],
    priceModifier: 300,
    popular: false
  }
];

export const basePricing = {
  'intensive-english-dublin': {
    oneWeek: 650,
    twoWeeks: 1200,
    threeWeeks: 1700,
    fourWeeks: 2150
  },
  'english-adventure-cork': {
    twoWeeks: 1400,
    threeWeeks: 2000
  },
  'english-arts-galway': {
    twoWeeks: 1250,
    threeWeeks: 1800,
    fourWeeks: 2300
  },
  'business-english-dublin': {
    twoWeeks: 1500,
    threeWeeks: 2200
  }
}; 