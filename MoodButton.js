import React from 'react';
import { motion } from 'framer-motion';

const MoodButtons = ({ moods, currentMood, onMoodChange }) => {
  return (
    <motion.div 
      className="mood-section"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2>How are you feeling today?</h2>
      <div className="mood-grid">
        {moods.map((mood, index) => (
          <motion.button
            key={mood.id}
            className={`mood-btn ${currentMood === mood.name ? 'active' : ''}`}
            onClick={() => onMoodChange(mood)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            style={{
              borderColor: currentMood === mood.name ? mood.color : 'var(--glass-border)'
            }}
          >
            <span className="mood-emoji">{mood.emoji}</span>
            {mood.name}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default MoodButtons;
