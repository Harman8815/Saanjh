'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Download, QrCode, Check, X, ExternalLink } from 'lucide-react';

interface SharingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  invitationData: {
    brideName?: string;
    groomName?: string;
    weddingDate?: string;
    venue?: string;
    selectedTemplate?: string;
  };
}

export default function SharingPanel({ isOpen, onClose, invitationData }: SharingPanelProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate public link for invitation
  const generatePublicLink = () => {
    // Generate a unique ID based on invitation data
    const uniqueId = btoa(JSON.stringify(invitationData)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/invite/${uniqueId}`;
  };

  const publicLink = generatePublicLink();

  // Copy link to clipboard
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Generate QR Code
  const generateQRCode = async () => {
    if (qrCodeUrl) return; // Already generated

    setIsGeneratingQR(true);
    
    try {
      // Simple QR code generation using canvas
      // In production, you'd use a library like qrcode.js
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 256;
      canvas.width = size;
      canvas.height = size;

      // Create a simple QR-like pattern (this is a placeholder)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Draw QR-like pattern
      const cellSize = 8;
      const cells = size / cellSize;
      
      // Generate pseudo-random pattern based on the URL
      for (let i = 0; i < cells; i++) {
        for (let j = 0; j < cells; j++) {
          const index = (i * cells + j) % publicLink.length;
          const charCode = publicLink.charCodeAt(index);
          if (charCode % 2 === 0) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(i * cellSize, j * cellSize, cellSize - 1, cellSize - 1);
          }
        }
      }

      // Add corner squares (QR code pattern)
      ctx.fillStyle = '#000000';
      // Top-left
      ctx.fillRect(0, 0, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cellSize, cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect(2 * cellSize, 2 * cellSize, 3 * cellSize, 3 * cellSize);

      // Top-right
      ctx.fillRect((cells - 7) * cellSize, 0, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((cells - 6) * cellSize, cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect((cells - 5) * cellSize, 2 * cellSize, 3 * cellSize, 3 * cellSize);

      // Bottom-left
      ctx.fillRect(0, (cells - 7) * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cellSize, (cells - 6) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect(2 * cellSize, (cells - 5) * cellSize, 3 * cellSize, 3 * cellSize);

      setQrCodeUrl(canvas.toDataURL());
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Download QR Code
  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `wedding-invitation-qr-${Date.now()}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  // Open invitation in new tab
  const openInvitation = () => {
    window.open(publicLink, '_blank');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative bg-surface border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface/95 backdrop-blur-md border-b border-white/20 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Share Your Invitation</h2>
              <p className="text-text-secondary text-sm">Generate links and QR codes for your guests</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-8">
          {/* Public Link Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-primary" />
              Public Invitation Link
            </h3>
            
            <div className="bg-white/10 border border-white/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={publicLink}
                  readOnly
                  className="flex-1 bg-transparent text-text-primary placeholder-text-muted px-3 py-2 rounded border border-white/20 focus:outline-none focus:border-primary"
                />
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-text-secondary text-sm mt-2">
                Share this link with your guests to view your invitation
              </p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              QR Code
            </h3>
            
            <div className="bg-white/10 border border-white/20 rounded-lg p-6">
              {!qrCodeUrl ? (
                <div className="text-center">
                  <button
                    onClick={generateQRCode}
                    disabled={isGeneratingQR}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                  >
                    {isGeneratingQR ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-5 h-5" />
                        <span>Generate QR Code</span>
                      </>
                    )}
                  </button>
                  <p className="text-text-secondary text-sm mt-4">
                    Generate a QR code that guests can scan to view your invitation
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg">
                      <img 
                        src={qrCodeUrl} 
                        alt="Invitation QR Code" 
                        className="w-32 h-32"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={downloadQRCode}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download QR</span>
                    </button>
                    <button
                      onClick={() => setQrCodeUrl('')}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 text-text-primary rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                  
                  <p className="text-text-secondary text-sm text-center">
                    Download and print this QR code for guests to scan
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Preview</h3>
            
            <div className="bg-white/10 border border-white/20 rounded-lg p-4">
              <button
                onClick={openInvitation}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-text-primary rounded-lg hover:bg-white/20 transition-colors w-full justify-center"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Invitation</span>
              </button>
              <p className="text-text-secondary text-sm mt-2 text-center">
                See how your invitation looks to guests
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hidden canvas for QR code generation */}
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}
