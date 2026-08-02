import React from 'react';
import { 
  ShieldAlert, 
  Users, 
  Truck, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Cpu
} from 'lucide-react';

const sparklineData1 = [40, 45, 42, 50, 48, 58, 62];
const sparklineData2 = [70, 68, 62, 58, 50, 45, 38];
const sparklineData3 = [30, 50, 40, 60, 50, 70, 80];
const sparklineData4 = [60, 65, 72, 78, 82, 88, 95];
const sparklineData5 = [75, 78, 80, 82, 81, 83, 84];

const SVGSparkline = ({ data, color }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 30;
  const width = 100;
  
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2; // leave 2px padding top/bottom
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-24 h-8 overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const StatCard = ({ title, count, trend, isPositive, icon: Icon, data, color }) => {
  return (
    <div className="bg-white border border-veryLightGray rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between h-36 text-left">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">{title}</span>
          <h3 className="text-2xl font-bold text-textMain">{count}</h3>
        </div>
        <div className="p-2 rounded-xl bg-background border border-veryLightGray">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-1">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-success" />
          ) : (
            <TrendingDown className="w-4 h-4 text-danger" />
          )}
          <span className={`text-xs font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
            {trend}
          </span>
        </div>
        <div className="w-24 h-8 shrink-0 flex items-center justify-end">
          <SVGSparkline data={data} color={color} />
        </div>
      </div>
    </div>
  );
};

const StatsCards = ({ incidents = [], resources = [] }) => {
  const resolvedCount = incidents.filter(i => i.status === 'Resolved').length;
  const activeCount = incidents.filter(i => i.status === 'Dispatched').length;
  const totalCount = incidents.length;
  
  // Calculate mock stranded based on pending flood/medical count
  const strandedCount = incidents
    .filter(i => i.status !== 'Resolved' && (i.type === 'Flood' || i.type === 'Medical'))
    .reduce((acc, i) => acc + (i.priority === 'High' ? 8 : 3), 0);

  const deployedRes = resources.filter(r => r.status === 'Deployed').length;
  const utilizationPercent = resources.length > 0 
    ? Math.round((deployedRes / resources.length) * 100) 
    : 84;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard 
        title="Total Incidents" 
        count={totalCount} 
        trend="+8.4% today" 
        isPositive={true} 
        icon={ShieldAlert}
        data={sparklineData1}
        color="#2F80ED"
      />
      <StatCard 
        title="Stranded People" 
        count={strandedCount} 
        trend="-12.1% progress" 
        isPositive={false} 
        icon={Users}
        data={sparklineData2}
        color="#EB5757"
      />
      <StatCard 
        title="Active Rescues" 
        count={activeCount} 
        trend="+4.2% rate" 
        isPositive={true} 
        icon={Truck}
        data={sparklineData3}
        color="#F2C94C"
      />
      <StatCard 
        title="Resolved Cases" 
        count={resolvedCount} 
        trend="+15.5% speed" 
        isPositive={true} 
        icon={CheckCircle}
        data={sparklineData4}
        color="#27AE60"
      />
      <StatCard 
        title="Resource Utilized" 
        count={`${utilizationPercent}%`} 
        trend="+2.1% efficiency" 
        isPositive={true} 
        icon={Cpu}
        data={sparklineData5}
        color="#9B51E0"
      />
    </div>
  );
};

export default StatsCards;
