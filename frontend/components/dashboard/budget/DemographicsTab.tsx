'use client';

import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { BudgetCategory } from './types';
import { formatCurrency, getCardStyle } from './utils';

interface DemographicsTabProps {
  categories: BudgetCategory[];
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  allocated: number;
}

export default function DemographicsTab({ categories }: DemographicsTabProps) {
  const chartData: ChartDataItem[] = categories
    .map(cat => ({
      name: cat.name,
      value: cat.expenses.reduce((sum, exp) => sum + exp.amount, 0),
      color: cat.color,
      allocated: cat.allocated
    }))
    .filter(d => d.value > 0);

  const totalSpent = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Pie Chart Card */}
      <div className="p-6" style={getCardStyle()}>
        <h2 className="text-lg font-semibold mb-6 text-text-primary">Expense Distribution</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1e23',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#f5f5f0'
                  }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  wrapperStyle={{ color: '#d4d4d0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Percentage Breakdown */}
          <div className="space-y-3">
            {chartData.map((item) => {
              const percentage = ((item.value / totalSpent) * 100).toFixed(1);
              return (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-surface/30">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-text-primary">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text-primary">{formatCurrency(item.value)}</p>
                    <p className="text-sm text-text-muted">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bar Chart Card */}
      <div className="p-6" style={getCardStyle()}>
        <h2 className="text-lg font-semibold mb-6 text-text-primary">Category Comparison</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
                stroke="#9b9b95"
                tick={{ fill: '#9b9b95', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#9b9b95"
                tick={{ fill: '#9b9b95', fontSize: 12 }}
                tickFormatter={(value) => `₹${(Number(value) / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e1e23',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#f5f5f0'
                }}
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
