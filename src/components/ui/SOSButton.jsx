import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio } from 'lucide-react';

const SOSButton = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/sos')}
      aria-label="Send emergency SOS"
      className="bg-primary text-white hover:bg-primary-hover w-40 h-40 rounded-full flex flex-col items-center justify-center animate-sos-pulse transition-transform hover:scale-105 shadow-2xl"
    >
      <Radio className="w-12 h-12 mb-2" aria-hidden="true" />
      <span className="text-3xl font-black tracking-widest" aria-hidden="true">SOS</span>
    </button>
  );
};

export default SOSButton;
