export interface ServiceData {
  id: string
  numericId: number // For backward compatibility
  icon: string // We'll handle icons in components
  title: string
  description: string // Short description for homepage
  shortDescription: string // Same as description
  fullDescription: string
  color: string
  startingPrice: number
  currency: string
  duration: string
  deliveryTime: string
  asapPrice: number
  asapDeliveryTime: string
  features: string[]
  popular: boolean
  samples: {
    celebrityId?: string // Optional celebrity ID from database
    celebrity: string // Fallback name
    thumbnail: string // Fallback thumbnail
  }[]
  talents: {
    celebrityId?: string // Optional celebrity ID from database
    name: string // Fallback name
    image: string // Fallback image
  }[]
}

// Fallback services data - used when database is unavailable or for initial setup
export const servicesData: ServiceData[] = [
  {
    id: "shout-outs",
    numericId: 1,
    icon: "Zap",
    title: "Quick shout-outs",
    description: "Fast and fun personalised shout-outs",
    shortDescription: "Fast and fun personalised shout-outs",
    fullDescription:
      "Get instant energy with quick, personalized shout-outs from your favorite talent. Perfect for birthdays, congratulations, or just to brighten someone's day with a burst of celebrity excitement.",
    color: "from-yellow-500 to-orange-500",
    startingPrice: 20,
    currency: "nzd",
    duration: "30 sec - 1min",
    deliveryTime: "1 - 3 days",
    asapPrice: 40,
    asapDeliveryTime: "12hrs",
    popular: true,
    features: [
      "Quick personalized message",
      "Mention recipient's name",
      "High-energy delivery",
      "HD video quality",
      "Fast turnaround",
      "Perfect for social sharing",
    ],
    samples: [
      { celebrityId: undefined, celebrity: "Kevin Hart", thumbnail: "/talents/1.jpeg" },
      { celebrityId: undefined, celebrity: "Ryan Reynolds", thumbnail: "/talents/2.jpg" },
      { celebrityId: undefined, celebrity: "Emma Stone", thumbnail: "/talents/3.jpg" },
    ],
    talents: [
      { celebrityId: undefined, name: "Kevin Hart", image: "/talents/1.jpeg" },
      { celebrityId: undefined, name: "Ryan Reynolds", image: "/talents/2.jpg" },
      { celebrityId: undefined, name: "Emma Stone", image: "/talents/3.jpg" },
    ],
  },
  {
    id: "personal",
    numericId: 2,
    icon: "MessageCircle",
    title: "Personalised video messages",
    description: "Custom video messages tailored specifically for you or your loved ones",
    shortDescription: "Custom video messages tailored specifically for you or your loved ones",
    fullDescription:
      "Experience the magic of a fully personalized video message crafted specifically for you or your loved ones. Our talent takes time to create meaningful, heartfelt content that will be treasured forever.",
    color: "from-blue-500 to-cyan-500",
    startingPrice: 149,
    currency: "nzd",
    duration: "1 - 3 minutes",
    deliveryTime: "2 - 5 days",
    asapPrice: 289,
    asapDeliveryTime: "24hrs",
    popular: true,
    features: [
      "Fully customizable content",
      "Personal anecdotes when possible",
      "Detailed personalization",
      "HD video quality",
      "Unlimited replays",
      "Digital download included",
    ],
    samples: [
      { celebrityId: undefined, celebrity: "John Legend", thumbnail: "/talents/4.jpg" },
      { celebrityId: undefined, celebrity: "Oprah Winfrey", thumbnail: "/talents/5.jpg" },
      { celebrityId: undefined, celebrity: "Taylor Swift", thumbnail: "/talents/6.jpg" },
    ],
    talents: [
      { celebrityId: undefined, name: "John Legend", image: "/talents/4.jpg" },
      { celebrityId: undefined, name: "Oprah Winfrey", image: "/talents/5.jpg" },
      { celebrityId: undefined, name: "Taylor Swift", image: "/talents/6.jpg" },
    ],
  },
  {
    id: "roast",
    numericId: 3,
    icon: "Laugh",
    title: "Roast someone",
    description: "Videos that tease or make fun of someone, in a good-natured way",
    shortDescription: "Videos that tease or make fun of someone, in a good-natured way",
    fullDescription:
      "Get ready to laugh until it hurts! Our comedy talent will deliver epic roasts and playful banter that's perfectly crafted to entertain while keeping it fun and friendly. Great for friends who love good humor!",
    color: "from-red-500 to-pink-500",
    startingPrice: 99,
    currency: "nzd",
    duration: "1 - 2 minutes",
    deliveryTime: "1 - 4 days",
    asapPrice: 199,
    asapDeliveryTime: "18hrs",
    popular: false,
    features: [
      "Hilarious custom roasts",
      "Playful and friendly tone",
      "Comedy legend delivery",
      "Shareable content",
      "Perfect for friends",
      "Guaranteed laughs",
    ],
    samples: [
      { celebrityId: undefined, celebrity: "Dave Chappelle", thumbnail: "/talents/1.jpeg" },
      { celebrityId: undefined, celebrity: "Amy Schumer", thumbnail: "/talents/2.jpg" },
      { celebrityId: undefined, celebrity: "Kevin Hart", thumbnail: "/talents/3.jpg" },
    ],
    talents: [
      { celebrityId: undefined, name: "Dave Chappelle", image: "/talents/1.jpeg" },
      { celebrityId: undefined, name: "Amy Schumer", image: "/talents/2.jpg" },
      { celebrityId: undefined, name: "Kevin Hart", image: "/talents/3.jpg" },
    ],
  },
  {
    id: "live",
    numericId: 4,
    icon: "Video",
    title: "5min Live interaction",
    description: "Real-time video calls and live one on one interactions",
    shortDescription: "Real-time video calls and live one on one interactions",
    fullDescription:
      "Experience the ultimate fan interaction with exclusive 5-minute live video calls. Have real conversations, ask questions, and create once-in-a-lifetime memories with your favorite talent.",
    color: "from-purple-500 to-indigo-500",
    startingPrice: 999,
    currency: "nzd",
    duration: "5 - 7 minutes",
    deliveryTime: "Schedule within 7 days",
    asapPrice: 1999,
    asapDeliveryTime: "6hrs",
    popular: false,
    features: [
      "Real-time video conversation",
      "Interactive Q&A session",
      "Screen recording included",
      "Flexible scheduling",
      "Technical support provided",
      "Exclusive experience",
    ],
    samples: [
      { celebrityId: undefined, celebrity: "MrBeast", thumbnail: "/talents/4.jpg" },
      { celebrityId: undefined, celebrity: "Emma Chamberlain", thumbnail: "/talents/5.jpg" },
      { celebrityId: undefined, celebrity: "PewDiePie", thumbnail: "/talents/6.jpg" },
    ],
    talents: [
      { celebrityId: undefined, name: "MrBeast", image: "/talents/4.jpg" },
      { celebrityId: undefined, name: "Emma Chamberlain", image: "/talents/5.jpg" },
      { celebrityId: undefined, name: "PewDiePie", image: "/talents/6.jpg" },
    ],
  },
  {
    id: "business",
    numericId: 5,
    icon: "Briefcase",
    title: "Business endorsements",
    description: "Professional endorsements and business shout-outs",
    shortDescription: "Professional endorsements and business shout-outs",
    fullDescription:
      "Boost your business credibility with professional talent endorsements. Perfect for product launches, company milestones, team motivation, or marketing campaigns that need that extra star power.",
    color: "from-green-500 to-emerald-500",
    startingPrice: 499,
    currency: "nzd",
    duration: "2 - 4 minutes",
    deliveryTime: "3 - 10 days",
    asapPrice: 999,
    asapDeliveryTime: "48hrs",
    popular: false,
    features: [
      "Professional business endorsement",
      "Brand/product mentions",
      "Company milestone celebrations",
      "Team motivation messages",
      "Marketing campaign content",
      "Commercial usage rights",
    ],
    samples: [
      { celebrityId: undefined, celebrity: "Gary Vaynerchuk", thumbnail: "/talents/1.jpeg" },
      { celebrityId: undefined, celebrity: "Tony Robbins", thumbnail: "/talents/2.jpg" },
      { celebrityId: undefined, celebrity: "Shark Tank Cast", thumbnail: "/talents/3.jpg" },
    ],
    talents: [
      { celebrityId: undefined, name: "Gary Vaynerchuk", image: "/talents/1.jpeg" },
      { celebrityId: undefined, name: "Tony Robbins", image: "/talents/2.jpg" },
      { celebrityId: undefined, name: "Shark Tank Cast", image: "/talents/3.jpg" },
    ],
  },
  {
    id: "motivation",
    numericId: 6,
    icon: "Gift",
    title: "Motivational video messages",
    description: "Inspiring and uplifting messages to boost confidence and motivation",
    shortDescription: "Inspiring and uplifting messages to boost confidence and motivation",
    fullDescription:
      "Get the inspiration you need from world-renowned motivational speakers and successful entrepreneurs. Perfect for overcoming challenges, achieving goals, or starting new ventures with confidence.",
    color: "from-indigo-500 to-purple-500",
    startingPrice: 199,
    currency: "nzd",
    duration: "2 - 5 minutes",
    deliveryTime: "2 - 7 days",
    asapPrice: 389,
    asapDeliveryTime: "24hrs",
    popular: false,
    features: [
      "Personalized motivational content",
      "Goal-specific encouragement",
      "Success strategies shared",
      "Confidence-building messages",
      "Life coaching insights",
      "Inspirational quotes included",
    ],
    samples: [
      { celebrityId: undefined, celebrity: "Tony Robbins", thumbnail: "/talents/4.jpg" },
      { celebrityId: undefined, celebrity: "Oprah Winfrey", thumbnail: "/talents/5.jpg" },
      { celebrityId: undefined, celebrity: "Mel Robbins", thumbnail: "/talents/6.jpg" },
    ],
    talents: [
      { celebrityId: undefined, name: "Tony Robbins", image: "/talents/4.jpg" },
      { celebrityId: undefined, name: "Oprah Winfrey", image: "/talents/5.jpg" },
      { celebrityId: undefined, name: "Mel Robbins", image: "/talents/6.jpg" },
    ],
  },
]

// Helper function to format price
export const formatPrice = (price: number, currency = "nzd") => {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Helper function to get service by ID
export const getServiceById = (id: string) => {
  return servicesData.find((service) => service.id === id)
}

// Helper function to get service by numeric ID (for backward compatibility)
export const getServiceByNumericId = (id: number) => {
  return servicesData.find((service) => service.numericId === id)
}

// Greetings for the hero animation
export const heroGreetings = [
  "Kia Ora",
  "Mahalo",
  "Bula",
  "Aloha",
  "Io Rana",
  "Malo e Lelei",
  "Talofa",
  "Talofa",
  "Tena Koe",
  "Hello",
  "G'day",
]


// Greetings for the hero animation
export const heroCelebrityGreetings = [
  "Discover",
  "Amazing",
  "Talent"
]



// Helper function to check if we're using fallback data
export const isFallbackData = () => true

// Helper function to get all service IDs
export const getAllServiceIds = () => {
  return servicesData.map((service) => service.id)
}

// Helper function to get popular services
export const getPopularServices = () => {
  return servicesData.filter((service) => service.popular)
}
