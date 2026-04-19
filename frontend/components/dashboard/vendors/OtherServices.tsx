'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Award, Shield, CheckCircle, Clock } from 'lucide-react';
import { OtherVendor, ServicePackage } from '../../../types/vendor';

interface OtherServicesProps {
  vendor: OtherVendor;
}

export default function OtherServices({ vendor }: OtherServicesProps) {
  const [activeSection, setActiveSection] = useState<'services' | 'packages'>('services');

  return (
    <div className="space-y-6">
      {/* Section Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveSection('services')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeSection === 'services'
              ? 'bg-primary text-white'
              : 'bg-surface text-text-secondary hover:text-text-primary'
          }`}
        >
          Services
        </button>
        <button
          onClick={() => setActiveSection('packages')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeSection === 'packages'
              ? 'bg-primary text-white'
              : 'bg-surface text-text-secondary hover:text-text-primary'
          }`}
        >
          Packages
        </button>
      </div>

      {/* Services Section */}
      {activeSection === 'services' && (
        <div className="space-y-6">
          {/* Category Badge */}
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Briefcase size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{vendor.subcategory}</h3>
                <p className="text-sm text-text-muted">Service Category</p>
              </div>
            </div>
          </div>

          {/* Services List */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-semibold text-text-primary mb-4">Available Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendor.services.map((service: string, index: number) => (
                <motion.div
                  key={service}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-surface rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CheckCircle size={18} className="text-primary" />
                    </div>
                    <span className="font-medium text-text-primary">{service}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Certifications & Insurance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {vendor.certifications && vendor.certifications.length > 0 && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Certifications</h3>
                <div className="space-y-3">
                  {vendor.certifications.map((cert: string, index: number) => (
                    <motion.div
                      key={cert}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <Award size={18} className="text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{cert}</p>
                        <p className="text-sm text-text-muted">Professional Certification</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {vendor.insuranceAvailable && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-text-primary mb-4">Insurance</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Shield size={18} className="text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Insured & Protected</p>
                    <p className="text-sm text-text-muted">Full coverage available</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Packages Section */}
      {activeSection === 'packages' && (
        <div className="space-y-6">
          {vendor.packages.map((pkg: ServicePackage, index: number) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">{pkg.name}</h3>
                      <p className="text-text-secondary">{pkg.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {vendor.pricing.currency}{pkg.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Package Includes */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="font-medium text-text-primary mb-3">Includes:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {pkg.includes.map((item: string) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-sm text-text-secondary">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                <button className="w-full btn-primary py-3">
                  Select Package
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
