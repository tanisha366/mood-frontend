import React from 'react';
import { motion } from 'framer-motion';

const ToggleDarkLight = ({ isDark, toggleTheme }) => {
  return (
    <motion.div 
      className="theme-toggle"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >a
      <button className="toggle-btn" onClick={toggleTheme}>
        {isDark ? '☀️' : '🌙'}
      </button>
    </motion.div>
  );
};

export default ToggleDarkLight;
