import React from 'react';
import { STATS } from '../../constants/data';

const StatsBar = () => {
  return (
    <section className="bg-primary py-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40L40 0H20L0 20M40 40V20L20 40" fill="none" stroke="currentColor" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-red-400">
          {STATS.map((stat) => (
            <div key={stat.id} className="text-center py-4 md:py-0">
              <div className="text-5xl font-extrabold text-white mb-2">{stat.value}</div>
              <div className="text-red-100 font-medium text-lg uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
