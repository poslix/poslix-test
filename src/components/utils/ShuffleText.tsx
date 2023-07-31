import { useState, useEffect } from 'react';

interface Props {
  text: string;
  interval?: number;
}

const ShuffleText = ({ text, interval = 1000 }: Props) => {
  const [shuffledText, setShuffledText] = useState(text.split(''));

  useEffect(() => {
    const shuffleInterval = setInterval(() => {
      const shuffledChars = shuffledText.sort(() => Math.random() - 0.5);
      setShuffledText([...shuffledChars]); // use spread operator to create a new array
    }, interval);

    return () => clearInterval(shuffleInterval);
  }, [interval, shuffledText]);

  return (
    <div>
      {shuffledText.map((char, index) => (
        <span key={index}>{char}</span>
      ))}
    </div>
  );
};

export default ShuffleText;
