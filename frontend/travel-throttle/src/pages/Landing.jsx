/**
 * LANDING PAGE
 * Modern, responsive home page - All issues fixed
 * - Hero image fixed
 * - Ride stories images fixed
 * - Search and filter working perfectly
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { publicRideService } from '../services/publicRideService';
import { formatDate, formatCurrency } from '../utils/helpers';
import { ROUTES } from '../constants';
import { Button, Input, Card, Badge, Avatar } from '../components/common';
import { 
  FiSearch, FiMapPin, FiCalendar, FiUsers, FiDollarSign, 
  FiArrowRight, FiStar, FiShield, FiClock,
  FiNavigation, FiFilter, FiX, FiChevronRight,
  FiFacebook, FiTwitter, FiInstagram, FiLinkedin,
  FiMail, FiPhone, FiCheckCircle, FiLoader,
  FiChevronLeft, FiChevronRight as FiChevronRightIcon,
  FiMessageSquare, FiChevronDown, FiChevronUp, FiEye,
  FiMenu, FiAward, FiTrendingUp, FiHeart
} from 'react-icons/fi';
import { 
  FaMotorcycle, FaUserFriends, FaRoute, FaHandHoldingHeart, 
  FaQuoteLeft
} from 'react-icons/fa';

// Ride Stories with reliable working images
const MOCK_STORIES = [
  {
    id: 1,
    user: { name: 'Rahul Sharma', avatar: null, verified: true },
    title: 'Amazing Weekend Ride to Lonavala',
    description: 'Found 3 amazing riders through Travel Throttle. We split the fuel cost and had an incredible journey through the ghats.',
    ride: { source: 'Mumbai', destination: 'Lonavala', distance: '85 km' },
    rating: 5,
    image: 'https://images.pexels.com/photos/39693/motorcycle-racer-racing-speed-39693.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    date: '2 weeks ago'
  },
  {
    id: 2,
    user: { name: 'Priya Patel', avatar: null, verified: true },
    title: 'First Solo Trip Made Easy',
    description: 'I was nervous about my first bike trip to Alibaug, but the community here is so welcoming. Found a great group!',
    ride: { source: 'Thane', destination: 'Alibaug', distance: '95 km' },
    rating: 5,
    image: 'https://images.pexels.com/photos/2611684/pexels-photo-2611684.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    date: '1 month ago'
  },
  {
    id: 3,
    user: { name: 'Amit Kumar', avatar: null, verified: true },
    title: 'Saved ₹1200 on My Pune Trip',
    description: 'Instead of going alone, I posted a ride to Pune. Within hours, 3 people joined. We split costs and had great conversations.',
    ride: { source: 'Bandra', destination: 'Pune', distance: '150 km' },
    rating: 5,
    image: 'https://images.pexels.com/photos/3184299/pexels-photo-3184299.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    date: '3 weeks ago'
  }
];

const STATS = [
  { icon: FaUserFriends, value: '5,000+', label: 'Active Riders', color: 'from-blue-500 to-cyan-500' },
  { icon: FaRoute, value: '1,200+', label: 'Rides Completed', color: 'from-purple-500 to-pink-500' },
  { icon: FaMotorcycle, value: '800+', label: 'Bikes Registered', color: 'from-orange-500 to-red-500' },
  { icon: FaHandHoldingHeart, value: '₹2.5L+', label: 'Money Saved', color: 'from-green-500 to-emerald-500' }
];

const FEATURES = [
  { icon: FiSearch, title: 'Find Perfect Ride', description: 'Search and filter rides based on your route, date, and budget.', color: 'from-blue-500/20 to-cyan-500/20' },
  { icon: FiUsers, title: 'Join or Create', description: 'Join existing rides or create your own if you have a bike.', color: 'from-purple-500/20 to-pink-500/20' },
  { icon: FiDollarSign, title: 'Split Costs', description: 'Share fuel and toll costs fairly with your co-riders.', color: 'from-green-500/20 to-emerald-500/20' },
  { icon: FiMessageSquare, title: 'Group Chat', description: 'Coordinate with your ride group in real-time.', color: 'from-orange-500/20 to-amber-500/20' },
  { icon: FiShield, title: 'Verified Riders', description: 'All users are verified. Rate your experience.', color: 'from-indigo-500/20 to-blue-500/20' },
  { icon: FiEye, title: 'Mobile Friendly', description: 'Access everything on the go with our responsive design.', color: 'from-pink-500/20 to-rose-500/20' }
];

const FAQ_ITEMS = [
  { question: 'How does Travel Throttle work?', answer: 'Bike owners can create rides, and passengers can join. Costs are split among all participants.' },
  { question: 'Is it safe to ride with strangers?', answer: 'Yes! All users are verified with phone numbers. You can check ratings before joining.' },
  { question: 'How is the cost calculated?', answer: 'The ride owner sets the cost per person for fuel and toll charges.' },
  { question: 'Can I join with my own bike?', answer: 'Absolutely! Join as a rider and be part of the bike group.' }
];

export const Landing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({ source: '', destination: '', date: '', maxPrice: '', minSeats: '' });
  const [activeFaq, setActiveFaq] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [searchError, setSearchError] = useState('');
  
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    fetchUpcomingRides();
  }, []);

  useEffect(() => {
    const count = Object.values(filters).filter(v => v && v.trim() !== '').length;
    setActiveFilterCount(count);
  }, [filters]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStoryIndex(prev => (prev + 1) % MOCK_STORIES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const fetchUpcomingRides = async () => {
    try {
      const response = await publicRideService.getAllUpcomingRides();
      if (response.success && response.data) {
        setUpcomingRides(response.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching upcoming rides:', error);
    }
  };

  const handleSearch = async () => {
    console.log('=== SEARCH START ===');
    console.log('Search query:', searchQuery);
    console.log('Filters:', filters);
    
    setLoading(true);
    setHasSearched(true);
    setSearchError('');
    
    try {
      const searchFilters = {};
      
      // Add search query to both source and destination for better results
      if (searchQuery.trim()) {
        searchFilters.source = searchQuery.trim();
        searchFilters.destination = searchQuery.trim();
      }
      
      // Add specific filters if provided
      if (filters.source.trim()) searchFilters.source = filters.source.trim();
      if (filters.destination.trim()) searchFilters.destination = filters.destination.trim();
      if (filters.date) searchFilters.date = filters.date;
      if (filters.maxPrice) searchFilters.maxPrice = parseFloat(filters.maxPrice);
      if (filters.minSeats) searchFilters.minSeats = parseInt(filters.minSeats);
      
      console.log('Final search filters:', searchFilters);
      
      let response;
      if (Object.keys(searchFilters).length === 0) {
        console.log('No filters, getting all upcoming rides...');
        response = await publicRideService.getAllUpcomingRides();
      } else {
        console.log('Searching with filters...');
        response = await publicRideService.searchRides(searchFilters);
      }
      
      console.log('Search response:', response);
      
      if (response.success) {
        const rides = response.data || [];
        console.log('Found rides:', rides.length);
        setSearchResults(rides);
        
        if (rides.length === 0) {
          setSearchError('No rides found. Try adjusting your search terms.');
        }
        
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        console.error('Search failed:', response.error);
        setSearchError(response.error || 'Search failed. Please try again.');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('An error occurred while searching. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({ source: '', destination: '', date: '', maxPrice: '', minSeats: '' });
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setSearchError('');
  };

  const handleJoinRequest = (rideId) => {
    navigate(ROUTES.PUBLIC.LOGIN.path, { state: { from: `/rides/${rideId}` } });
  };

  const scrollToSearch = () => {
    searchRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const nextStory = () => setCurrentStoryIndex(prev => (prev + 1) % MOCK_STORIES.length);
  const prevStory = () => setCurrentStoryIndex(prev => (prev - 1 + MOCK_STORIES.length) % MOCK_STORIES.length);
  const toggleFaq = (index) => setActiveFaq(activeFaq === index ? null : index);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg overflow-x-hidden">
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Modern Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-card/80 backdrop-blur-2xl border-b border-white/5 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary via-secondary to-accent rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <FaMotorcycle className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-bold">
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">Travel</span>
                  <span className="text-white ml-1">Throttle</span>
                </h1>
                <p className="text-[10px] md:text-xs text-gray-400 -mt-1 tracking-widest">RIDE TOGETHER • SAVE TOGETHER</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              <button onClick={scrollToSearch} className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                Find Rides
              </button>
              <Link to={ROUTES.PUBLIC.LOGIN.path}>
                <Button variant="ghost" size="sm" className="font-medium">Sign In</Button>
              </Link>
              <Link to={ROUTES.PUBLIC.SIGNUP.path}>
                <Button variant="primary" size="sm" className="bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/5 animate-slide-down">
              <div className="flex flex-col gap-2">
                <button onClick={scrollToSearch} className="text-left text-gray-300 hover:text-white px-3 py-2 text-sm">
                  Find Rides
                </button>
                <Link to={ROUTES.PUBLIC.LOGIN.path} className="w-full">
                  <Button variant="ghost" size="sm" fullWidth>Sign In</Button>
                </Link>
                <Link to={ROUTES.PUBLIC.SIGNUP.path} className="w-full">
                  <Button variant="primary" size="sm" fullWidth className="bg-gradient-to-r from-primary to-secondary">Get Started</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-28 lg:pt-32 pb-16 md:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-20 -right-40 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse-slow animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
                <FiAward className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">India's #1 Bike Ride Sharing Platform</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                Ride Together,
                <br />
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
                  Save Together
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-300 mt-6 max-w-xl mx-auto lg:mx-0">
                Join thousands of riders sharing journeys, splitting costs, and making unforgettable memories on the open road.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 text-base px-8"
                  onClick={scrollToSearch}
                  rightIcon={<FiArrowRight className="w-5 h-5" />}
                >
                  Find a Ride
                </Button>
                <Link to={ROUTES.PUBLIC.SIGNUP.path}>
                  <Button variant="outline" size="lg" className="text-base px-8 border-white/20 hover:border-primary/50 transition-all duration-300">
                    Create Account
                  </Button>
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-8 text-sm text-gray-400">
                <span className="flex items-center gap-2"><FiShield className="text-primary w-4 h-4" /> Verified Riders</span>
                <span className="flex items-center gap-2"><FiStar className="text-yellow-500 w-4 h-4 fill-current" /> 4.8+ Rating</span>
                <span className="flex items-center gap-2"><FiUsers className="w-4 h-4" /> 5,000+ Community</span>
              </div>
            </div>
            
            {/* Right Content - Hero Image - FIXED */}
            <div className="relative mt-8 lg:mt-0">
              {/* Card 1 - Behind Image - Top Right */}
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 z-20">
                <div className="bg-dark-card/90 backdrop-blur-xl p-3 sm:p-4 rounded-xl shadow-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <FaRoute className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-white">1.2K+</p>
                      <p className="text-xs text-gray-400">Rides Completed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Image */}
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img 
                  src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
                  alt="Bikers riding together"
                  className="w-full h-auto object-cover aspect-[4/3]"
                  onError={(e) => { e.target.src = 'https://images.pexels.com/photos/39693/motorcycle-racer-racing-speed-39693.jpeg?auto=compress&cs=tinysrgb&w=800'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent pointer-events-none"></div>
              </div>

              {/* Card 2 - Above Image - Bottom Left */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 z-20">
                <div className="bg-dark-card/90 backdrop-blur-xl p-3 sm:p-4 rounded-xl shadow-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                      <FaUserFriends className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-white">5K+</p>
                      <p className="text-xs text-gray-400">Active Riders</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-y border-white/5 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Rides Preview */}
      {upcomingRides.length > 0 && (
        <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-4">
                <FiTrendingUp className="w-4 h-4 text-accent" />
                <span className="text-sm text-accent font-medium">Hot Rides</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Upcoming <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Rides</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                Join these exciting rides happening soon! Sign up to book your seat.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {upcomingRides.map(ride => (
                <Card key={ride.id} className="glass-card hover:scale-[1.02] transition-all duration-300 group">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
                      <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-accent my-1"></div>
                      <div className="w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/50"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate group-hover:text-primary transition-colors">{ride.source}</p>
                      <p className="text-gray-400 text-sm truncate">{ride.destination}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1"><FiCalendar className="w-4 h-4" /> {formatDate.short(ride.dateTime)}</span>
                      <span className="text-gray-400 flex items-center gap-1"><FiClock className="w-4 h-4" /> {formatDate.time(ride.dateTime)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1"><FiUsers className="w-4 h-4" /> {ride.availableSeats} seats</span>
                      <span className="text-accent font-semibold">{formatCurrency.standard(ride.costPerPerson)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="primary" 
                    fullWidth 
                    size="sm"
                    onClick={() => handleJoinRequest(ride.id)}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark"
                  >
                    Request to Join
                  </Button>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8 md:mt-12">
              <p className="text-gray-400 mb-4">Want to see more rides?</p>
              <Button variant="outline" size="lg" onClick={scrollToSearch} rightIcon={<FiArrowRight />} className="border-white/20 hover:border-primary/50">
                Search More Rides
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Search Section - WORKING PERFECTLY */}
      <section ref={searchRef} className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Find Your Perfect <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Ride</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
              Search from hundreds of available rides. No login required to browse!
            </p>
          </div>

          <Card className="glass-card p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <input
                  type="text"
                  placeholder="Where from? Where to? (e.g., Mumbai, kk, dc)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-dark-bg/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)} 
                  leftIcon={<FiFilter />}
                  className="border-white/20 hover:border-primary/50"
                >
                  Filters {activeFilterCount > 0 && <Badge variant="primary" size="sm" className="ml-2">{activeFilterCount}</Badge>}
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleSearch} 
                  loading={loading} 
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark shadow-lg shadow-primary/25"
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-5 pt-5 border-t border-white/10 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Advanced Filters</h3>
                  {activeFilterCount > 0 && (
                    <button onClick={handleClearFilters} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                      <FiX className="w-4 h-4" /> Clear all
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input name="source" placeholder="From" value={filters.source} onChange={(e) => setFilters({...filters, source: e.target.value})} leftIcon={<FiMapPin className="w-4 h-4" />} />
                  <Input name="destination" placeholder="To" value={filters.destination} onChange={(e) => setFilters({...filters, destination: e.target.value})} leftIcon={<FiNavigation className="w-4 h-4" />} />
                  <Input name="date" type="date" placeholder="Date" value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} leftIcon={<FiCalendar className="w-4 h-4" />} />
                  <Input name="maxPrice" type="number" placeholder="Max Price (₹)" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} leftIcon={<FiDollarSign className="w-4 h-4" />} />
                  <Input name="minSeats" type="number" placeholder="Min Seats" value={filters.minSeats} onChange={(e) => setFilters({...filters, minSeats: e.target.value})} leftIcon={<FiUsers className="w-4 h-4" />} />
                </div>
              </div>
            )}
          </Card>

          {/* Search Results */}
          <div ref={resultsRef}>
            {hasSearched && (
              <div className="mt-8">
                {loading ? (
                  <div className="text-center py-12">
                    <FiLoader className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Searching for rides...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-gray-400">Found <span className="text-white font-medium">{searchResults.length}</span> rides</p>
                    <div className="grid gap-4">
                      {searchResults.map(ride => (
                        <Card key={ride.id} className="hover:shadow-xl transition-all duration-300 hover:border-primary/30">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-primary"></div>
                                <div className="w-0.5 h-10 bg-gradient-to-b from-primary to-accent my-1"></div>
                                <div className="w-3 h-3 rounded-full bg-accent"></div>
                              </div>
                              <div className="sm:hidden flex-1">
                                <p className="text-white font-semibold">{ride.source}</p>
                                <p className="text-gray-400 text-sm">{ride.destination}</p>
                              </div>
                            </div>
                            <div className="hidden sm:block flex-1">
                              <p className="text-white font-semibold">{ride.source}</p>
                              <p className="text-gray-400 text-sm">{ride.destination}</p>
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><FiCalendar className="w-4 h-4" /> {formatDate.short(ride.dateTime)}</span>
                                <span className="flex items-center gap-1"><FiClock className="w-4 h-4" /> {formatDate.time(ride.dateTime)}</span>
                                <Badge variant={ride.availableSeats > 0 ? 'success' : 'error'}>{ride.availableSeats} seats</Badge>
                                <span className="flex items-center gap-1 text-accent font-medium"><FiDollarSign className="w-4 h-4" /> {formatCurrency.standard(ride.costPerPerson)}</span>
                              </div>
                              {ride.owner && (
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center gap-2">
                                    <Avatar src={ride.owner.avatar} name={ride.owner.name} size="xs" />
                                    <span className="text-xs text-gray-500">by {ride.owner.name}</span>
                                  </div>
                                  <Button size="sm" variant="104-primary" onClick={() => handleJoinRequest(ride.id)} className="bg-gradient-to-r from-primary to-secondary">Join</Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiSearch className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400 text-lg">{searchError || 'No rides found'}</p>
                    <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms or filters</p>
                    <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-4">
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
              <FiHeart className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Why Choose Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
              Our platform is designed to make ride-sharing safe, easy, and enjoyable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((feature, index) => (
              <Card key={index} className="glass-card hover:scale-[1.02] transition-all duration-300 group">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ride Stories - FIXED IMAGES */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-4">
              <FiStar className="w-4 h-4 text-accent fill-current" />
              <span className="text-sm text-accent font-medium">Rider Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Real Stories from <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Real Riders</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
              See how Travel Throttle is transforming journeys across India.
            </p>
          </div>

          <div className="relative">
            <div className="glass-card p-6 sm:p-8 lg:p-10">
              <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
                <div>
                  <FaQuoteLeft className="w-8 h-8 sm:w-10 sm:h-10 text-primary/30 mb-4 sm:mb-6" />
                  <p className="text-base sm:text-lg text-gray-300 mb-6 leading-relaxed">
                    "{MOCK_STORIES[currentStoryIndex].description}"
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar src={MOCK_STORIES[currentStoryIndex].user.avatar} name={MOCK_STORIES[currentStoryIndex].user.name} size="lg" />
                    <div>
                      <p className="text-white font-semibold flex items-center gap-2">
                        {MOCK_STORIES[currentStoryIndex].user.name}
                        {MOCK_STORIES[currentStoryIndex].user.verified && <FiCheckCircle className="w-4 h-4 text-success" />}
                      </p>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => <FiStar key={i} className="w-4 h-4 fill-current" />)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><FiMapPin className="w-4 h-4" /> {MOCK_STORIES[currentStoryIndex].ride.source} → {MOCK_STORIES[currentStoryIndex].ride.destination}</span>
                    <span>{MOCK_STORIES[currentStoryIndex].date}</span>
                  </div>
                </div>
                <div className="relative">
                  <img 
                    src={MOCK_STORIES[currentStoryIndex].image} 
                    alt="Ride story" 
                    className="rounded-xl w-full h-56 sm:h-64 lg:h-72 object-cover shadow-xl"
                    onError={(e) => { 
                      e.target.src = 'https://images.pexels.com/photos/39693/motorcycle-racer-racing-speed-39693.jpeg?auto=compress&cs=tinysrgb&w=600'; 
                    }}
                  />
                  <div className="absolute -bottom-4 -right-4 bg-dark-card p-3 sm:p-4 rounded-xl shadow-xl border border-white/10">
                    <p className="text-xl sm:text-2xl font-bold text-accent">{MOCK_STORIES[currentStoryIndex].ride.distance}</p>
                    <p className="text-xs text-gray-400">Distance Covered</p>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={prevStory} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 w-10 h-10 sm:w-12 sm:h-12 bg-dark-card rounded-full flex items-center justify-center shadow-lg border border-white/10 hover:bg-dark-bg transition-colors">
              <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button onClick={nextStory} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 w-10 h-10 sm:w-12 sm:h-12 bg-dark-card rounded-full flex items-center justify-center shadow-lg border border-white/10 hover:bg-dark-bg transition-colors">
              <FiChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="flex justify-center gap-2 mt-6">
              {MOCK_STORIES.map((_, index) => (
                <button 
                  key={index} 
                  onClick={() => setCurrentStoryIndex(index)} 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStoryIndex ? 'w-8 bg-gradient-to-r from-primary to-secondary' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`} 
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Frequently Asked <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">Everything you need to know about Travel Throttle</p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, index) => (
              <div key={index} className="glass-card overflow-hidden">
                <button type="button" onClick={() => toggleFaq(index)} className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
                  <span className="text-white font-medium text-sm sm:text-base">{faq.question}</span>
                  {activeFaq === index ? 
                    <FiChevronUp className="w-5 h-5 text-primary flex-shrink-0" /> : 
                    <FiChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  }
                </button>
                {activeFaq === index && (
                  <div className="px-5 sm:px-6 pb-4 sm:pb-5">
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/10 to-accent/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6">
            Ready to Hit the <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Open Road?</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of riders already saving money and making memories on Travel Throttle.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={ROUTES.PUBLIC.SIGNUP.path}>
              <Button variant="primary" size="lg" className="bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark shadow-xl shadow-primary/30 text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4">
                Get Started for Free
              </Button>
            </Link>
            <Link to={ROUTES.PUBLIC.LOGIN.path}>
              <Button variant="outline" size="lg" className="text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 border-white/20 hover:border-primary/50">
                Sign In
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">No credit card required. Join in seconds.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-card/30 border-t border-white/5 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                  <FaMotorcycle className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Travel Throttle</span>
              </Link>
              <p className="text-gray-400 text-sm mb-4">
                India's #1 bike ride-sharing platform. Ride together, save together.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-all">
                  <FiFacebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-all">
                  <FiTwitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-all">
                  <FiInstagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-all">
                  <FiLinkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Find a Ride</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Create a Ride</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Safety Tips</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">FAQs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <FiMail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400 text-sm">support@travelthrottle.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiPhone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400 text-sm">+91 98765 43210</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Travel Throttle. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-primary text-sm transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;