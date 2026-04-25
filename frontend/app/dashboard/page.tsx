'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { WeddingService } from '../../services/weddings';
import { GuestService } from '../../services/guests';
import { ExpenseService } from '../../services/expenses';
import { VendorService } from '../../services/vendors';
import { TimelineService } from '../../services/timeline';
import { AdminService } from '../../services/admin';
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton';
import FirstTimeModal from '../../components/common/FirstTimeModal';
import { useFormatCurrency } from '../../hooks/useFormatCurrency';
import { useDateFormat } from '../../hooks/useDateFormat';
import { Wedding, WeddingDashboard, Guest, Expense, Vendor, TimelineEvent } from '../../types/api';


export default function DashboardPage() {
  const { user } = useAuthStore();
  const { formatCurrency } = useFormatCurrency();
  const { formatDateForDisplay } = useDateFormat();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'table' | 'card' | 'graph'>('table');
  const [activeAction, setActiveAction] = useState<'guest' | 'expense' | 'vendor'>('guest');
  const [showModal, setShowModal] = useState(false);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [isGeneratingData, setIsGeneratingData] = useState(false);

  // Data state
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [dashboardData, setDashboardData] = useState<WeddingDashboard | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch wedding data
      const weddingData = await WeddingService.getWedding();
      setWedding(weddingData);

      // Check if user needs to fill wedding details
      if (!weddingData.wedding_date || !weddingData.theme) {
        setShowFirstTimeModal(true);
        setShowModal(true);
      }

      // Fetch dashboard statistics
      const dashboardStats = await WeddingService.getDashboard();
      setDashboardData(dashboardStats);

      // Fetch other data in parallel
      const [guestsData, expensesData, vendorsData, timelineData] = await Promise.all([
        GuestService.getGuests(1, 20),
        ExpenseService.getExpenses(1, 20),
        VendorService.getVendors(1, 20),
        TimelineService.getTimelineEvents(1, 20)
      ]);

      setGuests(guestsData.results);
      setExpenses(expensesData.results);
      setVendors(vendorsData.results);
      setTimeline(timelineData.results);

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setShowFirstTimeModal(false);
  };

  const handleEditDetails = () => {
    setShowModal(true);
    setShowFirstTimeModal(true);
  };

  const handleWeddingUpdate = async (weddingData: Partial<Wedding>) => {
    try {
      const updatedWedding = await WeddingService.updateWedding(weddingData);
      setWedding(updatedWedding);
      handleModalClose();
      // Refresh dashboard data
      await fetchDashboardData();
    } catch (err: any) {
      console.error('Error updating wedding:', err);
      setError(err.message || 'Failed to update wedding details');
    }
  };

  const handleGenerateFakeData = async () => {
    if (!confirm('This will generate fake data for testing. Continue?')) {
      return;
    }

    setIsGeneratingData(true);
    try {
      const response = await AdminService.generateFakeData({
        user_count: 1,
        guests_per_wedding: 30,
        vendors_per_wedding: 8,
        expenses_per_wedding: 15
      });
      alert(`Generated ${response.summary.guests_created} guests, ${response.summary.vendors_created} vendors, ${response.summary.expenses_created} expenses`);
      // Refresh dashboard data
      await fetchDashboardData();
    } catch (err: any) {
      console.error('Error generating fake data:', err);
      alert(err.message || 'Failed to generate fake data');
    } finally {
      setIsGeneratingData(false);
    }
  };

  // Calculate days until wedding
  const calculateDaysUntilWedding = () => {
    if (!wedding?.wedding_date) return 0;
    const weddingDate = new Date(wedding.wedding_date);
    const today = new Date();
    const diffTime = weddingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate budget percentage
  const calculateBudgetPercentage = () => {
    if (!dashboardData) return 0;
    const totalBudget = dashboardData.total_expenses || 0;
    const paidExpenses = dashboardData.paid_expenses || 0;
    return totalBudget > 0 ? Math.round((paidExpenses / totalBudget) * 100) : 0;
  };

  return (
    <>
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="container mx-auto px-4 py-8">
          {/* Header with Edit Details Button */}
          <div className="flex justify-between items-center mb-8 px-4">
            <div className="text-center flex-1">
              {user?.first_name && user?.last_name ? (
                <h1 className="text-3xl font-bold text-text-primary mb-2">
                  {user.first_name} & {user.last_name}
                </h1>
              ) : (
                <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome to Your Wedding Dashboard</h1>
              )}
              {wedding?.wedding_date && (
                <p className="text-text-secondary">
                  {formatDateForDisplay(new Date(wedding.wedding_date))}
                </p>
              )}
            </div>
            <button
              onClick={handleEditDetails}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-text-primary transition-all text-sm font-medium"
            >
              Edit Details
            </button>
          </div>




          <>
            {/* Table Cards View - Wedding Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="heading-data text-data-lg text-text-primary">Days Until Wedding</h3>
                  <span className="text-emotional-2xl text-primary">Wedding</span>
                </div>
                <div className="text-data-3xl font-bold text-primary mb-2">
                  {calculateDaysUntilWedding()}
                </div>
                <p className="body-data text-data-sm text-text-secondary">
                  {wedding?.wedding_date ? formatDateForDisplay(new Date(wedding.wedding_date)) : 'No date set'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="heading-data text-data-lg text-text-primary">Budget Used</h3>
                  <span className="text-emotional-2xl text-primary">Budget</span>
                </div>
                <div className="text-data-3xl font-bold text-primary mb-2">
                  {calculateBudgetPercentage()}%
                </div>
                <p className="body-data text-data-sm text-text-secondary">
                  {formatCurrency(dashboardData?.total_expenses || 0)} total expenses
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="heading-data text-data-lg text-text-primary">Guest RSVPs</h3>
                  <span className="text-emotional-2xl text-primary">Guests</span>
                </div>
                <div className="text-data-3xl font-bold text-primary mb-2">
                  {dashboardData?.confirmed_guests || 0}
                </div>
                <p className="body-data text-data-sm text-text-secondary">
                  {dashboardData?.total_guests || 0} invited
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Tasks Complete</h3>
                  <span className="text-2xl">Tasks</span>
                </div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {timeline.length > 0 ? Math.round((timeline.filter(t => t.status === 'completed').length / timeline.length) * 100) : 0}%
                </div>
                <p className="text-text-secondary text-sm">
                  {timeline.length} total tasks
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="glass-card p-8"
                >
                  <h2 className="text-2xl font-bold text-text-primary mb-6">
                    Wedding Timeline
                  </h2>
                  <div className="space-y-4">
                    {timeline.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-4 h-4 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <h4 className="text-text-primary">{item.title}</h4>
                          <p className="text-text-secondary text-sm">{item.description || 'No description'}</p>
                        </div>
                        <span className="text-text-secondary text-sm">
                          {item.date ? formatDateForDisplay(new Date(item.date)) : 'No date'}
                        </span>
                      </div>
                    ))}
                    {timeline.length === 0 && (
                      <p className="text-text-secondary text-sm">No timeline events yet</p>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="glass-card p-8"
                >
                  <h2 className="text-2xl font-bold text-text-primary mb-6">
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    <p className="text-text-secondary text-sm">No recent activity to display</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="glass-card p-8"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-text-primary">
                      Upcoming Tasks
                    </h2>
                    <button className="btn-primary btn-sm">
                      Add Task
                    </button>
                  </div>
                  <div className="space-y-4">
                    <p className="text-text-secondary text-sm">No upcoming tasks to display</p>
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-xl font-semibold text-text-primary mb-4">
                    Budget Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Total Budget</span>
                      <span className="text-primary font-semibold">{formatCurrency(dashboardData?.total_expenses || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Spent</span>
                      <span className="text-primary font-semibold">{formatCurrency(dashboardData?.paid_expenses || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Remaining</span>
                      <span className="text-primary font-semibold">{formatCurrency((dashboardData?.total_expenses || 0) - (dashboardData?.paid_expenses || 0))}</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${calculateBudgetPercentage()}%` }}></div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-xl font-semibold text-text-primary mb-4">
                    Vendor Status
                  </h3>
                  <div className="space-y-3">
                    {vendors.slice(0, 4).map((vendor, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-text-secondary">{vendor.vendor_catalog?.name || `Vendor ${i + 1}`}</span>
                        <span className="text-primary text-sm">{vendor.status.name}</span>
                      </div>
                    ))}
                    {vendors.length === 0 && (
                      <p className="text-text-secondary text-sm">No vendors added yet</p>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-xl font-semibold text-text-primary mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <button className="w-full btn-secondary">
                      Add Guest
                    </button>
                    <button className="w-full btn-secondary">
                      Log Expense
                    </button>
                    <button className="w-full btn-secondary">
                      Contact Vendor
                    </button>
                    <button className="w-full btn-secondary">
                      Update Timeline
                    </button>
                    <button
                      onClick={handleGenerateFakeData}
                      disabled={isGeneratingData}
                      className="w-full btn-secondary text-yellow-400 hover:text-yellow-300"
                    >
                      {isGeneratingData ? 'Generating...' : 'Generate Fake Data'}
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1.1 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-xl font-semibold text-text-primary mb-4">
                    Wedding Website
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-surface rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-text-secondary">Site</span>
                      </div>
                      <p className="text-text-secondary text-sm mb-4">
                        saanjh-wedding.com
                      </p>
                      <button className="btn-primary w-full">
                        View Website
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </>

        </div>
      )}

      {/* First Time Modal */}
      <FirstTimeModal
        isOpen={showModal}
        onClose={handleModalClose}
        isEditMode={!showFirstTimeModal}
        wedding={wedding}
        onSave={handleWeddingUpdate}
      />
    </>
  );
}
