import React, { createContext, useContext, useState, useEffect } from 'react';
import { Concern, ConcernStatus, ConcernPriority, TimelineEvent } from '../types/concern';
import { Building } from '../types/building';
import { Room } from '../types/room';
import { FacilityCategory } from '../types/category';
import { User } from '../types/user';
import { AppNotification } from '../types/notification';

import { mockConcerns } from '../data/mockConcerns';
import { mockBuildings } from '../data/mockBuildings';
import { mockRooms } from '../data/mockRooms';
import { mockCategories } from '../data/mockCategories';
import { mockUsers } from '../data/mockUsers';
import { mockNotifications } from '../data/mockNotifications';

interface FacilityCareContextType {
  concerns: Concern[];
  buildings: Building[];
  rooms: Room[];
  categories: FacilityCategory[];
  users: User[];
  notifications: AppNotification[];
  
  // Concern Actions
  createConcern: (concernData: Omit<Concern, 'id' | 'reportNumber' | 'createdAt' | 'updatedAt' | 'timeline'>) => Concern;
  updateConcern: (id: string, updates: Partial<Concern>) => void;
  assignConcern: (concernId: string, personnelId: string, scheduledDate?: string, notes?: string, actorUser?: User) => void;
  updateConcernStatus: (concernId: string, newStatus: ConcernStatus, notes?: string, photoUrl?: string, actorUser?: User) => void;
  verifyConcern: (concernId: string, notes?: string, actorUser?: User) => void;
  rejectConcern: (concernId: string, reason: string, actorUser?: User) => void;
  updatePriority: (concernId: string, priority: ConcernPriority, reason: string, actorUser?: User) => void;
  
  // Admin CRUD Actions
  addBuilding: (building: Omit<Building, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBuilding: (id: string, updates: Partial<Building>) => void;
  toggleBuildingStatus: (id: string) => void;
  
  addRoom: (room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  toggleRoomStatus: (id: string) => void;
  
  addCategory: (category: Omit<FacilityCategory, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<FacilityCategory>) => void;
  toggleCategoryStatus: (id: string) => void;

  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Reset to default seeds
  resetDemoData: () => void;
}

const FacilityCareContext = createContext<FacilityCareContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CONCERNS: 'facilitycare_concerns_v1',
  BUILDINGS: 'facilitycare_buildings_v1',
  ROOMS: 'facilitycare_rooms_v1',
  CATEGORIES: 'facilitycare_categories_v1',
  USERS: 'facilitycare_users_v1',
  NOTIFICATIONS: 'facilitycare_notifications_v1',
};

export const FacilityCareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [concerns, setConcerns] = useState<Concern[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONCERNS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return mockConcerns;
  });

  const [buildings, setBuildings] = useState<Building[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUILDINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return mockBuildings;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROOMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return mockRooms;
  });

  const [categories, setCategories] = useState<FacilityCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return mockCategories;
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return mockUsers;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return mockNotifications;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONCERNS, JSON.stringify(concerns));
  }, [concerns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(buildings));
  }, [buildings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Actions
  const createConcern = (data: Omit<Concern, 'id' | 'reportNumber' | 'createdAt' | 'updatedAt' | 'timeline'>): Concern => {
    const nextNum = concerns.length + 1;
    const reportNumber = `FC-2026-${String(nextNum).padStart(4, '0')}`;
    const id = `cn-${Date.now()}`;
    const now = new Date().toISOString();

    const initialTimeline: TimelineEvent = {
      id: `tl-${Date.now()}`,
      action: 'Concern Submitted',
      actorId: data.reporterId,
      actorName: data.reporterName,
      actorRole: data.reporterRole,
      timestamp: now,
      notes: 'Initial report submitted via FixTrack console.'
    };

    const newConcern: Concern = {
      ...data,
      id,
      reportNumber,
      timeline: [initialTimeline],
      createdAt: now,
      updatedAt: now,
      beforePhotos: data.beforePhotos || [],
      afterPhotos: []
    };

    setConcerns(prev => [newConcern, ...prev]);

    // Create system notification for supervisors
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: 'user-supervisor',
      title: 'New Facility Concern Submitted',
      message: `${newConcern.reportNumber}: ${newConcern.title} (${newConcern.roomName})`,
      type: 'REPORT_SUBMITTED',
      concernId: newConcern.id,
      reportNumber: newConcern.reportNumber,
      read: false,
      createdAt: now
    };
    setNotifications(prev => [newNotif, ...prev]);

    return newConcern;
  };

  const updateConcern = (id: string, updates: Partial<Concern>) => {
    setConcerns(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
  };

  const assignConcern = (
    concernId: string,
    personnelId: string,
    scheduledDate?: string,
    notes?: string,
    actorUser?: User
  ) => {
    const tech = users.find(u => u.id === personnelId);
    const techName = tech ? `${tech.firstName} ${tech.lastName}` : 'Technician';
    const now = new Date().toISOString();

    setConcerns(prev =>
      prev.map(c => {
        if (c.id !== concernId) return c;

        const timelineEvent: TimelineEvent = {
          id: `tl-${Date.now()}`,
          action: `Assigned to ${techName}`,
          actorId: actorUser?.id || 'user-supervisor',
          actorName: actorUser ? `${actorUser.firstName} ${actorUser.lastName}` : 'Maintenance Supervisor',
          actorRole: actorUser?.role || 'MAINTENANCE_SUPERVISOR',
          timestamp: now,
          notes: notes || `Scheduled for target completion on ${scheduledDate || 'priority basis'}.`,
          statusBefore: c.status,
          statusAfter: 'ASSIGNED'
        };

        return {
          ...c,
          status: 'ASSIGNED',
          assignedPersonnelId: personnelId,
          assignedPersonnelName: techName,
          scheduledDate: scheduledDate || c.scheduledDate,
          updatedAt: now,
          timeline: [...c.timeline, timelineEvent]
        };
      })
    );

    // Notify technician
    const targetConcern = concerns.find(c => c.id === concernId);
    if (targetConcern) {
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: personnelId,
        title: 'New Repair Task Assigned',
        message: `You were assigned to repair ${targetConcern.reportNumber} (${targetConcern.roomName}).`,
        type: 'PERSONNEL_ASSIGNED',
        concernId,
        reportNumber: targetConcern.reportNumber,
        read: false,
        createdAt: now
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const updateConcernStatus = (
    concernId: string,
    newStatus: ConcernStatus,
    notes?: string,
    photoUrl?: string,
    actorUser?: User
  ) => {
    const now = new Date().toISOString();

    setConcerns(prev =>
      prev.map(c => {
        if (c.id !== concernId) return c;

        const afterPhotos = photoUrl && !c.afterPhotos.includes(photoUrl) 
          ? [...c.afterPhotos, photoUrl] 
          : c.afterPhotos;

        let actionName = `Status updated to ${newStatus}`;
        if (newStatus === 'IN_PROGRESS') actionName = 'Repair Started by Technician';
        if (newStatus === 'WAITING_FOR_MATERIALS') actionName = 'Repair On Hold (Waiting for Materials)';
        if (newStatus === 'COMPLETED') actionName = 'Repair Marked as Completed';

        const timelineEvent: TimelineEvent = {
          id: `tl-${Date.now()}`,
          action: actionName,
          actorId: actorUser?.id || 'user-tech-1',
          actorName: actorUser ? `${actorUser.firstName} ${actorUser.lastName}` : 'Technician',
          actorRole: actorUser?.role || 'MAINTENANCE_PERSONNEL',
          timestamp: now,
          notes: notes || '',
          statusBefore: c.status,
          statusAfter: newStatus
        };

        return {
          ...c,
          status: newStatus,
          repairNotes: notes ? (c.repairNotes ? `${c.repairNotes}\n\n[${now.split('T')[0]}]: ${notes}` : notes) : c.repairNotes,
          afterPhotos,
          completedAt: newStatus === 'COMPLETED' ? now : c.completedAt,
          updatedAt: now,
          timeline: [...c.timeline, timelineEvent]
        };
      })
    );

    // Notify supervisor when completed
    if (newStatus === 'COMPLETED') {
      const target = concerns.find(c => c.id === concernId);
      if (target) {
        const notif: AppNotification = {
          id: `notif-${Date.now()}`,
          userId: 'user-supervisor',
          title: 'Repair Completed — Awaiting Verification',
          message: `${target.reportNumber} was marked completed. Please inspect before/after photos and verify.`,
          type: 'REPAIR_COMPLETED',
          concernId,
          reportNumber: target.reportNumber,
          read: false,
          createdAt: now
        };
        setNotifications(prev => [notif, ...prev]);
      }
    }
  };

  const verifyConcern = (concernId: string, notes?: string, actorUser?: User) => {
    const now = new Date().toISOString();
    const verifierName = actorUser ? `${actorUser.firstName} ${actorUser.lastName}` : 'Engr. Carlos Mendoza';

    setConcerns(prev =>
      prev.map(c => {
        if (c.id !== concernId) return c;

        const timelineEvent: TimelineEvent = {
          id: `tl-${Date.now()}`,
          action: 'Repair Verified and Request Closed',
          actorId: actorUser?.id || 'user-supervisor',
          actorName: verifierName,
          actorRole: actorUser?.role || 'MAINTENANCE_SUPERVISOR',
          timestamp: now,
          notes: notes || 'Workmanship inspected and approved. Safe operation restored.',
          statusBefore: c.status,
          statusAfter: 'CLOSED'
        };

        return {
          ...c,
          status: 'CLOSED',
          closedAt: now,
          verifiedAt: now,
          verifiedBy: verifierName,
          updatedAt: now,
          timeline: [...c.timeline, timelineEvent]
        };
      })
    );

    // Notify reporter
    const target = concerns.find(c => c.id === concernId);
    if (target) {
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: target.reporterId,
        title: 'Concern Resolved & Closed',
        message: `Your reported concern ${target.reportNumber} (${target.title}) has been verified and closed.`,
        type: 'REQUEST_CLOSED',
        concernId,
        reportNumber: target.reportNumber,
        read: false,
        createdAt: now
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const rejectConcern = (concernId: string, reason: string, actorUser?: User) => {
    const now = new Date().toISOString();
    const verifierName = actorUser ? `${actorUser.firstName} ${actorUser.lastName}` : 'Engr. Carlos Mendoza';

    setConcerns(prev =>
      prev.map(c => {
        if (c.id !== concernId) return c;

        const timelineEvent: TimelineEvent = {
          id: `tl-${Date.now()}`,
          action: 'Repair Rejected — Re-work Required',
          actorId: actorUser?.id || 'user-supervisor',
          actorName: verifierName,
          actorRole: actorUser?.role || 'MAINTENANCE_SUPERVISOR',
          timestamp: now,
          notes: `Rejection reason: ${reason}`,
          statusBefore: c.status,
          statusAfter: 'IN_PROGRESS'
        };

        return {
          ...c,
          status: 'IN_PROGRESS',
          rejectionReason: reason,
          updatedAt: now,
          timeline: [...c.timeline, timelineEvent]
        };
      })
    );

    const target = concerns.find(c => c.id === concernId);
    if (target && target.assignedPersonnelId) {
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: target.assignedPersonnelId,
        title: 'Repair Rejected — Follow-up Required',
        message: `${target.reportNumber}: Supervisor requested rework. Reason: ${reason}`,
        type: 'REPAIR_REJECTED',
        concernId,
        reportNumber: target.reportNumber,
        read: false,
        createdAt: now
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const updatePriority = (concernId: string, priority: ConcernPriority, reason: string, actorUser?: User) => {
    const now = new Date().toISOString();
    setConcerns(prev =>
      prev.map(c => {
        if (c.id !== concernId) return c;

        const timelineEvent: TimelineEvent = {
          id: `tl-${Date.now()}`,
          action: `Priority updated to ${priority}`,
          actorId: actorUser?.id || 'user-supervisor',
          actorName: actorUser ? `${actorUser.firstName} ${actorUser.lastName}` : 'Maintenance Supervisor',
          actorRole: actorUser?.role || 'MAINTENANCE_SUPERVISOR',
          timestamp: now,
          notes: `Reason: ${reason}`
        };

        return {
          ...c,
          priority,
          priorityReason: [reason, ...c.priorityReason],
          updatedAt: now,
          timeline: [...c.timeline, timelineEvent]
        };
      })
    );
  };

  // Building Actions
  const addBuilding = (data: Omit<Building, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newBld: Building = {
      ...data,
      id: `bld-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setBuildings(prev => [...prev, newBld]);
  };

  const updateBuilding = (id: string, updates: Partial<Building>) => {
    setBuildings(prev =>
      prev.map(b => (b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b))
    );
  };

  const toggleBuildingStatus = (id: string) => {
    setBuildings(prev =>
      prev.map(b =>
        b.id === id
          ? { ...b, status: b.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', updatedAt: new Date().toISOString() }
          : b
      )
    );
  };

  // Room Actions
  const addRoom = (data: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRoom: Room = {
      ...data,
      id: `rm-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setRooms(prev => [...prev, newRoom]);
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    setRooms(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
    );
  };

  const toggleRoomStatus = (id: string) => {
    setRooms(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, status: r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', updatedAt: new Date().toISOString() }
          : r
      )
    );
  };

  // Category Actions
  const addCategory = (data: Omit<FacilityCategory, 'id'>) => {
    const newCat: FacilityCategory = {
      ...data,
      id: `cat-${Date.now()}`
    };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (id: string, updates: Partial<FacilityCategory>) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  };

  const toggleCategoryStatus = (id: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === id
          ? { ...cat, status: cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : cat
      )
    );
  };

  // User Actions
  const addUser = (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u))
    );
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === id
          ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', updatedAt: new Date().toISOString() }
          : u
      )
    );
  };

  // Notification Actions
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Reset Demo Data
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.CONCERNS);
    localStorage.removeItem(STORAGE_KEYS.BUILDINGS);
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);

    setConcerns(mockConcerns);
    setBuildings(mockBuildings);
    setRooms(mockRooms);
    setCategories(mockCategories);
    setUsers(mockUsers);
    setNotifications(mockNotifications);
  };

  return (
    <FacilityCareContext.Provider
      value={{
        concerns,
        buildings,
        rooms,
        categories,
        users,
        notifications,
        createConcern,
        updateConcern,
        assignConcern,
        updateConcernStatus,
        verifyConcern,
        rejectConcern,
        updatePriority,
        addBuilding,
        updateBuilding,
        toggleBuildingStatus,
        addRoom,
        updateRoom,
        toggleRoomStatus,
        addCategory,
        updateCategory,
        toggleCategoryStatus,
        addUser,
        updateUser,
        toggleUserStatus,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetDemoData
      }}
    >
      {children}
    </FacilityCareContext.Provider>
  );
};

export const useFacilityCare = (): FacilityCareContextType => {
  const context = useContext(FacilityCareContext);
  if (!context) {
    throw new Error('useFacilityCare must be used within a FacilityCareProvider');
  }
  return context;
};
