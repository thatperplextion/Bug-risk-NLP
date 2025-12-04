import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getSmells } from '../services/api'
import { GlassCard, StatCard, Loader } from '../components/ui'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'

const COLORS = ['#ef4444', '#f97316', '#eab308', '#a855f7', '#06b6d4', '#ec4899', '#22c55e', '#3b82f6']

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 border border-white/20">
        <p className="text-sm text-gray-300">{payload[0].name || payload[0].payload?.name}</p>
        <p className="text-lg font-bold text-cyan-400">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

export default function CodeSmells({ projectId, onFileSelect }) {
  const [smells, setSmells] = useState([])
  const [smellTypes, setSmellTypes] = useState([])
  const [stats, setStats] = useState({ total: 0, affectedFiles: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (projectId && projectId !== 'demo') {
      loadSmells(projectId)
    }
  }, [projectId])

  const loadSmells = async (pid) => {
    setLoading(true)
    try {
      const data = await getSmells(pid)
      console.log('CodeSmells loaded:', data)
      setSmells(data.items || [])
      setStats({
        total: data.total || 0,
        affectedFiles: data.affected_files || 0
      })
      // Add colors to smell types
      const typesWithColors = (data.types || []).map((t, i) => ({
        ...t,
        color: COLORS[i % COLORS.length]
      }))
      setSmellTypes(typesWithColors)
    } catch (err) {
      console.error('Failed to load smells:', err)
    }
    setLoading(false)
  }

  const criticalCount = smells.filter(s => s.severity >= 4).length
  const avgSeverity = smells.length > 0 
    ? (smells.reduce((acc, s) => acc + (s.severity || 0), 0) / smells.length).toFixed(1)
    : '0.0'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    )
  }

  // Empty state
  if (!projectId || smells.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="text-center py-4">
          <h1 className="text-4xl font-black gradient-text glow-text mb-2">Code Smell Analysis</h1>
          <p className="text-gray-400">Detected patterns that may indicate deeper problems</p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="text-8xl mb-6 animate-float">🧪</div>
          <h2 className="text-2xl font-bold text-gray-300 mb-2">No Smells Detected</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            {projectId 
              ? "Great! No code smells were found in this project."
              : "Scan a repository from the Overview page to analyze code smells."}
          </p>
        </motion.div>
      </motion.div>
    )
  }

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
        <StatCard label="Total Smells" value={stats.total} icon="🧪" color="purple" delay={0.1} />
        <StatCard label="Critical (4-5)" value={criticalCount} icon="🔥" color="red" delay={0.2} />
        <StatCard label="Avg Severity" value={avgSeverity} icon="📊" color="orange" delay={0.3} />
        <StatCard label="Files Affected" value={stats.affectedFiles} icon="📁" color="blue" delay={0.4} />
      </div>

      {smellTypes.length > 0 && (
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
                    data={smellTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {smellTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {smellTypes.map((s, i) => (
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
              <span className="text-2xl">⚠️</span> By Type
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={smellTypes} layout="vertical" barSize={20}>
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {smellTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      )}

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
              {smells.map((smell, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.02 * i }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <span className="text-cyan-400">📄</span>
                    <span className="ml-2 text-gray-200">{smell.file_path || smell.path}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300">
                      {smell.type}
                    </span>
                  </td>
                  <td className="text-center py-4 px-4 font-mono text-gray-400">{smell.line || '-'}</td>
                  <td className="py-4 px-4 text-gray-400 text-sm">{smell.message || '-'}</td>
                  <td className="text-center py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      (smell.severity || 0) >= 4 ? 'bg-red-500/20 text-red-400' :
                      (smell.severity || 0) >= 3 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {smell.severity || 0}/5
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
