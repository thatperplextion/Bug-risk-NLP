import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getSuggestions } from '../services/api'
import { GlassCard, GradientButton, RiskBadge, Loader } from '../components/ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 border border-white/20">
        <p className="text-sm text-gray-300">{payload[0].payload.feature}</p>
        <p className="text-lg font-bold text-cyan-400">{payload[0].value.toFixed(3)}</p>
      </div>
    )
  }
  return null
}

export default function FileDetail({ file, onBack }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await getSuggestions(file.path.replace(/\//g, '_'), 5)
      setSuggestions(data.suggestions || [])
      setLoading(false)
    }
    load()
  }, [file])

  // Mock SHAP values for demonstration
  const shapValues = [
    { feature: 'cyclomatic_max', value: 0.23 },
    { feature: 'churn_30d', value: 0.18 },
    { feature: 'dup_ratio', value: 0.12 },
    { feature: 'nesting_max', value: 0.09 },
    { feature: 'loc', value: 0.07 }
  ]

  const priorityColors = {
    High: 'border-red-500/30 bg-red-500/10',
    Medium: 'border-yellow-500/30 bg-yellow-500/10',
    Low: 'border-emerald-500/30 bg-emerald-500/10'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <GradientButton onClick={onBack} variant="secondary" size="sm">
            ← Back
          </GradientButton>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400">📄</span>
              {file.path}
            </h1>
            <p className="text-gray-400 text-sm mt-1">Detailed risk analysis and refactoring suggestions</p>
          </div>
        </div>
        <RiskBadge tier={file.tier || 'Medium'} />
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard delay={0.1} className="text-center">
          <p className="text-gray-400 text-sm">Risk Score</p>
          <p className="text-3xl font-bold text-red-400">{file.risk_score || 65}</p>
        </GlassCard>
        <GlassCard delay={0.2} className="text-center">
          <p className="text-gray-400 text-sm">Lines of Code</p>
          <p className="text-3xl font-bold text-cyan-400">{file.loc || 420}</p>
        </GlassCard>
        <GlassCard delay={0.3} className="text-center">
          <p className="text-gray-400 text-sm">Complexity</p>
          <p className="text-3xl font-bold text-orange-400">{file.cyclomatic_max || 14}</p>
        </GlassCard>
        <GlassCard delay={0.4} className="text-center">
          <p className="text-gray-400 text-sm">Functions</p>
          <p className="text-3xl font-bold text-emerald-400">{file.fn_count || 19}</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHAP Feature Importance */}
        <GlassCard delay={0.3}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span> Risk Attribution (SHAP)
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Top factors contributing to this file's risk score
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shapValues} layout="vertical" barSize={24}>
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="feature" type="category" width={100} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="url(#shapGradient)" />
                <defs>
                  <linearGradient id="shapGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Code Smells Detected */}
        <GlassCard delay={0.4}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">🧪</span> Detected Issues
          </h2>
          <div className="space-y-3">
            {[
              { type: 'Long Function', severity: 4, line: 45, message: 'Function exceeds 50 lines' },
              { type: 'High Complexity', severity: 5, line: 88, message: 'Cyclomatic complexity > 10' },
              { type: 'Deep Nesting', severity: 3, line: 102, message: 'Nesting depth exceeds 4 levels' }
            ].map((smell, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${smell.severity >= 4 ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                  <div>
                    <p className="font-medium text-white">{smell.type}</p>
                    <p className="text-sm text-gray-400">Line {smell.line}: {smell.message}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">Severity {smell.severity}/5</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Refactoring Suggestions */}
      <GlassCard delay={0.5}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span> AI Refactoring Suggestions
        </h2>
        {loading ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            {suggestions.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`p-4 rounded-xl border ${priorityColors[s.priority] || priorityColors.Medium}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">{s.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        s.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                        s.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {s.priority}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{s.rationale}</p>
                    <code className="block p-3 rounded-lg bg-gray-900/50 text-cyan-400 text-sm font-mono">
                      {s.snippet}
                    </code>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-white">{s.est_hours}h</p>
                    <p className="text-xs text-gray-500">Est. effort</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}
