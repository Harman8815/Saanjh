'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useAppStore } from '../../../store/useAppStore';
import { Heart, Camera, Share2, BarChart3, Settings, Download, Mail, MessageSquare, Copy, Users, Check, X, Clock, Upload, Edit, Trash2, Loader2, AlertCircle, RotateCw, Printer } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useWeddingCard, useWeddingCardGuests, useWeddingCardAnalytics, useUpdateWeddingCard, useAddGuestToWeddingCard, useDeleteWeddingCardGuest, useUpdateWeddingCardGuest, useUploadGuestPhoto, useGenerateShareableLink, useDisableShareableLink, useUpdateShareableLink, useSendInvitationEmails, useSendReminderEmails, useExportWeddingCardGuests } from '../../../hooks/useWeddingCards';
import { generatePdfFromElement } from '../../../utils/pdf';
import toast from 'react-hot-toast';

interface CardData {
  id: number;
  template: number;
  couple_names: string;
  wedding_details: string;
  primary_color: string;
  font_style: string;
  photos: string[];
  allow_guest_photos: boolean;
  require_rsvp: boolean;
  send_reminders: boolean;
  shareable_link: string;
  created_at: string;
  updated_at: string;
}

interface Guest {
  id: number;
  name: string;
  email: string;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  rsvp_date?: string;
  plus_one: boolean;
  plus_one_name: string;
  dietary_restrictions: string;
  notes: string;
  uploaded_photos: string[];
  created_at: string;
}

interface Analytics {
  total_views: number;
  total_rsvps: number;
  confirmed_rsvps: number;
  declined_rsvps: number;
  total_photos_uploaded: number;
  last_activity: string;
}

export default function WeddingCardDetailPage() {
  const params = useParams();
  const { setCurrentPage } = useAppStore();
  const cardId = parseInt(params.id as string, 10);

  const { weddingCard, isLoading: cardLoading, error: cardError, mutate: mutateCard } = useWeddingCard(cardId);
  const { guests, isLoading: guestsLoading, error: guestsError, mutate: mutateGuests } = useWeddingCardGuests(cardId);
  const { analytics, isLoading: analyticsLoading, error: analyticsError, mutate: mutateAnalytics } = useWeddingCardAnalytics(cardId);

  const updateCardMutation = useUpdateWeddingCard();
  const addGuestMutation = useAddGuestToWeddingCard();
  const updateGuestMutation = useUpdateWeddingCardGuest();
  const deleteGuestMutation = useDeleteWeddingCardGuest();
  const uploadPhotoMutation = useUploadGuestPhoto();
  const generateLinkMutation = useGenerateShareableLink();
  const disableLinkMutation = useDisableShareableLink();
  const updateLinkMutation = useUpdateShareableLink();
  const sendInvitationsMutation = useSendInvitationEmails();
  const sendRemindersMutation = useSendReminderEmails();
  const exportGuestsMutation = useExportWeddingCardGuests();

  const [localCardData, setLocalCardData] = useState<Partial<CardData>>({});
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', email: '' });
  const [editingGuestId, setEditingGuestId] = useState<number | null>(null);
  const [editGuestData, setEditGuestData] = useState({ name: '', email: '' });
  const [showQRCode, setShowQRCode] = useState(false);
  const [uploadingGuestId, setUploadingGuestId] = useState<number | null>(null);
  const cardPreviewRef = useRef<HTMLDivElement>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [guestExporting, setGuestExporting] = useState(false);

  // Sync local card data with API data
  useEffect(() => {
    if (weddingCard) {
      setLocalCardData({
        template: weddingCard.template,
        couple_names: weddingCard.couple_names,
        wedding_details: weddingCard.wedding_details,
        primary_color: weddingCard.primary_color,
        font_style: weddingCard.font_style,
        photos: weddingCard.photos,
        allow_guest_photos: weddingCard.allow_guest_photos,
        require_rsvp: weddingCard.require_rsvp,
        send_reminders: weddingCard.send_reminders,
      });
    }
  }, [weddingCard]);

  const handleCardUpdate = async (field: keyof CardData, value: any) => {
    setLocalCardData(prev => ({ ...prev, [field]: value }));
    try {
      await updateCardMutation.mutateAsync({ cardId, cardData: { [field]: value } });
      toast.success('Saved successfully');
      mutateCard();
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const handleAddGuest = async () => {
    if (!newGuest.name || !newGuest.email) return;
    try {
      await addGuestMutation.mutateAsync({ cardId, guestData: { name: newGuest.name, email: newGuest.email, rsvp_status: 'pending', plus_one: false, plus_one_name: '', dietary_restrictions: '', notes: '' } });
      toast.success('Guest added');
      setNewGuest({ name: '', email: '' });
      setShowAddGuestModal(false);
      mutateGuests();
      mutateAnalytics();
    } catch (error) {
      toast.error('Failed to add guest');
    }
  };

  const handleDeleteGuest = async (guestId: number) => {
    if (!confirm('Delete this guest?')) return;
    try {
      await deleteGuestMutation.mutateAsync({ cardId, guestId });
      toast.success('Guest deleted');
      mutateGuests();
      mutateAnalytics();
    } catch (error) {
      toast.error('Failed to delete guest');
    }
  };

  const handleEditGuest = async (guest: Guest) => {
    try {
      await updateGuestMutation.mutateAsync({ cardId, guestId: guest.id, guestData: { name: editGuestData.name, email: editGuestData.email } });
      toast.success('Guest updated');
      setEditingGuestId(null);
      mutateGuests();
    } catch (error) {
      toast.error('Failed to update guest');
    }
  };

  const handleGenerateLink = async () => {
    try {
      const result = await generateLinkMutation.mutateAsync(cardId);
      toast.success('Link generated');
      mutateCard();
    } catch (error) {
      toast.error('Failed to generate link');
    }
  };

  const handleSendInvitations = async () => {
    try {
      await sendInvitationsMutation.mutateAsync(cardId);
      toast.success('Invitations sent');
    } catch (error) {
      toast.error('Failed to send invitations');
    }
  };

  const handleSendReminders = async () => {
    try {
      await sendRemindersMutation.mutateAsync(cardId);
      toast.success('Reminders sent');
    } catch (error) {
      toast.error('Failed to send reminders');
    }
  };

  const handlePhotoUpload = async (guestId: number, file: File) => {
    setUploadingGuestId(guestId);
    try {
      await uploadPhotoMutation.mutateAsync({ cardId, guestId, photoFile: file });
      toast.success('Photo uploaded');
      mutateGuests();
      mutateAnalytics();
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingGuestId(null);
    }
  };

  const handleDownloadPdf = async () => {
    if (!cardPreviewRef.current) return;
    setPdfGenerating(true);
    try {
      await generatePdfFromElement(cardPreviewRef.current, {
        filename: `wedding-card-${card.couple_names.replace(/\s+/g, '-').toLowerCase()}`,
      });
      toast.success('PDF downloaded');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setPdfGenerating(false);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  const handleExportGuests = async () => {
    setGuestExporting(true);
    try {
      await exportGuestsMutation.mutateAsync({ cardId, format: 'csv' });
    } catch (error) {
      toast.error('Failed to export guest list');
    } finally {
      setGuestExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Wedding Invitation',
          text: `${card.couple_names} invite you to celebrate their wedding!`,
          url: shareableLink,
        });
      } else {
        await navigator.clipboard.writeText(shareableLink);
        toast.success('Invitation link copied to clipboard');
      }
    } catch {
      // User dismissed the native share dialog
    }
  };

  if (cardLoading || guestsLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-text-secondary">Loading wedding card...</p>
        </motion.div>
      </div>
    );
  }

  if (cardError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Failed to Load</h2>
          <p className="text-text-secondary">Unable to load wedding card data</p>
        </motion.div>
      </div>
    );
  }

  const card = weddingCard || localCardData as CardData;
  const shareableLink = card.shareable_link || `https://wedding-app.com/card/${cardId}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card Editor */}
          <div className="lg:col-span-2">
            {/* TODO: Add card preview and editing interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="glass-card p-8 mb-8"
            >
              <h1 className="text-2xl font-bold text-text-primary mb-6">
                Edit Wedding Card - {cardId}
              </h1>
              
              {/* Card Preview */}
              <div className="mb-8" ref={cardPreviewRef}>
                <div className="h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
                  <div className="relative z-10 text-center p-8">
                    <div className="mb-6">
                      <Heart size={48} className="text-purple-500 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold text-gray-800 mb-2" style={{ color: card.primary_color }}>
                        {card.couple_names}
                      </h2>
                      <p className="text-gray-600 max-w-md mx-auto">
                        {card.wedding_details}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Customization Options */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Template
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        onClick={() => handleCardUpdate('template', i)}
                        className={`h-24 bg-surface rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                          (card.template === i) ? 'ring-2 ring-purple-500 bg-purple-500/20' : 'hover:bg-white/10'
                        }`}
                      >
                        <span className="text-sm font-medium">Template {i}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Text Content
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Couple Names"
                      value={card.couple_names || ''}
                      onChange={(e) => handleCardUpdate('couple_names', e.target.value)}
                      className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                    />
                    <textarea
                      placeholder="Wedding Details"
                      value={card.wedding_details || ''}
                      onChange={(e) => handleCardUpdate('wedding_details', e.target.value)}
                      className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Photos
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {card.photos?.map((photo: string, i: number) => (
                      <div key={i} className="h-32 bg-surface rounded-lg flex items-center justify-center relative">
                        <img src={photo} alt={`Photo ${i+1}`} className="w-full h-full object-cover rounded-lg" />
                        <button className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded" onClick={() => handleCardUpdate('photos', card.photos.filter((_: string, idx: number) => idx !== i))}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {[1, 2].map((i) => (
                      <div key={i} className="h-32 bg-surface rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/10 border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-500">Upload Photo {i}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Colors & Fonts
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-text-secondary mb-2">Primary Color</label>
                      <input
                        type="color"
                        value={card.primary_color || '#8B5CF6'}
                        onChange={(e) => handleCardUpdate('primary_color', e.target.value)}
                        className="w-full h-10 bg-surface border border-white/20 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary mb-2">Font Style</label>
                      <select 
                        value={card.font_style || 'elegant'}
                        onChange={(e) => handleCardUpdate('font_style', e.target.value)}
                        className="w-full p-2 bg-surface border border-white/20 rounded-lg text-text-primary"
                      >
                        <option value="elegant">Elegant</option>
                        <option value="modern">Modern</option>
                        <option value="classic">Classic</option>
                        <option value="playful">Playful</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Guest List Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                Guest List
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-text-primary">
                    Manage Guests ({guests.length})
                  </h3>
                  <button 
                    onClick={() => setShowAddGuestModal(true)}
                    className="btn-primary btn-sm flex items-center gap-2"
                  >
                    <Users size={16} />
                    Add Guest
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-2 text-text-primary">Name</th>
                        <th className="text-left p-2 text-text-primary">Email</th>
                        <th className="text-left p-2 text-text-primary">RSVP</th>
                        <th className="text-left p-2 text-text-primary">Photos</th>
                        <th className="text-left p-2 text-text-primary">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guests.map((guest) => (
                        <tr key={guest.id} className="border-b border-white/10">
                          <td className="p-2 text-text-primary">{guest.name}</td>
                          <td className="p-2 text-text-secondary">{guest.email}</td>
                          <td className="p-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              guest.rsvp_status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                              guest.rsvp_status === 'declined' ? 'bg-red-500/20 text-red-500' :
                              'bg-yellow-500/20 text-yellow-500'
                            }`}>
                              {guest.rsvp_status === 'confirmed' && <Check size={12} />}
                              {guest.rsvp_status === 'declined' && <X size={12} />}
                              {guest.rsvp_status === 'pending' && <Clock size={12} />}
                              {guest.rsvp_status}
                            </span>
                          </td>
                          <td className="p-2">
                            {guest.uploaded_photos && guest.uploaded_photos.length > 0 ? (
                              <span className="text-green-500 text-sm">{guest.uploaded_photos.length} photo(s)</span>
                            ) : (
                              <span className="text-text-secondary text-sm">No photos</span>
                            )}
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <button 
                                onClick={() => {
                                  setEditingGuestId(guest.id);
                                  setEditGuestData({ name: guest.name, email: guest.email });
                                }}
                                className="btn-secondary btn-xs flex items-center gap-1"
                              >
                                <Edit size={12} />
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteGuest(guest.id)}
                                className="btn-secondary btn-xs flex items-center gap-1 text-red-500"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Card Sharing Options */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="glass-card p-6 mb-6"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Share Card
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-text-secondary mb-2">
                    Shareable Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareableLink}
                      readOnly
                      className="flex-1 p-2 bg-surface border border-white/20 rounded-lg text-text-secondary"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(shareableLink);
                        toast.success('Link copied!');
                      }}
                      className="btn-primary btn-sm flex items-center gap-1"
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                    <button 
                      onClick={() => handleGenerateLink()}
                      className="btn-secondary btn-sm flex items-center gap-1"
                      disabled={generateLinkMutation.isPending}
                    >
                      <RotateCw size={14} />
                      Regenerate
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-text-secondary mb-2">
                    QR Code
                  </label>
                  <div className="h-32 bg-surface rounded-lg flex items-center justify-center relative">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-white rounded-lg p-2 mb-2">
                        <QRCodeCanvas value={shareableLink} size={96} />
                      </div>
                      <p className="text-xs text-text-secondary">Scan to view card</p>
                    </div>
                    {showQRCode && (
                      <button 
                        onClick={() => setShowQRCode(false)}
                        className="absolute top-2 right-2 p-1 text-text-secondary hover:text-text-primary"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleSendInvitations}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                    disabled={sendInvitationsMutation.isPending}
                  >
                    <Mail size={16} />
                    {sendInvitationsMutation.isPending ? 'Sending...' : 'Email'}
                  </button>
                  <button 
                    onClick={handleSendReminders}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                    disabled={sendRemindersMutation.isPending}
                  >
                    <MessageSquare size={16} />
                    {sendRemindersMutation.isPending ? 'Sending...' : 'SMS'}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Card Analytics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card p-6 mb-6"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Analytics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Views</span>
                  <span className="text-primary font-semibold">{analytics?.total_views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total RSVPs</span>
                  <span className="text-primary font-semibold">{analytics?.total_rsvps || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Confirmed</span>
                  <span className="text-green-500 font-semibold">{analytics?.confirmed_rsvps || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Declined</span>
                  <span className="text-red-500 font-semibold">{analytics?.declined_rsvps || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Photos Uploaded</span>
                  <span className="text-primary font-semibold">{analytics?.total_photos_uploaded || 0}</span>
                </div>
              </div>
            </motion.div>

            {/* Card Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="glass-card p-6 mb-6"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Settings
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Allow Guest Photos</span>
                  <input 
                    type="checkbox" 
                    checked={card.allow_guest_photos}
                    onChange={(e) => handleCardUpdate('allow_guest_photos', e.target.checked)}
                    className="toggle" 
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Require RSVP</span>
                  <input 
                    type="checkbox" 
                    checked={card.require_rsvp}
                    onChange={(e) => handleCardUpdate('require_rsvp', e.target.checked)}
                    className="toggle" 
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Send Reminders</span>
                  <input 
                    type="checkbox" 
                    checked={card.send_reminders}
                    onChange={(e) => handleCardUpdate('send_reminders', e.target.checked)}
                    className="toggle" 
                  />
                </div>
              </div>
            </motion.div>

            {/* Export Options */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Export Options
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleDownloadPdf}
                  disabled={pdfGenerating}
                  className="w-full btn-secondary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {pdfGenerating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  {pdfGenerating ? 'Generating...' : 'Download as PDF'}
                </button>
                <button
                  onClick={handlePrintCard}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <Printer size={16} />
                  Print Card
                </button>
                <button
                  onClick={handleExportGuests}
                  disabled={guestExporting}
                  className="w-full btn-secondary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {guestExporting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Users size={16} />
                  )}
                  {guestExporting ? 'Exporting...' : 'Export Guest List'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddGuestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-text-primary mb-4">Add New Guest</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary mb-2">Name</label>
                <input
                  type="text"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                  className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                  placeholder="Enter guest name"
                />
              </div>
              <div>
                <label className="block text-text-secondary mb-2">Email</label>
                <input
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
                  className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                  placeholder="Enter guest email"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddGuest}
                className="flex-1 btn-primary"
                disabled={addGuestMutation.isPending}
              >
                {addGuestMutation.isPending ? 'Adding...' : 'Add Guest'}
              </button>
              <button
                onClick={() => {
                  setShowAddGuestModal(false);
                  setNewGuest({ name: '', email: '' });
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Edit Guest Modal */}
      {editingGuestId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-text-primary mb-4">Edit Guest</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary mb-2">Name</label>
                <input
                  type="text"
                  value={editGuestData.name}
                  onChange={(e) => setEditGuestData({...editGuestData, name: e.target.value})}
                  className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                  placeholder="Enter guest name"
                />
              </div>
              <div>
                <label className="block text-text-secondary mb-2">Email</label>
                <input
                  type="email"
                  value={editGuestData.email}
                  onChange={(e) => setEditGuestData({...editGuestData, email: e.target.value})}
                  className="w-full p-3 bg-surface border border-white/20 rounded-lg text-text-primary"
                  placeholder="Enter guest email"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  const guest = guests.find(g => g.id === editingGuestId);
                  if (guest) handleEditGuest(guest);
                }}
                className="flex-1 btn-primary"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditingGuestId(null);
                  setEditGuestData({ name: '', email: '' });
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
