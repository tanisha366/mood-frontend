import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

const MoodQuoteDashboard = () => {
  // State Management
  const [isDark, setIsDark] = useState(true);
  const [moods, setMoods] = useState([]);
  const [currentMood, setCurrentMood] = useState(null);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [autoPlay, setAutoPlay] = useState(false);
  const canvasRef = useRef(null);

  // Enhanced mood configurations
  const moodConfigs = {
    happy: {
      emoji: '😊',
      gradient: 'linear-gradient(135deg, #FFD700, #FF8C00, #FF69B4)',
      color: '#FFD700'
    },
    sad: {
      emoji: '😢',
      gradient: 'linear-gradient(135deg, #4682B4, #6A5ACD, #87CEEB)',
      color: '#4682B4'
    },
    tired: {
      emoji: '😴',
      gradient: 'linear-gradient(135deg, #696969, #2F4F4F, #778899)',
      color: '#696969'
    },
    motivated: {
      emoji: '💪',
      gradient: 'linear-gradient(135deg, #32CD32, #00FA9A, #98FB98)',
      color: '#32CD32'
    },
    calm: {
      emoji: '😌',
      gradient: 'linear-gradient(135deg, #87CEEB, #E6E6FA, #AFEEEE)',
      color: '#87CEEB'
    },
    angry: {
      emoji: '😠',
      gradient: 'linear-gradient(135deg, #FF4500, #DC143C, #B22222)',
      color: '#FF4500'
    },
    excited: {
      emoji: '🎉',
      gradient: 'linear-gradient(135deg, #FF69B4, #FF1493, #DA70D6)',
      color: '#FF69B4'
    }
  };

  // Initialize app
  useEffect(() => {
    initializeApp();
    loadFavorites();
    initParticles();
    
    // Cleanup function
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-play quotes
  useEffect(() => {
    let interval;
    if (autoPlay && currentMood) {
      interval = setInterval(() => {
        handleRandomQuote();
      }, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoPlay, currentMood]);

  const initializeApp = async () => {
    await loadMoods();
    await loadRandomQuote();
  };

  const initParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();

    const particles = [];
    const particleCount = 50;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: `hsla(${Math.random() * 360}, 70%, 60%, ${Math.random() * 0.2 + 0.1})`
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Boundary check
        if (particle.x <= 0 || particle.x >= canvas.width) particle.speedX *= -1;
        if (particle.y <= 0 || particle.y >= canvas.height) particle.speedY *= -1;

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace(')', ', 0.1)').replace('hsla', 'hsla');
        ctx.fill();

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      setCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };

  const loadMoods = async () => {
    try {
      const response = await axios.get(`${API_BASE}/moods`);
      if (response.data && Array.isArray(response.data)) {
        setMoods(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading moods:', error);
      // Fallback moods
      const fallbackMoods = [
        { id: 1, name: 'happy' }, 
        { id: 2, name: 'sad' }, 
        { id: 3, name: 'tired' },
        { id: 4, name: 'motivated' }, 
        { id: 5, name: 'calm' }, 
        { id: 6, name: 'angry' }, 
        { id: 7, name: 'excited' }
      ];
      setMoods(fallbackMoods);
    }
  };

  const loadRandomQuote = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/quotes/random`);
      setCurrentQuote(response.data);
    } catch (error) {
      console.error('Error loading random quote:', error);
      setCurrentQuote({
        text: "Welcome to your advanced mood dashboard! Select your mood to begin your inspirational journey.",
        author: "Mood Quotes",
        mood: "happy"
      });
    }
    setIsLoading(false);
  };

  const loadFavorites = () => {
    try {
      const saved = localStorage.getItem('moodQuotesFavorites');
      if (saved) {
        const parsedFavorites = JSON.parse(saved);
        if (Array.isArray(parsedFavorites)) {
          setFavorites(parsedFavorites);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  const handleMoodSelect = async (mood) => {
    setIsLoading(true);
    setCurrentMood(mood.name);
    
    try {
      const response = await axios.get(`${API_BASE}/quotes/random?mood=${mood.name}`);
      setCurrentQuote(response.data);
      showToastMessage(`Perfect quote for your ${mood.name} mood! ✨`);
    } catch (error) {
      console.error('Error fetching quote:', error);
      const fallbackQuotes = {
        happy: { 
          text: "Happiness is a journey, not a destination. Enjoy every moment!", 
          author: "Anonymous",
          mood: "happy"
        },
        sad: { 
          text: "Even the darkest night will end and the sun will rise.", 
          author: "Victor Hugo",
          mood: "sad"
        },
        tired: { 
          text: "Rest when you're weary. Refresh and renew yourself.", 
          author: "Ralph Marston",
          mood: "tired"
        },
        motivated: { 
          text: "The only way to do great work is to love what you do.", 
          author: "Steve Jobs",
          mood: "motivated"
        },
        calm: { 
          text: "Peace comes from within. Do not seek it without.", 
          author: "Buddha",
          mood: "calm"
        },
        angry: { 
          text: "Anger is an acid that can do more harm to the vessel than anything it is poured on.", 
          author: "Mark Twain",
          mood: "angry"
        },
        excited: { 
          text: "The biggest adventure you can take is to live the life of your dreams.", 
          author: "Oprah Winfrey",
          mood: "excited"
        }
      };
      const fallbackQuote = fallbackQuotes[mood.name] || fallbackQuotes.happy;
      setCurrentQuote(fallbackQuote);
      showToastMessage("Here's some inspiration for you! 🌟");
    }
    
    setIsLoading(false);
  };

  const handleRandomQuote = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/quotes/random`);
      setCurrentQuote(response.data);
      setCurrentMood('random');
      showToastMessage('New random inspiration! 🎲');
    } catch (error) {
      console.error('Error fetching random quote:', error);
    }
    setIsLoading(false);
  };

  const toggleFavorite = () => {
    if (!currentQuote) return;

    const isFavorited = favorites.some(fav => 
      fav.text === currentQuote.text && fav.author === currentQuote.author
    );

    let updatedFavorites;
    if (isFavorited) {
      updatedFavorites = favorites.filter(fav => 
        !(fav.text === currentQuote.text && fav.author === currentQuote.author)
      );
      showToastMessage('Removed from favorites 💔');
    } else {
      updatedFavorites = [...favorites, { 
        ...currentQuote, 
        id: Date.now(), 
        timestamp: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }];
      showToastMessage('Added to favorites! ❤️');
    }

    setFavorites(updatedFavorites);
    localStorage.setItem('moodQuotesFavorites', JSON.stringify(updatedFavorites));
  };

  const removeFavorite = (favToRemove) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== favToRemove.id);
    setFavorites(updatedFavorites);
    localStorage.setItem('moodQuotesFavorites', JSON.stringify(updatedFavorites));
    showToastMessage('Favorite removed 🗑️');
  };

  const speakQuote = () => {
    if (!currentQuote) return;
    
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const speech = new SpeechSynthesisUtterance();
      speech.text = `${currentQuote.text} by ${currentQuote.author}`;
      speech.rate = 0.9;
      speech.pitch = 1.1;
      speech.volume = 0.8;
      window.speechSynthesis.speak(speech);
      showToastMessage('Speaking quote... 🔊');
    } else {
      showToastMessage('Speech not supported in your browser ❌');
    }
  };

  const shareQuote = async () => {
    if (!currentQuote) return;
    
    const shareText = `"${currentQuote.text}" - ${currentQuote.author}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Inspirational Quote',
          text: shareText
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          // Fallback to clipboard
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToastMessage('Quote copied to clipboard! 📋');
    }).catch(() => {
      showToastMessage('Failed to copy quote ❌');
    });
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const isQuoteFavorited = () => {
    if (!currentQuote) return false;
    return favorites.some(fav => 
      fav.text === currentQuote.text && fav.author === currentQuote.author
    );
  };

  // Render mood buttons
  const renderMoodButtons = () => {
    return moods.map((mood, index) => {
      const config = moodConfigs[mood.name] || moodConfigs.happy;
      return (
        <motion.button
          key={mood.id || mood.name}
          className={`mood-card ${currentMood === mood.name ? 'active' : ''}`}
          onClick={() => handleMoodSelect(mood)}
          whileHover={{ 
            scale: 1.05,
            y: -5
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.4,
            delay: index * 0.1
          }}
          style={{
            '--mood-color': config.color
          }}
        >
          <motion.span 
            className="mood-emoji"
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            {config.emoji}
          </motion.span>
          <span className="mood-name">{mood.name}</span>
        </motion.button>
      );
    });
  };

  // Render favorite items
  const renderFavoriteItems = () => {
    if (favorites.length === 0) {
      return (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="empty-icon">🤍</div>
          <h3>No favorites yet</h3>
          <p>Start liking quotes to see them here!</p>
          <motion.button
            className="back-to-dashboard"
            onClick={() => setActiveView('dashboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Quotes
          </motion.button>
        </motion.div>
      );
    }

    return (
      <div className="favorites-grid">
        {favorites.map((fav, index) => (
          <motion.div
            key={fav.id}
            className="favorite-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="favorite-content">
              <blockquote className="favorite-text">"{fav.text}"</blockquote>
              <cite className="favorite-author">— {fav.author}</cite>
              {fav.timestamp && (
                <span className="favorite-date">{fav.timestamp}</span>
              )}
            </div>
            <div className="favorite-actions">
              <motion.button
                className="remove-favorite"
                onClick={() => removeFavorite(fav)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Remove from favorites"
              >
                🗑️
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      {/* Animated Background Canvas */}
      <canvas 
        ref={canvasRef} 
        className="particles-canvas"
      />
      
      {/* Main Container */}
      <div className="main-container">
        
        {/* Header */}
        <motion.header 
          className="app-header"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <div className="header-content">
            <motion.h1 
              className="app-title"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              🌈 MoodScape
            </motion.h1>
            <p className="app-subtitle">Your Personal Emotional Companion</p>
          </div>

          {/* Navigation */}
          <nav className="nav-tabs">
            {['dashboard', 'favorites', 'history'].map((tab) => (
              <button
                key={tab}
                className={`nav-tab ${activeView === tab ? 'active' : ''}`}
                onClick={() => setActiveView(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'favorites' && favorites.length > 0 && (
                  <span className="tab-badge">{favorites.length}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Theme Toggle */}
          <motion.button
            className="theme-toggle"
            onClick={() => setIsDark(!isDark)}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </motion.button>
        </motion.header>

        {/* Main Content */}
        <main className="main-content">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div
                key="dashboard"
                className="dashboard-view"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                
                {/* Mood Selection */}
                <motion.section 
                  className="mood-section"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="section-title">How are you feeling today?</h2>
                  <div className="moods-grid">
                    {renderMoodButtons()}
                  </div>
                </motion.section>

                {/* Quote Display */}
                <motion.section 
                  className="quote-section"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuote?.id || currentQuote?.text}
                      className="quote-display"
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -30, scale: 0.9 }}
                      transition={{ 
                        duration: 0.6,
                        type: "spring",
                        stiffness: 50
                      }}
                    >
                      {isLoading ? (
                        <div className="loading-state">
                          <div className="loading-spinner"></div>
                          <p>Finding your perfect quote...</p>
                        </div>
                      ) : (
                        <>
                          <div className="quote-content">
                            <motion.blockquote 
                              className="quote-text"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              "{currentQuote?.text}"
                            </motion.blockquote>
                            <motion.cite 
                              className="quote-author"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 }}
                            >
                              — {currentQuote?.author}
                            </motion.cite>
                          </div>
                          
                          <motion.div 
                            className="quote-actions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                          >
                            <motion.button
                              className={`action-btn favorite-btn ${isQuoteFavorited() ? 'favorited' : ''}`}
                              onClick={toggleFavorite}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title={isQuoteFavorited() ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              {isQuoteFavorited() ? '❤️' : '🤍'}
                            </motion.button>
                            
                            <motion.button
                              className="action-btn"
                              onClick={speakQuote}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Listen to quote"
                            >
                              🔊
                            </motion.button>
                            
                            <motion.button
                              className="action-btn"
                              onClick={shareQuote}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Share quote"
                            >
                              📤
                            </motion.button>

                            <motion.button
                              className={`action-btn autoplay-btn ${autoPlay ? 'active' : ''}`}
                              onClick={() => setAutoPlay(!autoPlay)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Auto-play quotes"
                            >
                              {autoPlay ? '⏸️' : '▶️'}
                            </motion.button>
                          </motion.div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.section>

                {/* Quick Actions */}
                <motion.section 
                  className="actions-section"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="actions-grid">
                    <motion.button
                      className="action-card"
                      onClick={handleRandomQuote}
                      disabled={isLoading}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="action-icon">🎲</span>
                      <span className="action-text">Random Quote</span>
                    </motion.button>

                    <motion.button
                      className="action-card"
                      onClick={() => setActiveView('favorites')}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="action-icon">⭐</span>
                      <span className="action-text">
                        Favorites {favorites.length > 0 && `(${favorites.length})`}
                      </span>
                    </motion.button>

                    <motion.button
                      className={`action-card ${autoPlay ? 'active' : ''}`}
                      onClick={() => setAutoPlay(!autoPlay)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="action-icon">{autoPlay ? '⏸️' : '▶️'}</span>
                      <span className="action-text">
                        {autoPlay ? 'Auto-Play On' : 'Auto-Play'}
                      </span>
                    </motion.button>
                  </div>
                </motion.section>
              </motion.div>
            )}

            {/* Favorites View */}
            {activeView === 'favorites' && (
              <motion.div
                key="favorites"
                className="favorites-view"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="view-header">
                  <h2>Your Favorite Quotes</h2>
                  <p className="view-subtitle">
                    {favorites.length} saved inspiration{favorites.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {renderFavoriteItems()}
              </motion.div>
            )}

            {/* History View */}
            {activeView === 'history' && (
              <motion.div
                key="history"
                className="history-view"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="view-header">
                  <h2>Your Mood History</h2>
                  <p className="view-subtitle">Track your emotional journey</p>
                </div>
                <div className="coming-soon">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <div className="coming-soon-icon">📊</div>
                    <h3>Analytics Coming Soon</h3>
                    <p>Mood tracking and insights will be available in the next update!</p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              className="toast-notification"
              initial={{ opacity: 0, y: 100, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MoodQuoteDashboard;
