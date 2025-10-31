import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QuoteCard = ({ quote, onLike, isLiked }) => {
  if (!quote) {
    return (
      <motion.div 
        className="quote-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="quote-text">Select a mood to see a matching quote!</p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={quote._id || quote.text}
        className="quote-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <motion.p 
          className="quote-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          "{quote.text}"
        </motion.p>
        <motion.p 
          className="quote-author"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          — {quote.author}
        </motion.p>
        <motion.button
          className="like-btn"
          onClick={onLike}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          {isLiked ? '❤️' : '🤍'}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuoteCard;
