import React, { createContext, useContext, useState, useEffect } from 'react';
import { Concern, ConcernStatus, ConcernPriority } from '../types/concern';
import { Building } from '../types/building';
import { Room } from '../types/room';
import { FacilityCategory } from '../types/category';
import { User } from '../types/user';
import { AppNotification } from '../types/notification';

import { buildingsApi, roomsApi, categoriesApi, usersApi } from '../services/api/adminApi';
import { concernsApi, ArchivedConcernRead, ConcernRead, ConcernPhoto } from '../services/api/concernsApi';
import { notificationsApi } from '../services/api/notificationsApi';
import { resolveApiUrl } from '../services/api/client';
import { useAuth } from './AuthContext';

type BackendBuilding = {
  id: string;
  name: string;
  code: string;
  floors: number;
  description?: string | null;
  status?: string;
  total_rooms?: number;
  is_active?: boolean;
};

type BackendRoom = {
  id: string;
  building_id: string;
  building_name?: string;
  name: string;
  code?: string;
  floor: number;
  room_type?: string;
  capacity?: number | null;
  status?: string;
  is_active?: boolean;
};

type BackendCategory = {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  priority_weight: number;
  is_active: boolean;
};

const priorityWeightToHint = (weight: number): FacilityCategory['defaultPriorityHint'] => {
  if (weight >= 9) return 'CRITICAL';
  if (weight >= 7) return 'HIGH';
  if (weight <= 3) return 'LOW';
  return 'MEDIUM';
};

const priorityHintToWeight = (hint: FacilityCategory['defaultPriorityHint']): number => {
  switch (hint) {
    case 'LOW': return 2;
    case 'MEDIUM': return 5;
    case 'HIGH': return 7;
    case 'CRITICAL': return 10;
  }
};

type BackendUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  user_type?: string;
  department?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  status?: string;
  is_active?: boolean;
  is_online?: boolean;
  created_at?: string;
};

type BackendNotification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  concern_id?: string | null;
  is_read: boolean;
  created_at?: string;
};

const backendStringToStatus = (value?: string | boolean | null): 'ACTIVE' | 'INACTIVE' => {
  if (typeof value === 'boolean') return value ? 'ACTIVE' : 'INACTIVE';
  return value === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
};

const mapBuilding = (item: BackendBuilding): Building => ({
  id: item.id,
  name: item.name,
  code: item.code,
  floors: item.floors,
  totalRooms: item.total_rooms ?? 0,
  description: item.description ?? undefined,
  status: backendStringToStatus(item.is_active ?? item.status),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const mapRoom = (item: BackendRoom): Room => ({
  id: item.id,
  buildingId: item.building_id,
  buildingName: item.building_name ?? 'Unknown Building',
  name: item.name,
  code: item.code ?? item.name,
  floor: item.floor,
  roomType: (item.room_type as Room['roomType']) ?? 'Classroom',
  capacity: item.capacity ?? undefined,
  status: backendStringToStatus(item.is_active ?? item.status),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const mapCategory = (item: BackendCategory): FacilityCategory => ({
  id: item.id,
  name: item.name,
  description: item.description ?? '',
  iconName: item.icon ?? 'Wrench',
  defaultPriorityHint: priorityWeightToHint(item.priority_weight),
  status: backendStringToStatus(item.is_active),
});

const mapUser = (item: BackendUser): User => ({
  id: item.id,
  firstName: item.first_name,
  lastName: item.last_name,
  email: item.email,
  role: item.role as User['role'],
  userType: (item.user_type ?? 'STUDENT') as User['userType'],
  phone: item.phone ?? undefined,
  avatar: item.avatar_url ?? undefined,
  department: item.department ?? undefined,
  status: backendStringToStatus(item.is_active ?? item.status),
  isOnline: item.is_online ?? false,
  createdAt: item.created_at ?? new Date().toISOString(),
  updatedAt: item.created_at ?? new Date().toISOString(),
});

const mapNotification = (item: BackendNotification): AppNotification => ({
  id: item.id,
  userId: item.user_id,
  title: item.title,
  message: item.message,
  type: item.type as AppNotification['type'],
  concernId: item.concern_id ?? undefined,
  read: item.is_read,
  createdAt: item.created_at ?? new Date().toISOString(),
});

const mapConcern = (
  item: ConcernRead,
  buildings: Building[],
  rooms: Room[],
  categories: FacilityCategory[],
  users: User[],
  currentUser?: User,
): Concern => {
  const reporter = users.find((user) => user.id === item.reporter_id) ??
    (currentUser?.id === item.reporter_id ? currentUser : undefined);
  const assignee = users.find((user) => user.id === item.assigned_to_id) ??
    (currentUser?.id === item.assigned_to_id ? currentUser : undefined);
  const room = rooms.find((value) => value.id === item.room_id);
  const category = categories.find((value) => value.id === item.category_id);
  const building = buildings.find(
    (value) => value.id === (item.building_id ?? room?.buildingId),
  );
  const photos = item.photos ?? [];

  return {
  id: item.id,
  reportNumber: item.tracking_number,
  title: item.title,
  description: item.description ?? '',
  reporterId: item.reporter_id ?? '',
  reporterName: reporter ? `${reporter.firstName} ${reporter.lastName}` : 'Unknown Reporter',
  reporterRole: reporter?.role ?? 'REPORTER',
  reporterType: reporter?.userType ?? 'STUDENT',
  categoryId: item.category_id ?? '',
  categoryName: category?.name ?? 'Unknown Category',
  buildingId: item.building_id ?? building?.id ?? room?.buildingId ?? '',
  buildingName: item.building_name ?? building?.name ?? 'Unknown Building',
  buildingCode: item.building_code ?? building?.code,
  roomId: item.room_id,
  roomName: item.other_location ?? item.room_name ?? room?.name ?? 'Unknown Room',
  roomFloor: item.room_floor ?? room?.floor ?? null,
  otherLocation: item.other_location ?? undefined,
  priority: (item.priority as ConcernPriority) ?? 'MEDIUM',
  priorityReason: [],
  status: item.status === 'SUBMITTED' ? 'PENDING' : item.status as ConcernStatus,
  safetyRisk: item.is_safety_hazard ? 'SIGNIFICANT' : 'NONE',
  affectedUsers: item.affects_many_people ? 'CLASS' : 'INDIVIDUAL',
  duplicateCount: 0,
  assignedPersonnelId: item.assigned_to_id ?? undefined,
  assignedPersonnelName: assignee ? `${assignee.firstName} ${assignee.lastName}` : undefined,
  repairNotes: item.resolution_notes ?? undefined,
  rejectionReason: item.rejection_reason ?? undefined,
  beforePhotos: photos.filter((photo) => !photo.is_completion_photo).map((photo) => resolveApiUrl(photo.url)),
  afterPhotos: photos.filter((photo) => photo.is_completion_photo).map((photo) => resolveApiUrl(photo.url)),
  photoRecords: photos.map((photo) => ({
    id: photo.id,
    url: resolveApiUrl(photo.url),
    isCompletionPhoto: photo.is_completion_photo,
    filename: photo.filename,
  })),
  timeline: (item.timeline_events ?? []).map((event) => ({
    id: event.id,
    action: event.event_type,
    actorId: event.actor_id ?? '',
    actorName: users.find((user) => user.id === event.actor_id)?.firstName ?? 'System',
    actorRole: users.find((user) => user.id === event.actor_id)?.role ?? 'SYSTEM',
    timestamp: event.created_at,
    notes: event.note ?? undefined,
    statusBefore: event.old_status as ConcernStatus | undefined,
    statusAfter: event.new_status as ConcernStatus | undefined,
  })),
  createdAt: item.submitted_at,
  updatedAt: item.updated_at,
  completedAt: item.completed_at ?? undefined,
  verifiedAt: item.verified_at ?? undefined,
  closedAt: item.closed_at ?? undefined,
};
};

interface FacilityCareContextType {
  concerns: Concern[];
  buildings: Building[];
  rooms: Room[];
  categories: FacilityCategory[];
  users: User[];
  notifications: AppNotification[];
  notificationError: string | null;
  
  // Concern Actions
  createConcern: (concernData: Omit<Concern, 'id' | 'reportNumber' | 'createdAt' | 'updatedAt' | 'timeline'>) => Promise<Concern>;
  uploadConcernPhoto: (concernId: string, file: File, isCompletionPhoto?: boolean) => Promise<ConcernPhoto>;
  updateConcern: (id: string, updates: Partial<Concern>) => void;
  archiveConcern: (concernId: string) => Promise<void>;
  getArchivedConcerns: () => Promise<ArchivedConcernRead[]>;
  restoreConcern: (concernId: string) => Promise<void>;
  permanentlyDeleteConcern: (concernId: string) => Promise<void>;
  assignConcern: (concernId: string, personnelId: string, scheduledDate?: string, notes?: string, actorUser?: User) => Promise<void>;
  updateConcernStatus: (concernId: string, newStatus: ConcernStatus, notes?: string, photoUrl?: string, actorUser?: User) => Promise<void>;
  deleteConcernPhoto: (concernId: string, photoId: string) => Promise<void>;
  verifyConcern: (concernId: string, notes?: string, actorUser?: User) => Promise<void>;
  rejectConcern: (concernId: string, reason: string, actorUser?: User) => Promise<void>;
  updatePriority: (concernId: string, priority: ConcernPriority, reason: string, actorUser?: User) => Promise<void>;
  
  // Admin CRUD Actions
  addBuilding: (building: Omit<Building, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBuilding: (id: string, updates: Partial<Building>) => void;
  toggleBuildingStatus: (id: string) => void;
  
  addRoom: (room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  toggleRoomStatus: (id: string) => void;
  
  addCategory: (category: Omit<FacilityCategory, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<FacilityCategory>) => Promise<void>;
  toggleCategoryStatus: (id: string) => Promise<void>;

  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;

  // Notifications
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;

}

const FacilityCareContext = createContext<FacilityCareContextType | undefined>(undefined);

const FacilityCareStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState<FacilityCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setNotificationError(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    setNotifications([]);
    setNotificationError(null);

    const hydrate = async () => {
      try {
        const [rawBuildings, rawRooms, rawCategories, rawUsers] = await Promise.all([
          buildingsApi.list(),
          roomsApi.list(),
          categoriesApi.list(),
          usersApi.list().catch(() => []),
        ]);
        const nextBuildings = rawBuildings.map(mapBuilding);
        const nextRooms = rawRooms.map(mapRoom);
        const nextCategories = rawCategories.map(mapCategory);
        const nextUsers = rawUsers.map(mapUser);
        const concernSummaries = await concernsApi.list();
        const rawConcerns = await Promise.all(concernSummaries.map(async (summary) => {
          try {
            return await concernsApi.get(summary.id);
          } catch {
            return summary;
          }
        }));
        const relatedUserIds = [...new Set(rawConcerns.flatMap((item) => [item.reporter_id, item.assigned_to_id].filter(Boolean) as string[]))];
        const relatedUsers = await Promise.all(relatedUserIds.map(async (userId) => {
          if (nextUsers.some((user) => user.id === userId)) return undefined;
          try {
            return mapUser(await usersApi.get(userId));
          } catch {
            return undefined;
          }
        }));
        const allUsers = [...nextUsers, ...relatedUsers.filter((user): user is User => Boolean(user))];
        const nextConcerns = rawConcerns.map((item) => mapConcern(
          item,
          nextBuildings,
          nextRooms,
          nextCategories,
          allUsers,
          currentUser,
        ));
        let nextNotifications: AppNotification[] = [];
        try {
          const rawNotifications = await notificationsApi.list();
          nextNotifications = rawNotifications.map(mapNotification);
        } catch {
          if (!cancelled) {
            setNotificationError('Unable to load notifications right now. Please try again.');
          }
        }

        if (cancelled) return;

        setConcerns(nextConcerns);
        setBuildings(nextBuildings);
        setRooms(nextRooms);
        setCategories(nextCategories);
        setUsers(allUsers);
        setNotifications(nextNotifications);
      } catch {
        // Keep the current in-memory state if the backend is unavailable.
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    if (
      !isAuthenticated ||
      !['ADMINISTRATOR', 'MAINTENANCE_SUPERVISOR'].includes(currentUser.role)
    ) {
      return;
    }

    let cancelled = false;
    const refreshUsers = async () => {
      try {
        const nextUsers = await usersApi.list();
        if (!cancelled) setUsers(nextUsers.map(mapUser));
      } catch (error) {
        if (!cancelled) console.warn('Unable to refresh user presence.', error);
      }
    };
    const interval = window.setInterval(() => void refreshUsers(), 15_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [currentUser.role, isAuthenticated]);

  // Actions
  const createConcern = async (data: Omit<Concern, 'id' | 'reportNumber' | 'createdAt' | 'updatedAt' | 'timeline'>): Promise<Concern> => {
    const response = await concernsApi.create({
      title: data.title,
      description: data.description,
      category_id: data.categoryId || undefined,
      building_id: data.buildingId,
      room_id: data.roomId,
      other_location: data.otherLocation?.trim() || null,
      priority: data.priority,
      is_safety_hazard: data.safetyRisk !== 'NONE',
      affects_many_people: data.affectedUsers !== 'INDIVIDUAL',
      is_recurring: false,
    });
    const newConcern = mapConcern(response, buildings, rooms, categories, users, currentUser);
    setConcerns((prev) => [newConcern, ...prev.filter((item) => item.id !== newConcern.id)]);
    return newConcern;
  };

  const uploadConcernPhoto = async (concernId: string, file: File, isCompletionPhoto = false): Promise<ConcernPhoto> => {
    const photo = await concernsApi.uploadPhoto(concernId, file, isCompletionPhoto);
    const url = resolveApiUrl(photo.url);
    setConcerns((prev) => prev.map((concern) => {
      if (concern.id !== concernId) return concern;
      return {
        ...concern,
        beforePhotos: isCompletionPhoto ? concern.beforePhotos : [...concern.beforePhotos, url],
        afterPhotos: isCompletionPhoto ? [...concern.afterPhotos, url] : concern.afterPhotos,
        photoRecords: [
          ...(concern.photoRecords ?? []),
          {
            id: photo.id,
            url,
            isCompletionPhoto,
            filename: photo.filename,
          },
        ],
      };
    }));
    return photo;
  };

  const deleteConcernPhoto = async (concernId: string, photoId: string): Promise<void> => {
    await concernsApi.deletePhoto(photoId);
    setConcerns((prev) => prev.map((concern) => {
      if (concern.id !== concernId) return concern;
      const photo = concern.photoRecords?.find((item) => item.id === photoId);
      if (!photo) return concern;
      return {
        ...concern,
        beforePhotos: photo.isCompletionPhoto
          ? concern.beforePhotos
          : concern.beforePhotos.filter((url) => url !== photo.url),
        afterPhotos: photo.isCompletionPhoto
          ? concern.afterPhotos.filter((url) => url !== photo.url)
          : concern.afterPhotos,
        photoRecords: concern.photoRecords?.filter((item) => item.id !== photoId),
      };
    }));
  };

  const updateConcern = (id: string, updates: Partial<Concern>) => {
    setConcerns(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
  };

  const archiveConcern = async (concernId: string): Promise<void> => {
    await concernsApi.archive(concernId);
    setConcerns((prev) => prev.filter((concern) => concern.id !== concernId));
  };

  const getArchivedConcerns = (): Promise<ArchivedConcernRead[]> => concernsApi.listArchived();

  const restoreConcern = async (concernId: string): Promise<void> => {
    const response = await concernsApi.restore(concernId);
    const restored = mapConcern(response, buildings, rooms, categories, users, currentUser);
    setConcerns((prev) => [
      ...prev.filter((concern) => concern.id !== restored.id),
      restored,
    ]);
  };

  const permanentlyDeleteConcern = async (concernId: string): Promise<void> => {
    await concernsApi.permanentlyDelete(concernId);
    setConcerns((prev) => prev.filter((concern) => concern.id !== concernId));
  };

  const assignConcern = async (
    concernId: string,
    personnelId: string,
    scheduledDate?: string,
    notes?: string,
    actorUser?: User
  ) => {
    const response = await concernsApi.assign(concernId, { personnel_id: personnelId, scheduled_date: scheduledDate, notes });
    const updated = mapConcern(response, buildings, rooms, categories, users, currentUser);
    setConcerns((prev) => prev.map((concern) => concern.id === updated.id ? updated : concern));
  };

  const updateConcernStatus = async (
    concernId: string,
    newStatus: ConcernStatus,
    notes?: string,
    photoUrl?: string,
    actorUser?: User
  ) => {
    let response: ConcernRead;
    if (newStatus === 'IN_PROGRESS') response = await concernsApi.start(concernId, notes);
    else if (newStatus === 'WAITING_FOR_MATERIALS') response = await concernsApi.hold(concernId, notes || 'Waiting for materials.');
    else if (newStatus === 'COMPLETED') response = await concernsApi.complete(concernId, { repair_notes: notes || 'Repair completed and ready for verification.' });
    else throw new Error(`Unsupported status transition: ${newStatus}`);

    const updated = mapConcern(response, buildings, rooms, categories, users, currentUser);
    setConcerns((prev) => prev.map((concern) => concern.id === updated.id ? updated : concern));
  };

  const verifyConcern = async (concernId: string, notes?: string, actorUser?: User) => {
    let response = await concernsApi.verify(concernId, notes);
    if (actorUser?.role === 'MAINTENANCE_SUPERVISOR' || actorUser?.role === 'ADMINISTRATOR') {
      response = await concernsApi.close(concernId, notes);
    }
    const updated = mapConcern(response, buildings, rooms, categories, users, currentUser);
    setConcerns((prev) => prev.map((concern) => concern.id === updated.id ? updated : concern));
  };

  const rejectConcern = async (concernId: string, reason: string, actorUser?: User) => {
    const response = await concernsApi.reject(concernId, reason);
    const updated = mapConcern(response, buildings, rooms, categories, users, currentUser);
    setConcerns((prev) => prev.map((concern) => concern.id === updated.id ? updated : concern));
  };

  const updatePriority = async (concernId: string, priority: ConcernPriority, reason: string, actorUser?: User) => {
    const response = await concernsApi.update(concernId, { priority });
    const updated = mapConcern(response, buildings, rooms, categories, users, currentUser);
    setConcerns((prev) => prev.map((concern) => concern.id === updated.id ? {
      ...updated,
      priorityReason: [reason, ...concern.priorityReason],
    } : concern));
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
  const addCategory = async (data: Omit<FacilityCategory, 'id'>): Promise<void> => {
    const response = await categoriesApi.create({
      name: data.name.trim(),
      description: data.description.trim() || null,
      icon: data.iconName,
      color: 'blue',
      priority_weight: priorityHintToWeight(data.defaultPriorityHint),
      is_active: data.status === 'ACTIVE',
    });
    const category = mapCategory(response);
    setCategories((prev) => [...prev.filter((item) => item.id !== category.id), category]);
  };

  const updateCategory = async (id: string, updates: Partial<FacilityCategory>): Promise<void> => {
    const response = await categoriesApi.update(id, {
      name: updates.name?.trim(),
      description: updates.description?.trim() || undefined,
      icon: updates.iconName,
      priority_weight: updates.defaultPriorityHint
        ? priorityHintToWeight(updates.defaultPriorityHint)
        : undefined,
      is_active: updates.status ? updates.status === 'ACTIVE' : undefined,
    });
    const category = mapCategory(response);
    setCategories((prev) => prev.map((item) => item.id === id ? category : item));
  };

  const toggleCategoryStatus = async (id: string): Promise<void> => {
    const category = categories.find((item) => item.id === id);
    if (!category) return;
    await updateCategory(id, {
      status: category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const response = await usersApi.updateManaged(id, {
      first_name: updates.firstName,
      last_name: updates.lastName,
      phone: updates.phone,
      role: updates.role,
      user_type: updates.userType,
      department: updates.department,
      is_active: updates.status ? updates.status === 'ACTIVE' : undefined,
    });
    setUsers((prev) => prev.map((user) => user.id === id ? mapUser(response) : user));
  };

  const toggleUserStatus = async (id: string) => {
    const target = users.find((user) => user.id === id);
    if (!target) return;
    const response = await usersApi.updateManaged(id, { is_active: target.status !== 'ACTIVE' });
    setUsers((prev) => prev.map((user) => user.id === id ? mapUser(response) : user));
  };

  // Notification Actions
  const markNotificationAsRead = async (id: string) => {
    try {
      const updated = await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? mapNotification(updated) : n));
      setNotificationError(null);
    } catch {
      const message = "We couldn't update this notification. Please try again.";
      setNotificationError(message);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setNotificationError(null);
    } catch {
      const message = "We couldn't update this notification. Please try again.";
      setNotificationError(message);
    }
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
        notificationError,
        createConcern,
        uploadConcernPhoto,
        updateConcern,
        archiveConcern,
        getArchivedConcerns,
        restoreConcern,
        permanentlyDeleteConcern,
        assignConcern,
        updateConcernStatus,
        deleteConcernPhoto,
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
        updateUser,
        toggleUserStatus,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </FacilityCareContext.Provider>
  );
};

export const FacilityCareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <FacilityCareStateProvider>{children}</FacilityCareStateProvider>;
};

export const useFacilityCare = (): FacilityCareContextType => {
  const context = useContext(FacilityCareContext);
  if (!context) {
    throw new Error('useFacilityCare must be used within a FacilityCareProvider');
  }
  return context;
};
