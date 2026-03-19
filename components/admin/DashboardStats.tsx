'use client';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
}

function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">{change}</p>
          )}
        </div>
        {icon && <div className="text-blue-600">{icon}</div>}
      </div>
    </div>
  );
}

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Revenue" value="₹1,23,456" change="+12.5% from last month" />
      <StatCard title="Total Orders" value="234" change="+8.2% from last month" />
      <StatCard title="Total Users" value="1,234" change="+15.3% from last month" />
      <StatCard title="Products" value="89" change="+5 new this month" />
    </div>
  );
}
