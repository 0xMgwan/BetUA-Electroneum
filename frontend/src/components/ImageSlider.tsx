import React from 'react';

const slides = [
  {
    title: 'GET THE BEST ODDS',
    description: 'Competitive odds across all matches'
  },
  {
    title: '0% TRADING FEES',
    description: 'No hidden fees, only pure betting'
  },
  {
    title: 'HOW TO GUIDES',
    description: 'Learn how to bet like a pro'
  },
  {
    title: 'STAKE & EARN',
    description: 'Earn rewards from your predictions'
  }
];

const ImageSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[300px] overflow-hidden bg-navy-800">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full" 
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className="min-w-full h-full flex flex-col items-center justify-center text-center px-4"
          >
            <h2 className="text-4xl font-bold text-white mb-4">{slide.title}</h2>
            <p className="text-xl text-gray-300">{slide.description}</p>
          </div>
        ))}
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentSlide === index ? 'bg-white w-4' : 'bg-gray-400'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
