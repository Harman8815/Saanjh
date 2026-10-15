'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, RotateCw, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useWeddingCard } from '../../../../hooks/useWeddingCards';
import { useWedding } from '../../../../hooks/useWeddings';
import {
  IMAGE_TEMPLATES,
  ImageInvitationTemplate,
  imageTemplateName,
  templateIdForCard,
  type ImageInvitationData,
} from '../../../../components/invitations/ImageInvitationTemplate';
import { generatePdfFromElement } from '../../../../utils/pdf';
import toast from 'react-hot-toast';

/** Split "Sarah & Michael" into display parts. */
function splitCoupleNames(coupleNames: string): { brideName: string; groomName: string } {
  const parts = coupleNames.split(/\s*(?:&|\band\b)\s*/i).filter(Boolean);
  if (parts.length >= 2) {
    return { brideName: parts[0].trim(), groomName: parts.slice(1).join(' & ').trim() };
  }
  return { brideName: coupleNames, groomName: '' };
}

export default function ImageInvitationPreviewByIdPage() {
  const router = useRouter();
  const params = useParams();
  const cardId = parseInt(params.id as string, 10);

  const { weddingCard, isLoading, error } = useWeddingCard(cardId);
  // The card itself holds no date or venue; those live on the wedding.
  const { wedding } = useWedding();

  // Default to the card's own template once loaded.
  const [currentTemplate, setCurrentTemplate] = useState<string | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const activeTemplate = currentTemplate ?? templateIdForCard(weddingCard?.template ?? 1);

  const switchTemplate = () => {
    const currentIndex = IMAGE_TEMPLATES.findIndex(t => t.id === activeTemplate);
    const nextIndex = (currentIndex + 1) % IMAGE_TEMPLATES.length;
    setCurrentTemplate(IMAGE_TEMPLATES[nextIndex].id);
  };

  const handleDownload = async () => {
    if (!invitationData) return;
    setPdfGenerating(true);
    try {
      const element = document.getElementById('image-invitation-preview');
      if (!element) return;
      await generatePdfFromElement(element, {
        filename: `invitation-${invitationData.brideName}-${invitationData.groomName}`
          .replace(/\s+/g, '-')
          .toLowerCase(),
      });
      toast.success('Invitation downloaded');
    } catch {
      toast.error('Failed to generate invitation');
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!invitationData) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wedding Invitation',
          text: `${invitationData.brideName} & ${invitationData.groomName} invite you to their wedding!`,
          url: window.location.href,
        });
        return;
      } catch {
        // User dismissed the share sheet; fall through to clipboard.
      }
    }
    await navigator.clipboard.writeText(window.location.href);
    toast.success('Invitation link copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !weddingCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Not Found</h1>
          <p className="text-gray-600 text-sm mb-6">
            The invitation you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/dashboard/invitation-builder/image')}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Builder
          </button>
        </div>
      </div>
    );
  }

  const { brideName, groomName } = splitCoupleNames(weddingCard.couple_names);

  const weddingDate = wedding?.wedding_date
    ? new Date(wedding.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Date to be announced';

  const invitationData: ImageInvitationData = {
    brideName,
    groomName,
    weddingDate,
    venue: wedding?.venue_catalog?.name || 'Venue to be announced',
    message: weddingCard.wedding_details,
    selectedTemplate: activeTemplate,
    primaryColor: weddingCard.primary_color,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-purple-50 to-indigo-100 flex items-center justify-center p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTemplate}
          initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="absolute -top-12 left-0 p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Invitation Frame */}
          <div
            id="image-invitation-preview"
            className="bg-white shadow-2xl overflow-hidden w-[400px] h-[600px] rounded-xl"
          >
            <ImageInvitationTemplate data={invitationData} />
          </div>

          {/* Template label */}
          <p className="text-center mt-4 text-sm text-gray-600">
            {imageTemplateName(activeTemplate)}
          </p>

          {/* Floating Controls */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-4 right-4 flex gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={switchTemplate}
              className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
              title="Switch Template"
            >
              <RotateCw className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDownload}
              disabled={pdfGenerating}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
              title="Download"
            >
              {pdfGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
