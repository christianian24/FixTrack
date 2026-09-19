import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { EmptyState } from '../../components/common/EmptyState';
import { formatRelativeTime } from '../../lib/formatting';
import {
  Bell,
  CheckCheck,
  Wrench,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const { notifications, notificationError, markNotificationAsRead, markAllNotificationsAsRead } = useFacilityCare();
  const isSupervisor = currentRole === 'MAINTENANCE_SUPERVISOR';

  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const myNotifications = notifications.filter(n => n.userId === currentUser.id);

  const filteredNotifs = myNotifications.filter(n => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  });

  const getNotifIcon = (type: string) => {
    if (type.includes('COMPLETED') || type.includes('CLOSED')) {
      return (
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
          <CheckCircle className="w-4 h-4" />
        </div>
      );
    }
    if (type.includes('ASSIGNED') || type.includes('STARTED')) {
      return (
        <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
          <Wrench className="w-4 h-4" />
        </div>
      );
    }
    if (type.includes('REJECTED') || type.includes('PRIORITY')) {
      return (
        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
        <Bell className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className={isSupervisor ? 'max-w-4xl mx-auto space-y-3' : 'max-w-4xl mx-auto space-y-4'}>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between ${isSupervisor ? 'gap-3' : 'gap-4'}`}>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-sky-600" /> Notification Inbox
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Facility updates, technician dispatch alerts, and verification notices
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllNotificationsAsRead}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-sky-600" /> Mark All as Read
          </button>
        </div>
      </div>

      {notificationError && (
        <p className="text-sm text-rose-600" role="alert">{notificationError}</p>
      )}

      {/* Segmented Control */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 w-fit">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            filter === 'ALL'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          All Activity ({myNotifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            filter === 'UNREAD'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Unread ({myNotifications.filter(n => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <EmptyState
          title="No notifications in this view"
          description="You are fully up to date with campus facility announcements and task updates."
        />
      ) : (
        <div className={isSupervisor ? 'space-y-2' : 'space-y-3'}>
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationAsRead(n.id)}
              className={`${isSupervisor ? 'p-3 gap-3' : 'p-4 gap-4'} rounded-2xl border transition-all flex items-start justify-between cursor-pointer ${
                n.read
                  ? 'border-slate-200 bg-white hover:border-slate-300'
                  : 'border-sky-200 bg-sky-50/40 shadow-sm hover:border-sky-300'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {getNotifIcon(n.type)}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold ${n.read ? 'text-slate-800' : 'text-sky-950'}`}>
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[11px] text-slate-400 font-medium block pt-0.5">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>
              </div>

              {n.concernId && (
                <Link
                  to={`/concerns/${n.concernId}`}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-sky-600 hover:text-sky-700 text-xs font-semibold flex items-center gap-1 flex-shrink-0 transition-colors shadow-sm"
                >
                  View <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
