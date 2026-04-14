import React from 'react';
import * as LucideIcons from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => {
  // Map string icon names to Lucide icons
  const iconMap = {
    'git-merge': LucideIcons.GitMerge,
    'wifi-off': LucideIcons.WifiOff,
    'map-pin': LucideIcons.MapPin,
    'clock': LucideIcons.Clock,
    'pill': LucideIcons.Pill,
    'users': LucideIcons.Users
  };

  const IconComponent = iconMap[icon] || LucideIcons.Star;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6">
        <IconComponent className="w-7 h-7 text-primary" />
      </div>
      <h4 className="text-xl font-bold text-gray-900 mb-3">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
