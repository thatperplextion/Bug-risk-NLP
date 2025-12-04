import React from 'react'
import { motion } from 'framer-motion'
import { GlassCard, StatCard, RiskBadge } from '../components/ui'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'

const SMELL_TYPES = [
  { name: 'Long Function', count: 12, severity: 4, color: '#ef4444' },
  { name: 'High Complexity', count: 8, severity: 5, color: '#f97316' },
  { name: 'Deep Nesting', count: 6, severity: 3, color: '#eab308' },
  { name: 'Duplicate Code', count: 4, severity: 3, color: '#a855f7' },
  { name: 'Naming Issues', count: 15, severity: 2, color: '#06b6d4' },
  { name: 'Hard-coded Values', count: 3, severity: 4, color: '#ec4899' }
]

const SMELL_LIST = [
  { path: 'src/auth.py', type: 'Long Function', severity: 5, line: 45, message: 'authenticate() exceeds 80 lines' },
  { path: 'src/auth.py', type: 'Hard-coded Values', severity: 4, line: 88, message: 'Possible API key detected' },
  { path: 'src/utils.py', type: 'High Complexity', severity: 4, line: 12, message: 'Cyclomatic complexity of 15' },
  { path: 'src/utils.py', type: 'Deep Nesting', severity: 3, line: 34, message: '5 levels of nesting' },
  { path: 'src/api/handler.py', type: 'Duplicate Code', severity: 3, line: 100, message: '12 similar lines detected' },
  { path: 'src/models/user.py', type: 'Naming Issues', severity: 2, line: 5, message: 'Variable x is not descriptive' }
]

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 border border-white/20">
        <p className="text-sm text-gray-300">{payload[0].name}</p>
        <p className="text-lg font-bold text-cyan-400">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

export default function CodeSmells() {
  const totalSmells = SMELL_TYPES.reduce((acc, s) => acc + s.count, 0)
  const criticalCount = SMELL_LIST.filter(s => s.severity >= 4).length
  const avgSeverity = (SMELL_LIST.reduce((acc, s) => acc + s.severity, 0) / SMELL_LIST.length).toFixed(1)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-4xl font-black gradient-text glow-text mb-2">Code Smell Analysis</h1>
        <p className="text-gray-400">Detected patterns that may indicate deeper problems</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Smells" value={totalSmells} icon="🧪" color="purple" delay={0.1} />
        <StatCard label="Critical (4-5)" value={criticalCount} icon="🔥" color="red" delay={0.2} />
        <StatCard label="Avg Severity" value={avgSeverity} icon="📊" color="orange" delay={0.3} />
        <StatCard label="Files Affected" value={4} icon="📁" color="blue" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smell Distribution Pie */}
        <GlassCard delay={0.2}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span> Smell Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SMELL_TYPES}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {SMELL_TYPES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {SMELL_TYPES.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></span>
                <span className="text-gray-400">{s.name}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Severity Breakdown */}
        <GlassCard delay={0.3}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">⚠️</span> By Severity
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SMELL_TYPES} layout="vertical" barSize={20}>
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {SMELL_TYPES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Smell List */}
      <GlassCard delay={0.4}>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="text-2xl">📋</span> All Detected Smells
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-gray-400 font-medium">File</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Type</th>
                <th className="text-center py-4 px-4 text-gray-400 font-medium">Line</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Message</th>
                <th className="text-center py-4 px-4 text-gray-400 font-medium">Severity</th>
              </tr>
            </thead>
            <tbody>
              {SMELL_LIST.map((smell, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <span className="text-cyan-400">📄</span>
                    <span className="ml-2 text-gray-200">{smell.path}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300">
                      {smell.type}
                    </span>
                  </td>
                  <td className="text-center py-4 px-4 font-mono text-gray-400">{smell.line}</td>
                  <td className="py-4 px-4 text-gray-400 text-sm">{smell.message}</td>
                  <td className="text-center py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      smell.severity >= 4 ? 'bg-red-500/20 text-red-400' :
                      smell.severity >= 3 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {smell.severity}/5
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.div>
  )
}
