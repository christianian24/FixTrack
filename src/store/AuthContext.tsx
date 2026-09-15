import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/user';
import { mockUsers } from '../data/mockUsers';

interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
  login: (email: string) => boolean;
  loginAsDemoUser: (identifier: string) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  demoUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'facilitycare_active_user_v1';
const AUTH_STATE_KEY = 'facilitycare_is_authenticated_v1';
const DEMO_MODE_STORAGE_KEY = 'facilitycare_demo_mode_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Demo mode state (persisted)
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
      if (saved !== null) return saved === 'true';
    } catch (e) {
      console.error('Failed to load demo mode preference', e);
    }
    return true; // Default to demo mode enabled initially
  });

  // Authentication state (persisted)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STATE_KEY);
      if (saved !== null) return saved === 'true';
    } catch (e) {
      console.error('Failed to load auth state', e);
    }
    return true; // Default to true on initial run
  });

  // Active user state (persisted)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = mockUsers.find(u => u.id === parsed.id || u.email === parsed.email);
        if (match) return match;
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load user from storage', e);
    }
    // Default to Student Reporter
    return mockUsers[0];
  });

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } catch (e) {
      console.error('Failed to persist user to storage', e);
    }
  }, [currentUser]);

  const setDemoMode = (enabled: boolean) => {
    setIsDemoModeState(enabled);
    try {
      localStorage.setItem(DEMO_MODE_STORAGE_KEY, String(enabled));
    } catch (e) {
      console.error('Failed to persist demo mode state', e);
    }
  };

  const toggleDemoMode = () => {
    setDemoMode(!isDemoMode);
  };

  const login = (email: string): boolean => {
    const trimmed = email.trim().toLowerCase();
    const user = mockUsers.find(u => u.email.toLowerCase() === trimmed);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(AUTH_STATE_KEY, 'true');
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } catch (e) {
        console.error(e);
      }
      return true;
    }

    // In production view, allow entering any valid school email
    if (trimmed.includes('@')) {
      const localPart = trimmed.split('@')[0];
      const parts = localPart.split('.');
      const firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Campus';
      const lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : 'Member';

      const customUser: User = {
        id: `usr_${Date.now()}`,
        firstName,
        lastName,
        email: trimmed,
        role: 'REPORTER',
        userType: 'STUDENT',
        department: 'Academic Operations',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCurrentUser(customUser);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(AUTH_STATE_KEY, 'true');
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(customUser));
      } catch (e) {
        console.error(e);
      }
      return true;
    }

    return false;
  };

  const loginAsDemoUser = (identifier: string) => {
    const user = mockUsers.find(
      u => u.id === identifier || u.role === identifier || u.userType === identifier
    );
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(AUTH_STATE_KEY, 'true');
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const switchRole = (role: UserRole) => {
    const user = mockUsers.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem(AUTH_STATE_KEY, 'false');
    } catch (e) {
      console.error('Failed to persist logout state', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        isAuthenticated,
        isDemoMode,
        setDemoMode,
        toggleDemoMode,
        login,
        loginAsDemoUser,
        switchRole,
        logout,
        demoUsers: mockUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
