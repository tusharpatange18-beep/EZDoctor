import React from 'react';
import { BellRing, Activity, HeartHandshake } from 'lucide-react';

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-primary font-bold uppercase tracking-wider text-sm mb-2">Simple Process</h2>
          <h3 className="text-4xl font-extrabold text-gray-900">How It Works</h3>
          <div className="w-16 h-1 bg-primary mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
          
          {/* Step 1 */}
          <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow text-center group">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <BellRing className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute -top-4 -right-4 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg border-4 border-white">1</div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">Press SOS</h4>
            <p className="text-gray-600">Tap the emergency button. It works even on low 2G networks to send your alert.</p>
          </div>

          {/* Step 2 */}
          <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow text-center group">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute -top-4 -right-4 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg border-4 border-white">2</div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">Get Matched to a Doctor</h4>
            <p className="text-gray-600">Our system instantly auto-locates you via GPS and routes the alert to the nearest available doctor.</p>
          </div>

          {/* Step 3 */}
          <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow text-center group">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <HeartHandshake className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute -top-4 -right-4 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg border-4 border-white">3</div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">Receive Help Instantly</h4>
            <p className="text-gray-600">Connect via audio/video call for immediate triage while local help is dispatched securely.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
