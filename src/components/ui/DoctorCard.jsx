import React from 'react';
import { MapPin, Clock } from 'lucide-react';

const DoctorCard = ({ name, specialty, location, responseTime, initials }) => {
  return (
    <div className="min-w-[300px] md:min-w-0 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 snap-center relative">
      <div className="absolute top-6 right-6 flex items-center bg-green-50 text-green-600 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-100">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-1.5"></span>
        Online Now
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-xl">
          {initials}
        </div>
        <div>
          <h4 className="text-lg font-bold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{specialty}</p>
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-primary" />
          {location}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2 text-primary" />
          Avg Response: {responseTime}
        </div>
      </div>
      
      <button className="w-full py-2.5 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors focus:ring-4 focus:ring-red-100">
        Request Help
      </button>
    </div>
  );
};

export default DoctorCard;
