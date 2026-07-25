import { useState, useEffect } from 'react';
import { adminAPI } from '../services/endpoints';

export default function AdminDashboard() {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadReports();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await adminAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Load stats error:', err);
    }
  };

  const loadReports = async () => {
    try {
      const { data } = await adminAPI.getReports({ status: 'pending' });
      setReports(data.reports);
    } catch (err) {
      console.error('Load reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const { data } = await adminAPI.getAuditLogs({ limit: 50 });
      setAuditLogs(data.logs);
    } catch (err) {
      console.error('Load audit logs error:', err);
    }
  };

  const handleReviewReport = async (id, status) => {
    try {
      await adminAPI.reviewReport(id, { status });
      loadReports();
    } catch (err) {
      console.error('Review report error:', err);
    }
  };

  const handleSuspend = async (userId) => {
    try {
      await adminAPI.suspendUser(userId);
      loadReports();
    } catch (err) {
      console.error('Suspend error:', err);
    }
  };

  const tabs = [
    { id: 'stats', label: 'Dashboard' },
    { id: 'reports', label: 'Reports' },
    { id: 'audit', label: 'Audit Logs' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex space-x-2 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'audit') loadAuditLogs(); }}
            className={`px-4 py-2 rounded-lg ${tab === t.id ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.userCount}</p>
            <p className="text-gray-600">Users</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.postCount}</p>
            <p className="text-gray-600">Posts</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-red-600">{stats.pendingReports}</p>
            <p className="text-gray-600">Pending Reports</p>
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-4">
          {loading ? <p>Loading...</p> : reports.length === 0 ? (
            <p className="text-gray-500">No pending reports</p>
          ) : (
            reports.map(report => (
              <div key={report._id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">Report #{report._id.slice(-6)}</p>
                    <p className="text-sm text-gray-500">
                      Type: {report.targetType} · Reported by @{report.reporter?.username}
                    </p>
                    <p className="text-sm mt-1">{report.reason}</p>
                  </div>
                  <div className="space-x-2">
                    <button onClick={() => handleReviewReport(report._id, 'reviewed')}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm">Reviewed</button>
                    <button onClick={() => handleReviewReport(report._id, 'dismissed')}
                      className="bg-gray-500 text-white px-3 py-1 rounded text-sm">Dismiss</button>
                    <button onClick={() => handleSuspend(report.targetId)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm">Suspend</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'audit' && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">User</th>
                  <th className="text-left py-2 px-3">Action</th>
                  <th className="text-left py-2 px-3">IP</th>
                  <th className="text-left py-2 px-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{log.user?.name || 'System'}</td>
                    <td className="py-2 px-3">{log.action}</td>
                    <td className="py-2 px-3 text-gray-500">{log.ipAddress}</td>
                    <td className="py-2 px-3 text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {auditLogs.length === 0 && <p className="text-center text-gray-500 py-4">No audit logs</p>}
          </div>
        </div>
      )}
    </div>
  );
}
