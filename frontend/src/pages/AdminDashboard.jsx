import { useState, useEffect } from 'react';
import { adminAPI } from '../services/endpoints';

export default function AdminDashboard() {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); loadReports(); }, []);

  const loadStats = async () => {
    try { const { data } = await adminAPI.getStats(); setStats(data); }
    catch (err) { console.error('Load stats error:', err); }
  };

  const loadReports = async () => {
    try {
      const { data } = await adminAPI.getReports({ status: 'pending' });
      setReports(data.reports);
    } catch (err) { console.error('Load reports error:', err); }
    finally { setLoading(false); }
  };

  const loadAuditLogs = async () => {
    try {
      const { data } = await adminAPI.getAuditLogs({ limit: 50 });
      setAuditLogs(data.logs);
    } catch (err) { console.error('Load audit logs error:', err); }
  };

  const handleReviewReport = async (id, status) => {
    try { await adminAPI.reviewReport(id, { status }); loadReports(); }
    catch (err) { console.error('Review report error:', err); }
  };

  const handleSuspend = async (userId) => {
    try { await adminAPI.suspendUser(userId); loadReports(); }
    catch (err) { console.error('Suspend error:', err); }
  };

  const tabs = [
    { id: 'stats', label: '📊 Dashboard' },
    { id: 'reports', label: '🚩 Reports', count: reports.length },
    { id: 'audit', label: '📋 Audit Logs' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'audit') loadAuditLogs(); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              tab === t.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {t.label}
            {t.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${tab === t.id ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center card-hover">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-1">{stats.userCount}</p>
            <p className="text-sm text-gray-500">Total Users</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center card-hover">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-1">{stats.postCount}</p>
            <p className="text-sm text-gray-500">Total Posts</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center card-hover">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-8.5V9" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-red-600 mb-1">{stats.pendingReports}</p>
            <p className="text-sm text-gray-500">Pending Reports</p>
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12"><div className="spinner"></div></div>
          ) : reports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <p className="text-gray-400 font-medium">No pending reports</p>
              <p className="text-gray-300 text-sm mt-1">Everything looks clean</p>
            </div>
          ) : (
            reports.map(report => (
              <div key={report._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 card-hover">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="badge bg-red-50 text-red-700">#{report._id.slice(-6)}</span>
                      <span className="badge bg-purple-50 text-purple-700">{report.targetType}</span>
                    </div>
                    <p className="text-sm text-gray-500">Reported by <span className="font-medium text-gray-700">@{report.reporter?.username}</span></p>
                    <p className="text-gray-800 mt-2 bg-gray-50 rounded-xl px-4 py-2.5 text-sm">{report.reason}</p>
                  </div>
                  <div className="flex space-x-2 ml-4 shrink-0">
                    <button onClick={() => handleReviewReport(report._id, 'reviewed')}
                      className="px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-all text-sm font-medium">✓ Reviewed</button>
                    <button onClick={() => handleReviewReport(report._id, 'dismissed')}
                      className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all text-sm font-medium">✕ Dismiss</button>
                    <button onClick={() => handleSuspend(report.targetId)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all text-sm font-medium">🚫 Suspend</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'audit' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3.5 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">User</th>
                  <th className="text-left py-3.5 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Action</th>
                  <th className="text-left py-3.5 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">IP Address</th>
                  <th className="text-left py-3.5 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-gray-900">{log.user?.name || 'System'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="badge bg-gray-100 text-gray-700 font-mono">{log.action}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 font-mono text-xs">{log.ipAddress}</td>
                    <td className="py-3.5 px-4 text-gray-400 text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {auditLogs.length === 0 && (
              <p className="text-center text-gray-400 py-12">No audit logs found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
