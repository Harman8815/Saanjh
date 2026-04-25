'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { WeddingService } from '../../services/weddings';
import { GuestService } from '../../services/guests';
import { ExpenseService } from '../../services/expenses';
import { VendorService } from '../../services/vendors';
import { TimelineService } from '../../services/timeline';
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
  
  // Data state
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [dashboardData, setDashboardData] = useState<WeddingDashboard | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Mock data for placeholder sections
  const mockData = {
    activities: [
      { activity: 'Guest RSVP received', description: 'John Smith confirmed attendance', time: '2 hours ago' },
      { activity: 'Vendor payment made', description: 'Catering deposit paid', time: '1 day ago' },
      { activity: 'Timeline updated', description: 'Added rehearsal dinner details', time: '2 days ago' },
    ],
    upcomingTasks: [
      { task: 'Send final invitations', description: 'To all pending guests', due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
      { task: 'Confirm catering menu', description: 'Finalize dietary restrictions', due: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() },
      { task: 'Book florist', description: 'Select floral arrangements', due: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString() },
    ]
  };

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

          {/* View Toggle Segmented Control */}
          <div className="flex justify-center mb-8 px-4">
            <div className="inline-flex bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-1 shadow-lg max-w-full overflow-hidden">
              <button
                onClick={() => setActiveView('table')}
                className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 transform min-w-0 flex-shrink-0 ${
                  activeView === 'table'
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 scale-105'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <span className="hidden xs:inline">Table</span>
                <span className="xs:hidden">Tbl</span>
              </button>
              <button
                onClick={() => setActiveView('card')}
                className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 transform min-w-0 flex-shrink-0 ${
                  activeView === 'card'
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 scale-105'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <span className="hidden xs:inline">Card</span>
                <span className="xs:hidden">Crd</span>
              </button>
              <button
                onClick={() => setActiveView('graph')}
                className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 transform min-w-0 flex-shrink-0 ${
                  activeView === 'graph'
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 scale-105'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <span className="hidden xs:inline">Graph</span>
                <span className="xs:hidden">Grph</span>
              </button>
            </div>
          </div>

          {/* Combined Action Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-surface border border-white/20 rounded-lg p-1 flex gap-1">
              <button
                onClick={() => setActiveAction('guest')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                  activeAction === 'guest'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Add Guest
              </button>
              <button
                onClick={() => setActiveAction('expense')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                  activeAction === 'expense'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Log Expense
              </button>
              <button
                onClick={() => setActiveAction('vendor')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                  activeAction === 'vendor'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Contact Vendor
              </button>
            </div>
          </div>

          {/* Action Content */}
          {activeAction === 'guest' && (
            <div className="mb-6 text-center">
              <p className="text-text-secondary">Ready to add a new guest to your wedding list?</p>
            </div>
          )}
          {activeAction === 'expense' && (
            <div className="mb-6 text-center">
              <p className="text-text-secondary">Track your wedding expenses and budget</p>
            </div>
          )}
          {activeAction === 'vendor' && (
            <div className="mb-6 text-center">
              <p className="text-text-secondary">Manage vendor communications and bookings</p>
            </div>
          )}


          {activeView === 'table' ? (
            <>
              {/* Table Cards View - Wedding Overview Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                      {mockData.activities.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 pb-4 border-b border-white/10">
                          <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center">
                            <span className="text-text-secondary text-xs">✓</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-text-primary">{item.activity}</p>
                            <p className="text-text-secondary text-sm">{item.description}</p>
                          </div>
                          <span className="text-text-secondary text-xs">{item.time}</span>
                        </div>
                      ))}
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
                      {mockData.upcomingTasks.map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <input type="checkbox" className="toggle" />
                          <div className="flex-1">
                            <h4 className="text-text-primary">{item.task}</h4>
                            <p className="text-text-secondary text-sm">{item.description}</p>
                          </div>
                          <span className="text-primary text-sm">{formatDateForDisplay(new Date(item.due))}</span>
                        </div>
                      ))}
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
          ) : activeView === 'card' ? (
            <>
              {/* Card View */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="glass-card p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-lg">{i}</span>
                      </div>
                      <span className="text-xs text-text-secondary bg-white/10 px-2 py-1 rounded-full">Card {i}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Guest Card {i}</h3>
                    <p className="text-text-secondary text-sm mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.</p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary text-sm font-medium">View Details</span>
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors duration-300">
                        <span className="text-primary text-xs">&rarr;</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Graphs View */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Budget Progress Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-xl font-semibold text-text-primary mb-4">
                    Budget Progress
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Total Budget</span>
                      <span className="text-primary font-semibold">{formatCurrency(dashboardData?.total_expenses || 0)}</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary/80 h-4 rounded-full transition-all duration-500" 
                        style={{ width: '65%' }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Spent</span>
                      <span className="text-primary font-semibold">{formatCurrency(dashboardData?.paid_expenses || 0)}</span>
                    </div>
                  </div>
                </motion.div>

                {/* RSVP Status Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-xl font-semibold text-text-primary mb-4">
                    RSVP Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-text-secondary flex-1">Confirmed</span>
                      <span className="text-primary font-semibold">45</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <span className="text-text-secondary flex-1">Pending</span>
                      <span className="text-primary font-semibold">30</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-text-secondary flex-1">Declined</span>
                      <span className="text-primary font-semibold">5</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Timeline Progress Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="glass-card p-6 mb-8"
              >
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Wedding Planning Progress
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Venue Booking', progress: 100, color: 'bg-green-500' },
                    { name: 'Catering', progress: 80, color: 'bg-blue-500' },
                    { name: 'Photography', progress: 60, color: 'bg-purple-500' },
                    { name: 'Flowers & Decor', progress: 40, color: 'bg-pink-500' },
                    { name: 'Music/Entertainment', progress: 20, color: 'bg-yellow-500' }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">{item.name}</span>
                        <span className="text-primary font-semibold">{item.progress}%</span>
                      </div>
                      <div className="w-full bg-surface rounded-full h-2">
                        <div 
                          className={`${item.color} h-2 rounded-full transition-all duration-500`} 
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Task Completion Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Task Completion Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-2">24</div>
                    <p className="text-text-secondary text-sm">Completed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500 mb-2">8</div>
                    <p className="text-text-secondary text-sm">In Progress</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-500 mb-2">12</div>
                    <p className="text-text-secondary text-sm">Pending</p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
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
