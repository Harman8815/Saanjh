'use client';

import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';

/**
 * Shared image invitation templates.
 *
 * Both the invitation builder and the preview route render through this
 * component so the two can never drift apart: any design change here shows up
 * in the editor preview and the public preview alike.
 */

export interface ImageInvitationData {
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  ceremonyTime?: string;
  receptionTime?: string;
  rsvpDeadline?: string;
  /** Free-text line from the card, shown when set. */
  message?: string;
  selectedTemplate: string;
  /** Card accent color; each template also has its own fallback palette. */
  primaryColor?: string;
}

export const IMAGE_TEMPLATES = [
  {
    id: 'elegant-classic',
    name: 'Elegant Classic',
    description: 'Timeless and sophisticated design',
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean and contemporary design',
  },
  {
    id: 'romantic-floral',
    name: 'Romantic Floral',
    description: 'Soft and romantic with floral elements',
  },
  {
    id: 'bold-artistic',
    name: 'Bold Artistic',
    description: 'Creative and eye-catching design',
  },
] as const;

/** Map the backend card template number onto the image template ids. */
export const templateIdForCard = (template: number): string => {
  switch (template) {
    case 2:
      return 'modern-minimal';
    case 3:
      return 'romantic-floral';
    case 4:
    case 5:
    case 6:
      return 'bold-artistic';
    case 1:
    default:
      return 'elegant-classic';
  }
};

export const imageTemplateName = (id: string): string =>
  IMAGE_TEMPLATES.find(t => t.id === id)?.name ?? 'Elegant Classic';

export function ImageInvitationTemplate({ data }: { data: ImageInvitationData }) {
  return <ImageInvitationTemplateInternal data={data} />;
}

function ImageInvitationTemplateInternal({ data }: { data: ImageInvitationData }) {
  const initials = `${data.brideName.charAt(0)}&${data.groomName.charAt(0)}`.toUpperCase();
  const accent = data.primaryColor;

  switch (data.selectedTemplate) {
    case 'elegant-classic':
      return (
        <div className="h-full bg-gradient-to-b from-amber-50 to-white p-8 text-center flex flex-col justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-8"
          >
            <div
              className="w-32 h-32 border-4 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ borderColor: accent || '#d97706' }}
            >
              <span className="font-serif text-4xl" style={{ color: accent || '#d97706' }}>
                {initials}
              </span>
            </div>
            <h2
              className="text-4xl font-serif text-amber-800 mb-3"
              style={accent ? { color: accent } : undefined}
            >
              {data.brideName} & {data.groomName}
            </h2>
            <p className="text-amber-600 italic text-xl">Together forever</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 text-gray-700"
          >
            <p className="text-xl font-medium">{data.weddingDate}</p>
            <p className="text-xl">{data.venue}</p>
            {data.ceremonyTime && <p className="text-lg">{data.ceremonyTime}</p>}
            <div className="w-20 h-0.5 bg-amber-400 mx-auto my-8"></div>
            <p className="text-lg text-gray-600 italic">Join us as we begin our forever</p>
            {data.message && (
              <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">{data.message}</p>
            )}
            {data.receptionTime && (
              <p className="text-sm text-gray-500 mt-8">Reception to follow at {data.receptionTime}</p>
            )}
          </motion.div>
        </div>
      );

    case 'modern-minimal':
      return (
        <div className="h-full bg-white p-8 text-center flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-5xl font-light text-gray-900 mb-4">{data.brideName}</h2>
            <div className="text-3xl text-gray-400 mb-4">&</div>
            <h2 className="text-5xl font-light text-gray-900 mb-8">{data.groomName}</h2>
            <div
              className="w-24 h-0.5 mx-auto mb-8"
              style={{ backgroundColor: accent || '#d1d5db' }}
            ></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 text-gray-700"
          >
            <p className="text-sm uppercase tracking-wider">{data.weddingDate}</p>
            <p className="text-xl">{data.venue}</p>
            {data.ceremonyTime && <p className="text-sm text-gray-500">{data.ceremonyTime}</p>}
            <div className="w-16 h-0.5 bg-gray-300 mx-auto my-8"></div>
            {data.message && (
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">{data.message}</p>
            )}
            {data.rsvpDeadline ? (
              <p className="text-xs text-gray-400 mt-8 uppercase tracking-wider">
                RSVP by {data.rsvpDeadline}
              </p>
            ) : (
              data.receptionTime && (
                <p className="text-xs text-gray-400 mt-8 uppercase tracking-wider">
                  Reception {data.receptionTime}
                </p>
              )
            )}
          </motion.div>
        </div>
      );

    case 'romantic-floral':
      return (
        <div className="h-full bg-gradient-to-b from-pink-50 to-white p-8 text-center flex flex-col justify-center relative overflow-hidden">
          {/* Decorative floral elements */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute top-8 left-8 w-20 h-20 border-2 rounded-full opacity-30"
            style={{ borderColor: accent || '#fbcfe8' }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-8 right-8 w-24 h-24 border-2 rounded-full opacity-30"
            style={{ borderColor: accent || '#fbcfe8' }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 relative z-10"
          >
            <h2
              className="text-4xl font-serif text-pink-800 mb-4"
              style={accent ? { color: accent } : undefined}
            >
              {data.brideName} & {data.groomName}
            </h2>
            <p className="text-pink-600 italic text-lg">Are getting married</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 text-gray-700 relative z-10"
          >
            <p className="text-xl font-medium">{data.weddingDate}</p>
            <p className="text-lg">{data.venue}</p>
            {data.ceremonyTime && <p className="text-sm text-pink-600 mt-4">{data.ceremonyTime}</p>}
            <div className="w-20 h-0.5 bg-pink-300 mx-auto my-6"></div>
            <p className="text-lg text-gray-600 italic">With love and joy</p>
            {data.message && (
              <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">{data.message}</p>
            )}
            {data.receptionTime && (
              <p className="text-sm text-gray-500 mt-6">Reception {data.receptionTime}</p>
            )}
          </motion.div>
        </div>
      );

    case 'bold-artistic':
      return (
        <div
          className="h-full p-8 text-white text-center flex flex-col justify-center relative overflow-hidden"
          style={{
            background: accent
              ? `linear-gradient(to bottom right, ${accent}, ${accent}cc, ${accent}99)`
              : 'linear-gradient(to bottom right, #9333ea, #ec4899, #4f46e5)',
          }}
        >
          {/* Animated background elements */}
          <motion.div
            animate={{ x: [0, 50, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 relative z-10"
          >
            <h2 className="text-5xl font-bold mb-6">
              {data.brideName} & {data.groomName}
            </h2>
            <div className="w-32 h-1 bg-white mx-auto mb-8"></div>
            <motion.p
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="text-2xl opacity-90 mb-8"
            >
              Are getting married!
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-4 relative z-10"
          >
            <p className="text-xl">{data.weddingDate}</p>
            <p className="text-xl">{data.venue}</p>
            {data.ceremonyTime && <p className="text-lg opacity-90 mt-6">{data.ceremonyTime}</p>}
            <div className="w-24 h-0.5 bg-white/50 mx-auto my-8"></div>
            <p className="text-lg opacity-80">Join us in celebration</p>
            {data.message && (
              <p className="text-sm opacity-80 max-w-xs mx-auto leading-relaxed">{data.message}</p>
            )}
            {data.receptionTime && (
              <p className="text-sm opacity-60 mt-6">Reception {data.receptionTime}</p>
            )}
          </motion.div>
        </div>
      );

    default:
      return (
        <div className="h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Select a template to preview</p>
          </div>
        </div>
      );
  }
}

export default ImageInvitationTemplate;
