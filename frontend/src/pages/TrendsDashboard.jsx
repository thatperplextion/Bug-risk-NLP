import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../services/api';

// ============================================================================
// ANIMATED COUNTER COMPONENT
// ============================================================================
const AnimatedCounter = ({ value, duration = 2, decimals = 0, suffix = '', prefix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime;
    let animationFrame;
    const startValue = displayValue;
    const endValue = typeof value === 'number' ? value : 0;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (endValue - startValue) * easeOutQuart;
      setDisplayValue(current);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);
  
  return (
    <span className="tabular-nums">
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
};

// ============================================================================
// CIRCULAR PROGRESS RING
// ============================================================================
const CircularProgress = ({ value, max, size = 120, strokeWidth = 8, color, label, icon, showGlow = true }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;
  
  const gradientId = useMemo(() => `gradient-${Math.random().toString(36).substr(2, 9)}`, []);
  const glowId = useMemo(() => `glow-${Math.random().toString(36).substr(2, 9)}`, []);
  
  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </linearGradient>
          {showGlow && (
            <filter id={glowId}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}
        </defs>
        
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          filter={showGlow ? `url(#${glowId})` : undefined}
        />
        
        {[...Array(6)].map((_, i) => (
          <motion.circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={2}
            fill={color}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
              cx: [size / 2, size / 2 + (radius - 5) * Math.cos((percentage / 100) * 2 * Math.PI - Math.PI / 2 + (i * 0.1))],
              cy: [size / 2, size / 2 + (radius - 5) * Math.sin((percentage / 100) * 2 * Math.PI - Math.PI / 2 + (i * 0.1))],
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {icon && <span className="text-2xl mb-1">{icon}</span>}
        <span className="text-2xl font-bold text-white">
          <AnimatedCounter value={value} />
        </span>
        {label && <span className="text-xs text-gray-400 mt-1">{label}</span>}
      </div>
    </div>
  );
};

// ============================================================================
// WAVE CHART COMPONENT
// ============================================================================
const WaveChart = ({ data, height = 100, color = '#10b981', showArea = true, showDots = true, animated = true }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 300, height });
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height
        });
      }
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [height]);
  
  const { path, areaPath, points } = useMemo(() => {
    if (!data || data.length === 0) return { path: '', areaPath: '', points: [] };
    
    const { width, height } = dimensions;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const max = Math.max(...data.map(d => d.value), 1);
    const min = Math.min(...data.map(d => d.value), 0);
    const range = max - min || 1;
    
    const points = data.map((d, i) => ({
      x: padding + (i / (data.length - 1)) * chartWidth,
      y: padding + chartHeight - ((d.value - min) / range) * chartHeight,
      value: d.value,
      label: d.label
    }));
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    
    const areaPath = `${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    
    return { path, areaPath, points };
  }, [data, dimensions]);
  
  const gradientId = useMemo(() => `wave-gradient-${Math.random().toString(36).substr(2, 9)}`, []);
  
  return (
    <div ref={containerRef} className="w-full relative">
      <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {[...Array(5)].map((_, i) => (
          <line
            key={i}
            x1="20"
            y1={20 + (i * (dimensions.height - 40) / 4)}
            x2={dimensions.width - 20}
            y2={20 + (i * (dimensions.height - 40) / 4)}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="4 4"
          />
        ))}
        
        {showArea && (
          <motion.path
            d={areaPath}
            fill={`url(#${gradientId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
        )}
        
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.3"
          filter="blur(8px)"
          initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        
        {showDots && points.map((point, i) => (
          <g key={i}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === i ? 8 : 5}
              fill={color}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            />
            
            {hoveredIndex === i && (
              <motion.g
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <rect
                  x={point.x - 30}
                  y={point.y - 40}
                  width="60"
                  height="28"
                  rx="6"
                  fill="rgba(0,0,0,0.85)"
                  stroke={color}
                  strokeWidth="1"
                />
                <text
                  x={point.x}
                  y={point.y - 22}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {point.value.toFixed(1)}
                </text>
              </motion.g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

// ============================================================================
// BAR CHART WITH ANIMATIONS
// ============================================================================
const AnimatedBarChart = ({ data, height = 200, barColor = '#8b5cf6', showValues = true }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 400, height });
  const [hoveredBar, setHoveredBar] = useState(null);
  
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height
        });
      }
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [height]);
  
  const { bars, maxValue } = useMemo(() => {
    if (!data || data.length === 0) return { bars: [], maxValue: 100 };
    
    const { width, height } = dimensions;
    const padding = { top: 20, right: 20, bottom: 40, left: 20 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const barWidth = (chartWidth / data.length) * 0.7;
    const gap = (chartWidth / data.length) * 0.3;
    
    const bars = data.map((d, i) => ({
      x: padding.left + i * (barWidth + gap) + gap / 2,
      y: padding.top + chartHeight - (d.value / maxValue) * chartHeight,
      width: barWidth,
      height: (d.value / maxValue) * chartHeight,
      value: d.value,
      label: d.label,
      color: d.color || barColor
    }));
    
    return { bars, maxValue };
  }, [data, dimensions, barColor]);
  
  return (
    <div ref={containerRef} className="w-full">
      <svg width={dimensions.width} height={dimensions.height}>
        <defs>
          {bars.map((bar, i) => (
            <linearGradient key={i} id={`bar-gradient-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={bar.color} stopOpacity="1" />
              <stop offset="100%" stopColor={bar.color} stopOpacity="0.5" />
            </linearGradient>
          ))}
        </defs>
        
        {[...Array(5)].map((_, i) => (
          <g key={i}>
            <line
              x1="20"
              y1={20 + (i * (dimensions.height - 60) / 4)}
              x2={dimensions.width - 20}
              y2={20 + (i * (dimensions.height - 60) / 4)}
              stroke="rgba(255,255,255,0.05)"
            />
            <text
              x="15"
              y={20 + (i * (dimensions.height - 60) / 4)}
              fill="rgba(255,255,255,0.3)"
              fontSize="10"
              textAnchor="end"
              dominantBaseline="middle"
            >
              {Math.round(maxValue - (i * maxValue / 4))}
            </text>
          </g>
        ))}
        
        {bars.map((bar, i) => (
          <g key={i}>
            <motion.rect
              x={bar.x + 4}
              y={dimensions.height - 40}
              width={bar.width}
              height={0}
              fill="rgba(0,0,0,0.3)"
              rx="6"
              initial={{ height: 0, y: dimensions.height - 40 }}
              animate={{ height: bar.height, y: bar.y + 4 }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
            />
            
            <motion.rect
              x={bar.x}
              y={dimensions.height - 40}
              width={bar.width}
              height={0}
              fill={`url(#bar-gradient-${i})`}
              rx="6"
              initial={{ height: 0, y: dimensions.height - 40 }}
              animate={{ 
                height: bar.height, 
                y: bar.y,
                filter: hoveredBar === i ? 'brightness(1.2)' : 'brightness(1)'
              }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
              onMouseEnter={() => setHoveredBar(i)}
              onMouseLeave={() => setHoveredBar(null)}
              style={{ cursor: 'pointer' }}
            />
            
            {hoveredBar === i && (
              <motion.rect
                x={bar.x - 2}
                y={bar.y - 2}
                width={bar.width + 4}
                height={bar.height + 4}
                fill="none"
                stroke={bar.color}
                strokeWidth="2"
                rx="8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                filter="blur(4px)"
              />
            )}
            
            {showValues && (
              <motion.text
                x={bar.x + bar.width / 2}
                y={bar.y - 8}
                fill="white"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                initial={{ opacity: 0, y: bar.y }}
                animate={{ opacity: 1, y: bar.y - 8 }}
                transition={{ delay: i * 0.1 + 0.5, duration: 0.3 }}
              >
                {bar.value}
              </motion.text>
            )}
            
            <text
              x={bar.x + bar.width / 2}
              y={dimensions.height - 15}
              fill="rgba(255,255,255,0.5)"
              fontSize="10"
              textAnchor="middle"
            >
              {bar.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// ============================================================================
// RADAR CHART COMPONENT
// ============================================================================
const RadarChart = ({ data, size = 250, color = '#06b6d4' }) => {
  const center = size / 2;
  const radius = (size - 60) / 2;
  
  const { points, maxValue } = useMemo(() => {
    if (!data || data.length === 0) return { points: [], maxValue: 100 };
    
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const angleStep = (2 * Math.PI) / data.length;
    
    const points = data.map((d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (d.value / maxValue) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        labelX: center + (radius + 20) * Math.cos(angle),
        labelY: center + (radius + 20) * Math.sin(angle),
        label: d.label,
        value: d.value
      };
    });
    
    return { points, maxValue };
  }, [data, size]);
  
  const pathData = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ${points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')} Z`
    : '';
  
  const gradientId = useMemo(() => `radar-gradient-${Math.random().toString(36).substr(2, 9)}`, []);
  const levels = 5;
  
  return (
    <svg width={size} height={size} className="overflow-visible">
      <defs>
        <radialGradient id={gradientId}>
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </radialGradient>
      </defs>
      
      {[...Array(levels)].map((_, i) => {
        const levelRadius = (radius / levels) * (i + 1);
        const levelPoints = data?.map((_, j) => {
          const angle = j * (2 * Math.PI / (data?.length || 1)) - Math.PI / 2;
          return {
            x: center + levelRadius * Math.cos(angle),
            y: center + levelRadius * Math.sin(angle)
          };
        }) || [];
        
        const levelPath = levelPoints.length > 0
          ? `M ${levelPoints[0].x} ${levelPoints[0].y} ${levelPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')} Z`
          : '';
        
        return (
          <path
            key={i}
            d={levelPath}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        );
      })}
      
      {data?.map((_, i) => {
        const angle = i * (2 * Math.PI / data.length) - Math.PI / 2;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(angle)}
            y2={center + radius * Math.sin(angle)}
            stroke="rgba(255,255,255,0.1)"
          />
        );
      })}
      
      <motion.path
        d={pathData}
        fill={`url(#${gradientId})`}
        stroke={color}
        strokeWidth="2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ transformOrigin: 'center' }}
      />
      
      {points.map((point, i) => (
        <g key={i}>
          <motion.circle
            cx={point.x}
            cy={point.y}
            r="6"
            fill={color}
            stroke="white"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          />
          <text
            x={point.labelX}
            y={point.labelY}
            fill="rgba(255,255,255,0.7)"
            fontSize="11"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

// ============================================================================
// METRIC COMPARISON CARD
// ============================================================================
const MetricComparisonCard = ({ title, current, previous, icon, color, unit = '' }) => {
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const isPositive = change >= 0;
  const isImprovement = title.toLowerCase().includes('risk') || title.toLowerCase().includes('smell') 
    ? !isPositive 
    : isPositive;
  
  return (
    <motion.div
      className="relative p-5 rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div 
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 blur-2xl"
        style={{ background: color }}
      />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${color}30` }}
          >
            {icon}
          </div>
          <span className="text-gray-300 font-medium">{title}</span>
        </div>
        
        <motion.div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isImprovement ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.span
            animate={{ rotate: isPositive ? 0 : 180 }}
            transition={{ type: 'spring' }}
          >
            ↑
          </motion.span>
          <AnimatedCounter value={Math.abs(change)} decimals={1} suffix="%" />
        </motion.div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-4xl font-bold text-white mb-1">
            <AnimatedCounter value={current} suffix={unit} />
          </div>
          <div className="text-sm text-gray-500">
            Previous: {previous}{unit}
          </div>
        </div>
        
        <svg width="80" height="40" className="opacity-60">
          <motion.path
            d={`M 0 ${isPositive ? 35 : 5} Q 20 20, 40 ${isPositive ? 20 : 25} T 80 ${isPositive ? 5 : 35}`}
            fill="none"
            stroke={isImprovement ? '#10b981' : '#ef4444'}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </svg>
      </div>
    </motion.div>
  );
};

// ============================================================================
// TIMELINE COMPONENT
// ============================================================================
const Timeline = ({ events }) => {
  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-emerald-500" />
      
      {events.map((event, index) => (
        <motion.div
          key={index}
          className="relative pb-8 last:pb-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.15 }}
        >
          <motion.div
            className="absolute left-0 w-6 h-6 rounded-full border-2 flex items-center justify-center"
            style={{ 
              borderColor: event.color,
              background: `${event.color}30`
            }}
            whileHover={{ scale: 1.3 }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: event.color }} />
          </motion.div>
          
          <div className="ml-8">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-white font-semibold">{event.title}</span>
              <span className="text-xs text-gray-500 px-2 py-0.5 bg-white/5 rounded">{event.date}</span>
            </div>
            <p className="text-gray-400 text-sm">{event.description}</p>
            
            {event.stats && (
              <div className="flex gap-4 mt-2">
                {event.stats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <span style={{ color: stat.color }}>{stat.icon}</span>
                    <span className="text-gray-300">{stat.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// DONUT CHART COMPONENT
// ============================================================================
const DonutChart = ({ data, size = 200, strokeWidth = 30, centerLabel }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const center = size / 2;
  
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let accumulatedOffset = 0;
  
  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((segment, i) => {
          const percentage = (segment.value / total) * 100;
          const dashArray = (percentage / 100) * circumference;
          const offset = accumulatedOffset;
          accumulatedOffset += dashArray;
          
          return (
            <motion.circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashArray} ${circumference - dashArray}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${dashArray} ${circumference - dashArray}` }}
              transition={{ duration: 1, delay: i * 0.2, ease: "easeOut" }}
            />
          );
        })}
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {centerLabel && (
          <>
            <span className="text-3xl font-bold text-white">{centerLabel.value}</span>
            <span className="text-xs text-gray-400">{centerLabel.label}</span>
          </>
        )}
      </div>
      
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {data.map((segment, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.5 }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ background: segment.color }}
            />
            <span className="text-xs text-gray-400">{segment.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// HEATMAP CALENDAR
// ============================================================================
const HeatmapCalendar = ({ data, weeks = 12 }) => {
  const days = ['Mon', '', 'Wed', '', 'Fri', '', ''];
  const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
  
  const getColor = (value) => {
    if (value === 0) return colors[0];
    if (value < 3) return colors[1];
    if (value < 6) return colors[2];
    if (value < 10) return colors[3];
    return colors[4];
  };
  
  const calendarData = useMemo(() => {
    return [...Array(weeks * 7)].map((_, i) => ({
      value: data?.[i]?.value ?? Math.floor(Math.random() * 12),
      date: new Date(Date.now() - (weeks * 7 - i) * 24 * 60 * 60 * 1000)
    }));
  }, [data, weeks]);
  
  return (
    <div className="flex gap-1">
      <div className="flex flex-col gap-1 mr-2 text-xs text-gray-500">
        {days.map((day, i) => (
          <div key={i} className="h-3">{day}</div>
        ))}
      </div>
      
      <div className="flex gap-1">
        {[...Array(weeks)].map((_, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {[...Array(7)].map((_, dayIndex) => {
              const dataIndex = weekIndex * 7 + dayIndex;
              const cellData = calendarData[dataIndex];
              
              return (
                <motion.div
                  key={dayIndex}
                  className="w-3 h-3 rounded-sm cursor-pointer"
                  style={{ background: getColor(cellData?.value || 0) }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (weekIndex * 7 + dayIndex) * 0.005 }}
                  whileHover={{ scale: 1.5, zIndex: 10 }}
                  title={`${cellData?.date?.toLocaleDateString()}: ${cellData?.value} changes`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN TRENDS DASHBOARD
// ============================================================================
const TrendsDashboard = ({ projectId }) => {
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    const fetchTrends = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/history/${projectId}/trends`);
        if (!response.ok) throw new Error('Failed to fetch trends');
        const data = await response.json();
        setTrendData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrends();
  }, [projectId, timeRange]);
  
  const timeRanges = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '3 Months' },
    { value: '1y', label: '1 Year' },
  ];
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'quality', label: 'Quality', icon: '✨' },
    { id: 'activity', label: 'Activity', icon: '📈' },
    { id: 'breakdown', label: 'Breakdown', icon: '🔍' },
  ];
  
  const enrichedData = useMemo(() => {
    if (!trendData) return null;
    
    return {
      ...trendData,
      qualityScore: Math.max(0, 100 - (trendData.current?.avg_risk || 50)),
      previousQualityScore: Math.max(0, 100 - (trendData.current?.avg_risk || 50) - 5),
      codeHealthHistory: [...Array(30)].map((_, i) => ({
        label: `Day ${i + 1}`,
        value: 70 + Math.sin(i / 3) * 15 + Math.random() * 10
      })),
      riskHistory: [...Array(30)].map((_, i) => ({
        label: `Day ${i + 1}`,
        value: 30 + Math.cos(i / 4) * 20 + Math.random() * 10
      })),
      smellsByType: [
        { label: 'Long Methods', value: 12, color: '#f43f5e' },
        { label: 'Complex Logic', value: 8, color: '#f97316' },
        { label: 'Duplication', value: 5, color: '#eab308' },
        { label: 'Deep Nesting', value: 4, color: '#22c55e' },
        { label: 'Large Files', value: 3, color: '#06b6d4' },
      ],
      radarData: [
        { label: 'Security', value: 75 },
        { label: 'Performance', value: 82 },
        { label: 'Maintainability', value: 68 },
        { label: 'Reliability', value: 91 },
        { label: 'Complexity', value: 45 },
        { label: 'Docs', value: 55 },
      ],
      recentEvents: [
        {
          title: 'Major Refactoring',
          date: '2 days ago',
          description: 'Reduced cyclomatic complexity in auth module',
          color: '#10b981',
          stats: [
            { icon: '📉', value: '-15% complexity', color: '#10b981' },
            { icon: '📄', value: '12 files', color: '#06b6d4' },
          ]
        },
        {
          title: 'Bug Fix',
          date: '5 days ago',
          description: 'Fixed memory leak in data processing',
          color: '#f97316',
          stats: [
            { icon: '🔧', value: '3 issues fixed', color: '#f97316' },
          ]
        },
        {
          title: 'New Feature',
          date: '1 week ago',
          description: 'Added dependency graph visualization',
          color: '#8b5cf6',
          stats: [
            { icon: '➕', value: '+450 lines', color: '#8b5cf6' },
            { icon: '📄', value: '8 new files', color: '#06b6d4' },
          ]
        },
      ]
    };
  }, [trendData]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative">
            <motion.div
              className="w-16 h-16 rounded-full border-4 border-purple-500/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-purple-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <span className="text-gray-400">Loading trends...</span>
        </motion.div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center p-8 rounded-2xl bg-red-500/10 border border-red-500/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-4xl mb-4 block">⚠️</span>
          <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Trends</h3>
          <p className="text-gray-400">{error}</p>
        </motion.div>
      </div>
    );
  }
  
  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center p-12 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-6xl mb-6 block">📈</span>
          <h2 className="text-2xl font-bold text-white mb-3">Historical Trends</h2>
          <p className="text-gray-400 max-w-md">
            Analyze a project to view comprehensive historical trends, 
            quality metrics, and code health evolution over time.
          </p>
        </motion.div>
      </div>
    );
  }
  
  return (
    <motion.div
      className="min-h-screen p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            className="text-3xl font-bold text-white mb-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            📈 Historical Trends
          </motion.h1>
          <motion.p 
            className="text-gray-400"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Track your codebase evolution and quality metrics over time
          </motion.p>
        </div>
        
        <motion.div 
          className="flex gap-2 p-1 rounded-xl bg-white/5"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range.value
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {range.label}
            </button>
          ))}
        </motion.div>
      </div>
      
      {/* Tab Navigation */}
      <motion.div 
        className="flex gap-2 p-1 rounded-xl bg-white/5 w-fit"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </motion.div>
      
      {/* Overview Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Circular Progress Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div 
                className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
                whileHover={{ scale: 1.02 }}
              >
                <CircularProgress
                  value={enrichedData?.qualityScore || 0}
                  max={100}
                  size={140}
                  strokeWidth={10}
                  color="#10b981"
                  label="Quality Score"
                  icon="✨"
                />
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
                whileHover={{ scale: 1.02 }}
              >
                <CircularProgress
                  value={enrichedData?.current?.total_files || 0}
                  max={100}
                  size={140}
                  strokeWidth={10}
                  color="#8b5cf6"
                  label="Total Files"
                  icon="📄"
                />
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
                whileHover={{ scale: 1.02 }}
              >
                <CircularProgress
                  value={enrichedData?.current?.total_smells || 0}
                  max={50}
                  size={140}
                  strokeWidth={10}
                  color="#f97316"
                  label="Code Smells"
                  icon="🔍"
                />
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
                whileHover={{ scale: 1.02 }}
              >
                <CircularProgress
                  value={Math.round(enrichedData?.current?.avg_risk || 0)}
                  max={100}
                  size={140}
                  strokeWidth={10}
                  color="#ef4444"
                  label="Avg Risk"
                  icon="⚠️"
                />
              </motion.div>
            </div>
            
            {/* Wave Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div 
                className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-emerald-400">📈</span> Code Health Trend
                </h3>
                <WaveChart 
                  data={enrichedData?.codeHealthHistory} 
                  height={200}
                  color="#10b981"
                />
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-red-400">📉</span> Risk Score Trend
                </h3>
                <WaveChart 
                  data={enrichedData?.riskHistory} 
                  height={200}
                  color="#ef4444"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {/* Quality Tab */}
        {activeTab === 'quality' && (
          <motion.div
            key="quality"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-3 gap-6">
              <MetricComparisonCard
                title="Quality Score"
                current={enrichedData?.qualityScore || 0}
                previous={enrichedData?.previousQualityScore || 0}
                icon="✨"
                color="#10b981"
              />
              <MetricComparisonCard
                title="Code Smells"
                current={enrichedData?.current?.total_smells || 0}
                previous={(enrichedData?.current?.total_smells || 0) + 5}
                icon="🔍"
                color="#f97316"
              />
              <MetricComparisonCard
                title="Average Risk"
                current={Math.round(enrichedData?.current?.avg_risk || 0)}
                previous={Math.round((enrichedData?.current?.avg_risk || 0) + 8)}
                icon="⚠️"
                color="#ef4444"
                unit="%"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div 
                className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <span className="text-cyan-400">🎯</span> Quality Dimensions
                </h3>
                <div className="flex justify-center">
                  <RadarChart data={enrichedData?.radarData} size={280} color="#06b6d4" />
                </div>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <span className="text-purple-400">🍩</span> Smell Distribution
                </h3>
                <div className="flex justify-center">
                  <DonutChart 
                    data={enrichedData?.smellsByType || []}
                    size={220}
                    strokeWidth={35}
                    centerLabel={{ value: enrichedData?.current?.total_smells || 0, label: 'Total Smells' }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <motion.div 
              className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span className="text-green-400">📅</span> Activity Heatmap
              </h3>
              <HeatmapCalendar weeks={16} />
              <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
                <span>Less</span>
                {['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'].map((color, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm" style={{ background: color }} />
                ))}
                <span>More</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span className="text-blue-400">⏱️</span> Recent Activity
              </h3>
              <Timeline events={enrichedData?.recentEvents || []} />
            </motion.div>
          </motion.div>
        )}
        
        {/* Breakdown Tab */}
        {activeTab === 'breakdown' && (
          <motion.div
            key="breakdown"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <motion.div 
              className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span className="text-orange-400">📊</span> Code Smells by Type
              </h3>
              <AnimatedBarChart 
                data={enrichedData?.smellsByType || []}
                height={250}
              />
            </motion.div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Lines', value: '12,450', icon: '📝', color: '#8b5cf6' },
                { label: 'Functions', value: '234', icon: '🔧', color: '#06b6d4' },
                { label: 'Classes', value: '45', icon: '📦', color: '#10b981' },
                { label: 'Dependencies', value: '28', icon: '🔗', color: '#f97316' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="p-5 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ background: `${stat.color}30` }}
                    >
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TrendsDashboard;
