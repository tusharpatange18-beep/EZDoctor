import React from 'react';
import { Phone, Mail, Share2, MessageCircle, Camera } from 'lucide-react'
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 pt-16 pb-8 border-t-4 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          <div className="md:col-span-2">
            <span className="text-primary font-bold text-3xl tracking-tight mb-4 inline-block">EZDoc</span>
            <p className="text-gray-400 text-lg mb-6 max-w-sm">
              "Saving lives, one connection at a time."
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                <Camera className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/doctor" className="text-gray-400 hover:text-white transition-colors">Doctor Dashboard</Link></li>
              <li><Link to="/admin" className="text-gray-400 hover:text-white transition-colors">Admin Panel</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Volunteer as Doctor</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Emergency Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start text-gray-400">
                <Phone className="w-5 h-5 mr-3 text-primary mt-1" />
                <div>
                  <span className="block text-white font-medium">Toll Free Help Desk</span>
                  1800-EZDOC-911
                </div>
              </li>
              <li className="flex items-start text-gray-400">
                <Mail className="w-5 h-5 mr-3 text-primary mt-1" />
                <div>
                  <span className="block text-white font-medium">Email Support</span>
                  support@ezdoc.org
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm text-center md:text-left mb-4 md:mb-0">
            &copy; 2026 EZDoc - Rural Emergency Medical Assistance System. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
