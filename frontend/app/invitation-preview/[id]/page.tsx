'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Share2, RotateCw, Loader2, AlertCircle, Mail, MessageSquare } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useWeddingCard, useGenerateShareableLink, useSendInvitationEmails, useSendReminderEmails } from '../../../hooks/useWeddingCards';
import { QRCodeCanvas } from 'qrcode.react';
import { generatePdfFromElement } from '../../../utils/pdf';
import toast from 'react-hot-toast';

const templates = [
  { id: 'elegant-classic', name: 'Elegant Classic' },
  { id: 'modern-animated', name: 'Modern Animated' },
];

const formatWeddingDate = (dateString?: string) => {
  if (!dateString) return 'Date to be announced';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function InvitationPreviewByIdPage() {
  const router = useRouter();
  const params = useParams();
  const cardId = parseInt(params.id as string, 10);

  const { weddingCard, isLoading, error } = useWeddingCard(cardId);
  const generateLinkMutation = useGenerateShareableLink();
  const sendInvitationsMutation = useSendInvitationEmails();
  const sendRemindersMutation = useSendReminderEmails();

  const [currentTemplate, setCurrentTemplate] = useState('elegant-classic');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const switchTemplate = () => {
    const currentIndex = templates.findIndex(t => t.id === currentTemplate);
    const nextIndex = (currentIndex + 1) % templates.length;
    setCurrentTemplate(templates[nextIndex].id);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleShare = async () => {
    if (!weddingCard) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Wedding Invitation',
          text: `${weddingCard.couple_names} invite you to celebrate their wedding!`,
          url: weddingCard.shareable_link,
        });
      } else {
        await navigator.clipboard.writeText(weddingCard.shareable_link);
        toast.success('Invitation link copied to clipboard');
      }
    } catch {
      // User dismissed the share dialog
    }
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current || !weddingCard) return;
    setPdfGenerating(true);
    try {
      await generatePdfFromElement(previewRef.current, {
        filename: `invitation-${weddingCard.couple_names.replace(/\s+/g, '-').toLowerCase()}`,
      });
      toast.success('PDF downloaded');
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setPdfGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
          <p className="text-gray-600">Loading invitation preview...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !weddingCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Not Found</h1>
          <p className="text-gray-600 text-sm mb-6">
            The invitation you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/wedding-cards')}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Wedding Cards
          </button>
        </motion.div>
      </div>
    );
  }

  const shareableUrl = weddingCard.shareable_link || `${window.location.origin}/invite/preview-${weddingCard.id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-purple-50 to-indigo-100">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40 print:hidden"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Invitation Preview</h1>
                <p className="text-sm text-gray-600">See how your invitation will look</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={switchTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <RotateCw className="w-4 h-4" />
                Switch Template
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Preview Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTemplate}
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                {/* Phone Frame */}
                <div ref={previewRef} className="relative mx-auto" style={{ width: '375px', height: '812px' }}>
                  <div className="absolute inset-0 bg-gray-900 rounded-[3rem] shadow-2xl"></div>
                  <div className="absolute inset-2 bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="bg-white px-6 py-2 flex items-center justify-between text-xs">
                      <span className="font-medium">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-3 border border-gray-800 rounded-sm"></div>
                        <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                      </div>
                    </div>

                    {/* Invitation Content */}
                    <div className="h-full pb-20">
                      {currentTemplate === 'elegant-classic' ? (
                        <div className="h-full bg-gradient-to-b from-amber-50 to-white p-8 text-center flex flex-col justify-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="mb-8"
                          >
                            <div
                              className="w-24 h-24 border-4 rounded-full mx-auto mb-6 flex items-center justify-center"
                              style={{ borderColor: weddingCard.primary_color }}
                            >
                              <span className="font-serif text-3xl" style={{ color: weddingCard.primary_color }}>
                                {weddingCard.couple_names.split(' ').map(n => n[0]).join('&')}
                              </span>
                            </div>
                            <h2 className="text-3xl font-serif text-amber-800 mb-3" style={{ color: weddingCard.primary_color }}>
                              {weddingCard.couple_names}
                            </h2>
                            <p className="text-amber-600 italic text-lg">Together forever</p>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-4 text-gray-700"
                          >
                            <p className="text-lg font-medium">{formatWeddingDate()}</p>
                            <div className="w-16 h-0.5 bg-amber-400 mx-auto my-6"></div>
                            <p className="text-sm text-gray-600 italic">{weddingCard.wedding_details}</p>
                          </motion.div>
                        </div>
                      ) : (
                        <div
                          className="h-full p-8 text-white flex flex-col justify-center relative overflow-hidden"
                          style={{
                            background: `linear-gradient(to bottom right, ${weddingCard.primary_color}, ${weddingCard.primary_color}cc, ${weddingCard.primary_color}99)`,
                          }}
                        >
                          {/* Animated background elements */}
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"
                          />
                          <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                            className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full"
                          />

                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative z-10"
                          >
                            <h2 className="text-4xl font-bold mb-4">{weddingCard.couple_names}</h2>
                            <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
                            <motion.p
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.4, type: 'spring' }}
                              className="text-xl opacity-90 mb-8"
                            >
                              Are getting married!
                            </motion.p>

                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.6 }}
                              className="space-y-3 text-lg"
                            >
                              <p>{weddingCard.wedding_details}</p>
                            </motion.div>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Side Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-80 space-y-6 print:hidden"
          >
            {/* Template Info */}
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Template Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Template:</span>
                  <span className="font-medium text-purple-600">
                    {templates.find(t => t.id === currentTemplate)?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Couple:</span>
                  <span className="font-medium">{weddingCard.couple_names}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Allow Guest Photos:</span>
                  <span className="font-medium">{weddingCard.allow_guest_photos ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Require RSVP:</span>
                  <span className="font-medium">{weddingCard.require_rsvp ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Share Link */}
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Share Link</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={shareableUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-gray-50"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareableUrl);
                    toast.success('Link copied!');
                  }}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Copy
                </button>
              </div>
              <button
                onClick={() => setShowQR(!showQR)}
                className="w-full text-sm text-purple-600 hover:text-purple-700"
              >
                {showQR ? 'Hide' : 'Show'} QR Code
              </button>
              {showQR && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 flex justify-center"
                >
                  <div className="p-2 bg-white rounded-lg">
                    <QRCodeCanvas value={shareableUrl} size={120} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadPdf}
                  disabled={pdfGenerating}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {pdfGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {pdfGenerating ? 'Generating...' : 'Download PDF'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShare}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share Invitation
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => sendInvitationsMutation.mutate(cardId)}
                  disabled={sendInvitationsMutation.isPending}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  {sendInvitationsMutation.isPending ? 'Sending...' : 'Send Invitations'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => sendRemindersMutation.mutate(cardId)}
                  disabled={sendRemindersMutation.isPending}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  {sendRemindersMutation.isPending ? 'Sending...' : 'Send Reminders'}
                </motion.button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-900 mb-2">Preview Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>Click "Switch Template" to see different designs</li>
                <li>Use fullscreen mode for better viewing</li>
                <li>This preview shows how it will look on mobile</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
