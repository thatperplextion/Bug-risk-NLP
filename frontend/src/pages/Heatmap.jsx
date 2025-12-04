import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { getRisks } from '../services/api'
import { GlassCard, RiskBadge, Loader } from '../components/ui'

function getRiskColor(risk) {
  if (risk >= 80) return 'from-red-600 to-red-500'
  if (risk >= 60) return 'from-orange-600 to-orange-500'
  if (risk >= 40) return 'from-yellow-600 to-yellow-500'
  return 'from-emerald-600 to-emerald-500'
}

function getRiskBgColor(risk) {
  if (risk >= 80) return 'bg-red-500/20 border-red-500/30'
  if (risk >= 60) return 'bg-orange-500/20 border-orange-500/30'
  if (risk >= 40) return 'bg-yellow-500/20 border-yellow-500/30'
  return 'bg-emerald-500/20 border-emerald-500/30'
}

function getTier(risk) {
  if (risk >= 80) return 'Critical'
  if (risk >= 60) return 'High'
  if (risk >= 40) return 'Medium'
  return 'Low'
}

export default function Heatmap({ projectId }) {
  const [risks, setRisks] = useState([])
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (projectId) {
      loadRisks()
    }
  }, [projectId])

  const loadRisks = async () => {
    setLoading(true)
    try {
      const data = await getRisks(projectId, null, 100)
      setRisks(data.items || [])
    } catch (err) {
      console.error('Failed to load risks:', err)
    }
    setLoading(false)
  }

  // Build folder structure from risks
  const heatmapData = useMemo(() => {
    const folders = {}
    
    risks.forEach(risk => {
      const path = risk.path || ''
      const parts = path.split('/')
      const fileName = parts.pop()
      const folderPath = parts.join('/') || 'root'
      
      if (!folders[folderPath]) {
        folders[folderPath] = {
          risk: 0,
          children: {}
        }
      }
      
      folders[folderPath].children[fileName] = {
        risk: risk.risk_score || 0,
        tier: risk.tier || getTier(risk.risk_score || 0),
        loc: risk.loc || 0,
        path: risk.path
      }
    })
    
    // Calculate folder average risks
    Object.keys(folders).forEach(folder => {
      const children = Object.values(folders[folder].children)
      if (children.length > 0) {
        folders[folder].risk = Math.round(
          children.reduce((acc, c) => acc + c.risk, 0) / children.length
        )
      }
    })
    
    return folders
  }, [risks])

  const folders = Object.entries(heatmapData)
  const maxRisk = folders.length > 0 ? Math.max(...folders.map(([, data]) => data.risk), 1) : 1

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    )
  }

  // Empty state
  if (!projectId || risks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="text-center py-4">
          <h1 className="text-4xl font-black gradient-text glow-text mb-2">Risk Heatmap</h1>
          <p className="text-gray-400">Visual overview of risk distribution across folders</p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="text-8xl mb-6 animate-float">🗺️</div>
          <h2 className="text-2xl font-bold text-gray-300 mb-2">No Risk Data</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            {projectId 
              ? "No risk data available for this project yet."
              : "Scan a repository from the Overview page to see the risk heatmap."}
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
        <h1 className="text-4xl font-black gradient-text glow-text mb-2">Risk Heatmap</h1>
        <p className="text-gray-400">Visual overview of risk distribution across folders</p>
      </div>

      {/* Heatmap Grid */}
      <GlassCard delay={0.1}>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="text-2xl">🗺️</span> Folder Risk Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {folders.map(([folder, data], i) => {
            const heightPct = Math.max(30, (data.risk / maxRisk) * 100)
            return (
              <motion.div
                key={folder}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => setSelectedFolder(selectedFolder === folder ? null : folder)}
                className={`relative cursor-pointer rounded-xl border p-4 transition-all ${
                  selectedFolder === folder ? 'ring-2 ring-cyan-500' : ''
                } ${getRiskBgColor(data.risk)}`}
                style={{ minHeight: `${heightPct + 80}px` }}
              >
                <div className="absolute inset-x-0 bottom-0 rounded-b-xl overflow-hidden">
                  <div
                    className={`bg-gradient-to-t ${getRiskColor(data.risk)} opacity-30`}
                    style={{ height: `${heightPct}%` }}
                  ></div>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📁</span>
                    <span className="font-semibold text-white truncate">{folder}</span>
                  </div>
                  <p className="text-3xl font-black text-white">{data.risk}</p>
                  <p className="text-xs text-gray-400">{Object.keys(data.children).length} files</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </GlassCard>

      {/* Selected Folder Details */}
      {selectedFolder && heatmapData[selectedFolder] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard delay={0}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">📂</span> {selectedFolder}
              </h2>
              <button
                onClick={() => setSelectedFolder(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕ Close
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(heatmapData[selectedFolder].children).map(([file, data], i) => (
                <motion.div
                  key={file}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`p-4 rounded-xl border ${getRiskBgColor(data.risk)} hover:bg-white/10 transition-colors cursor-pointer`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">📄</span>
                      <span className="font-medium text-white">{file}</span>
                    </div>
                    <RiskBadge tier={data.tier} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Risk: <span className="font-bold text-white">{data.risk}</span></span>
                    <span className="text-gray-400">LOC: <span className="text-gray-300">{data.loc}</span></span>
                  </div>
                  {/* Risk bar */}
                  <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data.risk}%` }}
                      transition={{ duration: 0.5, delay: 0.1 * i }}
                      className={`h-full bg-gradient-to-r ${getRiskColor(data.risk)}`}
                    ></motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Legend */}
      <GlassCard delay={0.3}>
        <h2 className="text-lg font-bold mb-4">Risk Legend</h2>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-red-600 to-red-500"></div>
            <span className="text-gray-300">Critical (80-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-orange-600 to-orange-500"></div>
            <span className="text-gray-300">High (60-79)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-yellow-600 to-yellow-500"></div>
            <span className="text-gray-300">Medium (40-59)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-emerald-600 to-emerald-500"></div>
            <span className="text-gray-300">Low (0-39)</span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
