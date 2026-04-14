import React from 'react';
import SOSButton from '../components/ui/SOSButton';
import DoctorCard from '../components/ui/DoctorCard';
import HowItWorks from '../components/ui/HowItWorks';
import FeatureCard from '../components/ui/FeatureCard';
import StatsBar from '../components/ui/StatsBar';
import { DOCTORS, FEATURES } from '../constants/data';

const Home = () => {
  return (
    <div>
      {/* 2. HERO SECTION */}
      <section id="home" className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Left Content */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-primary font-semibold text-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></span>
                24/7 Rural Emergency Response
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
                Emergency Medical Help, <span className="text-primary">Wherever You Are</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0">
                Connecting rural patients with doctors and life-saving medical assistance in minutes. Fast,
                reliable, and built for low bandwidth areas.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                <SOSButton />
                <div className="text-left mt-4 sm:mt-0">
                  <p className="font-bold text-gray-900">Press immediately</p>
                  <p className="text-gray-500 text-sm">for severe medical emergencies</p>
                </div>
              </div>
            </div>
            
            {/* Right Content (SVG Illustration) */}
            <div className="w-full lg:w-1/2 relative flex justify-center mt-12 lg:mt-0">
              <div className="relative w-full max-w-lg aspect-square">
                <div className="absolute inset-0 bg-red-100 rounded-full blur-3xl opacity-50"></div>
                <svg viewBox="0 0 500 500" className="w-full h-full relative z-10 drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="250" cy="250" r="220" fill="#fef2f2" />
                  <rect x="210" y="180" width="80" height="200" rx="10" fill="#ffffff" stroke="#DC2626" strokeWidth="4" />
                  <circle cx="250" cy="140" r="35" fill="#fca5a5" stroke="#DC2626" strokeWidth="4" />
                  <path d="M 230 180 C 230 220, 270 220, 270 180" fill="none" stroke="#1F2937" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 270 200 L 270 240" fill="none" stroke="#1F2937" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="270" cy="250" r="10" fill="#1F2937" />
                  <path d="M 120 280 L 120 380 L 380 380 L 380 280 L 320 280 L 300 230 L 160 230 L 140 280 Z" fill="#ffffff" stroke="#1F2937" strokeWidth="6" strokeLinejoin="round" />
                  <rect x="237" y="290" width="26" height="70" fill="#DC2626" />
                  <rect x="215" y="312" width="70" height="26" fill="#DC2626" />
                  <circle cx="180" cy="380" r="25" fill="#1F2937" />
                  <circle cx="320" cy="380" r="25" fill="#1F2937" />
                  <path d="M 230 230 Q 250 180 270 230 Z" fill="#DC2626" className="animate-pulse" />
                </svg>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* AVAILABLE DOCTORS SECTION */}
      <section id="available-doctors" className="py-16 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-primary font-bold uppercase tracking-wider text-sm mb-2">Live Status</h2>
              <h3 className="text-3xl font-extrabold text-gray-900">Doctors Available Right Now</h3>
            </div>
          </div>
          <div className="flex overflow-x-auto pb-8 -mx-4 px-4 md:grid md:grid-cols-3 gap-6 snap-x hide-scrollbar">
            {DOCTORS.map((doctor) => (
              <DoctorCard 
                key={doctor.id}
                name={doctor.name}
                specialty={doctor.specialty}
                location={doctor.location}
                responseTime={doctor.responseTime}
                initials={doctor.initials}
              />
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* FEATURES GRID */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-primary font-bold uppercase tracking-wider text-sm mb-2">Why Choose EZDoc</h2>
            <h3 className="text-4xl font-extrabold text-gray-900">Platform Features</h3>
            <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">Built specifically for the challenges of rural healthcare access.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <FeatureCard 
                key={feature.id}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      <StatsBar />
    </div>
  );
};

export default Home;
