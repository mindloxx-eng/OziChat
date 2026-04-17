import React, { useMemo } from 'react';
import type { Contact, RevenueEntry } from '../../types';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { getCountryFromPhoneNumber } from '../../utils/phone';
import { ArrowDownTrayIcon } from '../icons/ArrowDownTrayIcon';
import BarChart from './charts/BarChart';
import LineChart from './charts/LineChart';

interface AdminRevenueScreenProps {
  revenueData: RevenueEntry[];
  contacts: Contact[];
}

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-[#2a2a46] p-4 rounded-lg shadow">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
    </div>
);

const AdminRevenueScreen: React.FC<AdminRevenueScreenProps> = ({ revenueData, contacts }) => {

  const contactMap = useMemo(() => {
    return new Map(contacts.map(c => [c.id, c]));
  }, [contacts]);

  const analytics = useMemo(() => {
    const totalRevenue = revenueData.reduce((sum, entry) => sum + entry.amount, 0);
    const totalTransactions = revenueData.length;
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    const revenueByCountry = revenueData.reduce((acc, entry) => {
        const contact = contactMap.get(entry.contactId);
        if (contact) {
            const country = getCountryFromPhoneNumber(contact.phone);
            acc[country] = (acc[country] || 0) + entry.amount;
        }
        return acc;
    }, {} as Record<string, number>);

    return {
        totalRevenue,
        totalTransactions,
        averageTransactionValue,
        revenueByCountry,
    };

  }, [revenueData, contactMap]);

  const revenueOverTime = useMemo(() => {
    if (revenueData.length === 0) return [];
    
    const dailyData = revenueData.reduce((acc, entry) => {
      const date = new Date(entry.date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + entry.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(dailyData)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [revenueData]);
  

  const transactions = useMemo(() => {
    return revenueData.map(entry => {
      const contact = contactMap.get(entry.contactId);
      return {
        ...entry,
        contactName: contact?.name || 'Unknown User',
        contactAvatar: contact?.avatarUrl || 'https://i.pravatar.cc/150?u=unknown'
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [revenueData, contactMap]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  const formatTime = (isoString: string) => {
     return new Date(isoString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'User Name', 'Amount (USD)', 'Date', 'Time', 'Location'];
    
    const rows = transactions.map(t => {
        const safeName = `"${t.contactName.replace(/"/g, '""')}"`;
        const safeLocation = `"${t.location.replace(/"/g, '""')}"`;
        return [t.id, safeName, t.amount, formatDate(t.date), formatTime(t.date), safeLocation].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `ozichat-revenue-export-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
  };


  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
            <CurrencyDollarIcon className="w-8 h-8 text-gray-400" />
            <h1 className="text-3xl font-bold">Revenue</h1>
        </div>
        <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2a2a46] hover:bg-[#3a3a5c] border border-gray-600 transition-colors font-semibold"
        >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export CSV
        </button>
      </div>

      {/* Analytics Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Revenue" value={formatCurrency(analytics.totalRevenue)} />
            <StatCard title="Total Transactions" value={analytics.totalTransactions} />
            <StatCard title="Avg. Transaction Value" value={formatCurrency(analytics.averageTransactionValue)} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <LineChart title="Revenue Over Time" data={revenueOverTime} />
            <BarChart title="Revenue by Country" data={analytics.revenueByCountry} />
        </div>
      </section>

      {/* Transactions Table */}
       <section>
        <h2 className="text-xl font-semibold mb-4">All Transactions</h2>
        <div className="bg-[#1C1C2E] rounded-lg shadow-lg overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
                <thead className="bg-[#2a2a46]">
                <tr>
                    <th className="p-4 font-semibold">User</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Time</th>
                    <th className="p-4 font-semibold">Location</th>
                    <th className="p-4 font-semibold text-right">Amount</th>
                </tr>
                </thead>
                <tbody>
                {transactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-black/20 transition-colors border-b border-gray-800 last:border-b-0">
                    <td className="p-4 flex items-center gap-3">
                        <img src={transaction.contactAvatar} alt={transaction.contactName} className="w-10 h-10 rounded-full" />
                        <span className="font-medium">{transaction.contactName}</span>
                    </td>
                    <td className="p-4 text-gray-400">{formatDate(transaction.date)}</td>
                    <td className="p-4 text-gray-400">{formatTime(transaction.date)}</td>
                    <td className="p-4 text-gray-400">{transaction.location}</td>
                    <td className="p-4 font-mono text-right text-green-400">{formatCurrency(transaction.amount)}</td>
                    </tr>
                ))}
                {transactions.length === 0 && (
                    <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500">
                        No revenue data found.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>
      </section>
    </div>
  );
};

export default AdminRevenueScreen;