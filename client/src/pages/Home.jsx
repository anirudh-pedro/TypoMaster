import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import { FaKeyboard, FaTrophy, FaChartLine, FaArrowRight } from 'react-icons/fa';
import { AppContext } from '../App';
import LoginModal from '../components/LoginModal';

const Home = () => {
  // Get user and logout from context
  const { user, logout } = useContext(AppContext) || {};

  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const demoText = "Improve your typing speed and accuracy with TypoMaster.";
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100 });
  const [isTyping, setIsTyping] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  // Simulate typing animation on load
  useEffect(() => {
    let timeout;
    
    if (!isTyping && currentIndex < demoText.length) {
      timeout = setTimeout(() => {
        setTypedText(prev => prev + demoText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100);
    }
    
    return () => clearTimeout(timeout);
  }, [currentIndex, demoText, isTyping]);

  // Reset demo when typing animation completes
  useEffect(() => {
    if (currentIndex === demoText.length && !isTyping) {
      const resetTimeout = setTimeout(() => {
        setTypedText('');
        setCurrentIndex(0);
      }, 3000);
      
      return () => clearTimeout(resetTimeout);
    }
  }, [currentIndex, demoText.length, isTyping]);

  // Handle user input in demo
  const handleDemoKeyDown = (e) => {
    if (!isTyping) {
      setIsTyping(true);
      setTypedText('');
      setStartTime(Date.now());
    }
    
    // Only handle printable characters
    if (e.key.length === 1 || e.key === 'Backspace') {
      e.preventDefault();
      
      if (e.key === 'Backspace') {
        setTypedText(prev => prev.slice(0, -1));
      } else {
        setTypedText(prev => prev + e.key);
        
        // Calculate stats
        const elapsedMinutes = (Date.now() - startTime) / 60000;
        if (elapsedMinutes > 0) {
          const wpm = Math.round(typedText.length / 5 / elapsedMinutes);
          
          // Calculate accuracy
          let correctChars = 0;
          for (let i = 0; i < typedText.length; i++) {
            if (i < demoText.length && typedText[i] === demoText[i]) {
              correctChars++;
            }
          }
          const accuracy = Math.round((correctChars / typedText.length) * 100) || 100;
          
          setStats({ wpm, accuracy });
        }
      }
    }
  };

  // Features data
  const features = [
    {
      icon: <FaKeyboard className="h-12 w-12 text-indigo-500" />,
      title: "Interactive Typing Tests",
      description: "Practice with a variety of texts and improve your typing speed and accuracy in real-time."
    },
    {
      icon: <FaChartLine className="h-12 w-12 text-indigo-500" />,
      title: "Performance Tracking",
      description: "Monitor your progress over time with detailed statistics and personalized insights."
    },
    {
      icon: <FaTrophy className="h-12 w-12 text-indigo-500" />,
      title: "Global Leaderboard",
      description: "Compete with typists from around the world and climb the ranks as you improve."
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      content: "TypoMaster helped me increase my typing speed from 40 to 85 WPM in just one month of practice!",
      author: "Alex Chen",
      role: "Software Developer"
    },
    {
      content: "The real-time feedback and statistics have been invaluable for improving my accuracy.",
      author: "Sarah Johnson",
      role: "Content Writer"
    },
    {
      content: "I love competing on the leaderboard. It keeps me motivated to practice every day.",
      author: "Michael Rodriguez",
      role: "Student"
    }
  ];

  const handleTestClick = (e) => {
    if (!user) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };
  
  const handleContinueAsGuest = () => {
    setShowLoginModal(false);
    navigate('/test');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav />
      
      {/* Hero Section with Interactive Demo */}
      <section className="pt-24 pb-12 sm:pt-32 sm:pb-16 lg:pb-24">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Become a
              <span className="block text-indigo-600 dark:text-indigo-400">Typing Master</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Improve your typing speed and accuracy with our interactive typing tests.
              Track your progress and compete with typists around the world.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/test"
                className="rounded-md bg-indigo-600 px-5 py-3 text-md font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                onClick={handleTestClick}
              >
                Start Typing Test
              </Link>
              {!user && (
                <Link
                  to="/login"
                  className="rounded-md bg-white px-5 py-3 text-md font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-600 hover:ring-indigo-700 hover:bg-gray-50 dark:bg-transparent dark:text-indigo-400 dark:hover:bg-gray-800 transition-colors"
                >
                  Login to Track Progress
                </Link>
              )}
            </div>
          </div>
          
          {/* Interactive Demo */}
          <div className="mt-12 sm:mt-16">
            <div className="relative mx-auto max-w-3xl bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
              {/* Demo Header */}
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="mx-auto text-xs font-medium text-gray-500 dark:text-gray-400">
                  TypoMaster Demo - Click to try
                </div>
              </div>
              
              {/* Demo Content */}
              <div 
                className="p-6 focus:outline-none cursor-text" 
                tabIndex={0}
                onKeyDown={handleDemoKeyDown}
                onClick={() => {
                  if (!isTyping) {
                    setIsTyping(true);
                    setTypedText('');
                    setStartTime(Date.now());
                  }
                }}
              >
                {/* Demo Stats */}
                {isTyping && (
                  <div className="flex justify-between mb-4 text-sm">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                      <span className="font-bold text-indigo-700 dark:text-indigo-300">WPM: {stats.wpm}</span>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                      <span className="font-bold text-green-700 dark:text-green-300">Accuracy: {stats.accuracy}%</span>
                    </div>
                  </div>
                )}
                
                {/* Text Display */}
                <div className="text-lg sm:text-xl font-mono">
                  {isTyping ? (
                    <div>
                      {demoText.split('').map((char, index) => {
                        // Determine character status
                        let status = '';
                        if (index < typedText.length) {
                          status = typedText[index] === char ? 'correct' : 'incorrect';
                        } else if (index === typedText.length) {
                          status = 'current';
                        }
                        
                        return (
                          <span 
                            key={index}
                            className={`
                              ${status === 'correct' ? 'text-green-600 dark:text-green-400' : ''}
                              ${status === 'incorrect' ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30' : ''}
                              ${status === 'current' ? 'border-b-2 border-indigo-600 dark:border-indigo-400 animate-pulse' : ''}
                              ${!status ? 'text-gray-500 dark:text-gray-400' : ''}
                            `}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-gray-800 dark:text-gray-200">
                      {typedText}
                      <span className="animate-pulse border-r-2 border-indigo-600 dark:border-indigo-400 ml-0.5">&nbsp;</span>
                    </div>
                  )}
                </div>
                
                {/* Instruction Text */}
                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {isTyping ? 'Type the text above' : 'Click to start typing or watch the demo'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">FEATURES</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to improve your typing
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="relative p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold leading-7 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold tracking-tight text-center text-gray-900 dark:text-white sm:text-4xl">
              What our users say
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-center text-gray-600 dark:text-gray-300">
              Join thousands of typists who have improved their skills with TypoMaster
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="flex flex-col h-full p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">"{testimonial.content}"</p>
                </div>
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="font-medium text-gray-900 dark:text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 bg-indigo-600 dark:bg-indigo-900">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to improve your typing skills?
              </h2>
              <p className="mt-2 text-lg text-indigo-200">
                Start a typing test now and see your results instantly.
              </p>
            </div>
            <Link
              to="/test"
              className="inline-flex items-center rounded-md bg-white px-6 py-3 text-lg font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 transition-colors"
              onClick={handleTestClick}
            >
              Start Typing <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link to="/test" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              Practice
            </Link>
            {/* <Link to="/leaderboard" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              Leaderboard
            </Link> */}
            {user ? (
              <Link to="/dashboard" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                Login
              </Link>
            )}
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} TypoMaster. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onContinueAsGuest={handleContinueAsGuest}
      />
    </div>
  );
};

export default Home;