import React, { useState } from 'react'
import { getMetrics, getRisks, queueGithubRepo, startScan } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6']

export default function Overview(){
  const [projectId, setProjectId] = useState('demo')
  const [metrics, setMetrics] = useState([])
  const [risks, setRisks] = useState([])
  const [summary, setSummary] = useState({avg_risk:0, high:0, critical:0})
  const [sourceRef, setSourceRef] = useState('https://github.com/org/repo')
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const m = await getMetrics(projectId, 50, 'cyclomatic_max:-1')
    const r = await getRisks(projectId, undefined, 10)
    setMetrics(m.metrics || [])
    setRisks(r.items || [])
    setSummary(r.summary || {avg_risk:0, high:0, critical:0})
    setLoading(false)
  }

  const queueAndScan = async () => {
    const queued = await queueGithubRepo(sourceRef)
    if(queued.project_id){
      setProjectId(queued.project_id)
      await startScan(queued.project_id)
    }
  }

  const riskByFolder = risks.map(r => ({ folder: r.path.split('/').slice(0,-1).join('/') || '/', risk: r.risk_score }))
  const smellDistribution = [
    { name: 'Critical', value: summary.critical || 0 },
    { name: 'High', value: summary.high || 0 },
    { name: 'Other', value: (risks.length - ((summary.critical||0)+(summary.high||0))) }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input className="border px-2 py-1 w-96" value={sourceRef} onChange={e=>setSourceRef(e.target.value)} placeholder="GitHub URL" />
        <button onClick={queueAndScan} className="bg-blue-600 text-white px-3 py-1 rounded">Queue & Scan</button>
        <button onClick={loadData} className="bg-gray-800 text-white px-3 py-1 rounded">Load Data</button>
        <span className="text-sm text-gray-600">Project: {projectId}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Top 10 Risky Files</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={risks}>
              <XAxis dataKey="path" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="risk_score" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Risk-by-folder</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={riskByFolder}>
              <XAxis dataKey="folder" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="risk" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Smell distribution (approx)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={smellDistribution} dataKey="value" nameKey="name" outerRadius={100}>
                {smellDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Complexity (cyclomatic_max)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={metrics}>
              <XAxis dataKey="path" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cyclomatic_max" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading...</div>}

      <div className="p-4 border rounded">
        <h2 className="font-semibold mb-2">Metrics Table</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Path</th>
              <th className="p-2">LOC</th>
              <th className="p-2">Cyclomatic Max</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m,i)=> (
              <tr key={i} className="border-t">
                <td className="p-2">{m.path}</td>
                <td className="p-2">{m.loc}</td>
                <td className="p-2">{m.cyclomatic_max}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
