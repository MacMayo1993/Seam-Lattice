import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { SimulationStats } from '../types';
import { TrendingUp, Activity, Zap } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MetricsPanelProps {
  stats: SimulationStats;
  historyLimit?: number;
}

interface HistoryPoint {
  step: number;
  coherence: number;
  activeSeams: number;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ stats, historyLimit = 100 }) => {
  const historyRef = useRef<HistoryPoint[]>([]);

  useEffect(() => {
    // Update history
    historyRef.current.push({
      step: stats.steps,
      coherence: stats.coherence,
      activeSeams: stats.activeSeams
    });

    // Keep only recent history
    if (historyRef.current.length > historyLimit) {
      historyRef.current.shift();
    }
  }, [stats, historyLimit]);

  // Reset history when steps reset
  useEffect(() => {
    if (stats.steps === 0) {
      historyRef.current = [];
    }
  }, [stats.steps]);

  const chartData = {
    labels: historyRef.current.map(h => h.step),
    datasets: [
      {
        label: 'State Coherence',
        data: historyRef.current.map(h => h.coherence),
        borderColor: 'rgb(251, 113, 133)',
        backgroundColor: 'rgba(251, 113, 133, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(24, 24, 27, 0.9)',
        borderColor: 'rgba(113, 113, 122, 0.5)',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false
        }
      },
      y: {
        min: -1,
        max: 1,
        ticks: {
          color: 'rgba(161, 161, 170, 0.8)',
          font: {
            size: 10
          }
        },
        grid: {
          color: 'rgba(113, 113, 122, 0.2)'
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  const isResolved = stats.coherence === 1 || stats.coherence === -1;

  return (
    <div className="space-y-4">
      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase font-bold mb-1">
            <Activity size={14} />
            Steps
          </div>
          <div className="font-mono text-2xl text-zinc-100">{stats.steps}</div>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase font-bold mb-1">
            <TrendingUp size={14} />
            Coherence
          </div>
          <div className={`font-mono text-2xl ${isResolved ? 'text-emerald-400' : 'text-zinc-100'}`}>
            {isResolved ? 'DONE' : stats.coherence.toFixed(3)}
          </div>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase font-bold mb-1">
            <Zap size={14} />
            Active
          </div>
          <div className="font-mono text-2xl text-zinc-100">{stats.activeSeams}</div>
        </div>
      </div>

      {/* Coherence Over Time Chart */}
      {historyRef.current.length > 1 && (
        <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-lg p-4">
          <h4 className="text-sm font-bold text-zinc-300 mb-3">Coherence Over Time</h4>
          <div className="h-32">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Success Indicator */}
      {isResolved && (
        <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-lg p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Zap size={20} className="text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-emerald-400">Resolution Achieved!</div>
              <div className="text-xs text-emerald-300/80">All states unified in {stats.steps} steps</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
