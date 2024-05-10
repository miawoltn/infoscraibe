'use client'
import React, { useState, useEffect } from 'react';

const Typewriter = ({ text }: {text: string}) => {
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
    const interval = setInterval(() => {
      setDisplayText((prevText) => prevText + text[index]);
      setIndex((prevIndex) => prevIndex + 1);
    }, 100); // Adjust speed here

    return () => clearInterval(interval);
}
  }, [index, text]);

  return <span className="inline-block">{displayText}</span>;
};

export default Typewriter;
