'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  features: string[];
}

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: (templateId: string) => void;
}

export default function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(template.id)}
      className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 ${
        isSelected
          ? 'border-primary shadow-lg shadow-primary/25 scale-105'
          : 'border-white/20 hover:border-white/40 hover:shadow-lg'
      }`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 z-10 bg-primary text-white rounded-full p-2"
        >
          <Check className="w-4 h-4" />
        </motion.div>
      )}

      {/* Template Preview */}
      <div className="aspect-[3/4] bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              template.id === 'elegant-classic' 
                ? 'bg-gradient-to-r from-amber-100 to-rose-100' 
                : 'bg-gradient-to-r from-blue-100 to-purple-100'
            }`}>
              <span className="text-2xl font-bold text-gray-700">
                {template.id === 'elegant-classic' ? 'E' : 'M'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{template.name}</h3>
            <p className="text-sm text-gray-600">{template.category}</p>
          </div>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-6 bg-white">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>
        
        {/* Features */}
        <div className="space-y-2">
          {template.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Select Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(template.id);
          }}
          className={`w-full mt-6 py-3 rounded-lg font-medium transition-all ${
            isSelected
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isSelected ? 'Selected' : 'Select Template'}
        </button>
      </div>
    </motion.div>
  );
}
