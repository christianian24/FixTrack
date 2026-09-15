/**
 * AuthContext — connects to the real FastAPI backend.
 *
 * Supports:
 *  - Real email/password login via POST /api/v1/auth/login
 *  - Demo persona login via POST /api/v1/auth/demo-login/{persona}
 *  - Persists JWT in localStorage via the api/client helper
 *  - Falls back to offline mock mode when VITE_OFFLINE_DEMO=true
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { User, UserRole } from '../types/user';
import { mockUsers } from '../data/mockUsers';
import { authApi, MeResponse } from '../services/api/authApi';
import { clearToken, getToken } from '../services/api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  /** true when backend is unreachable and we are using mock data */
  isOffline: boolean;
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
  /** Real email + password login (returns error string on failure) */
  login: (email: string, password?: string) => Promise<string | null>;
  /** Instantly switch to a demo persona (uses backend demo endpoint) */
  loginAsDemoUser: (identifier: string) => Promise<void>;
  /** Legacy switch for demo role-switcher panel */
  switchRole: (role: UserRole) => void;
  logout: () => void;
  demoUsers: User[];
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'facilitycare_active_user_v1';
const DEMO_MODE_STORAGE_KEY = 'facilitycare_demo_mode_v1';

// Converts backend MeResponse → frontend User shape
function mapMe(me: MeResponse): User {
  return {
    id: me.id,
    firstName: me.first_name,
    lastName: me.last_name,
    email: me.email,
    role: me.role as UserRole,
    userType: me.user_type as User['userType'],
    department: me.department ?? undefined,
    phone: me.phone ?? undefined,
    avatar: me.avatar_url ?? undefined,
    status: me.status as User['status'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Whether we are operating in offline / mock mode
  const isOffline =
    import.meta.env.VITE_OFFLINE_DEMO === 'true' ||
    import.meta.env.MODE === 'demo';

  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
      return s !== null ? s === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as User;
        const match = mockUsers.find(
          (u) => u.id === parsed.id || u.email === parsed.email
        );
        return match ?? parsed;
      }
    } catch {
      /* ignore */
    }
    return mockUsers[0];
  });

  // ── On mount: try to hydrate from existing token ─────────────────────────

  useEffect(() => {
    const hydrate = async () => {
      const token = getToken();
      if (token && !isOffline) {
        try {
          const me = await authApi.me();
          const user = mapMe(me);
          setCurrentUser(user);
          setIsAuthenticated(true);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        } catch {
          // Token expired or invalid — clear it
          clearToken();
          setIsAuthenticated(false);
        }
      } else if (isOffline) {
        // Offline demo: auto-authenticate with stored/default user
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    hydrate();
  }, [isOffline]);

  // ── Persist user to localStorage whenever it changes ─────────────────────

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } catch {
      /* ignore */
    }
  }, [currentUser]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const setDemoMode = (enabled: boolean) => {
    setIsDemoModeState(enabled);
    try {
      localStorage.setItem(DEMO_MODE_STORAGE_KEY, String(enabled));
    } catch {
      /* ignore */
    }
  };

  const toggleDemoMode = () => setDemoMode(!isDemoMode);

  /**
   * Login with email + optional password.
   * - If offline/demo mode and no password: uses mock lookup
   * - Otherwise calls the real backend
   */
  const login = useCallback(
    async (email: string, password?: string): Promise<string | null> => {
      const trimmed = email.trim().toLowerCase();

      // ── Offline / demo fallback ────────────────────────────────────────
      if (isOffline || !password) {
        const user = mockUsers.find(
          (u) => u.email.toLowerCase() === trimmed
        );
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          return null; // success
        }
        // Accept any valid email format and create a guest student user
        if (trimmed.includes('@')) {
          const [local] = trimmed.split('@');
          const parts = local.split('.');
          const guest: User = {
            id: `usr_${Date.now()}`,
            firstName:
              parts[0]?.charAt(0).toUpperCase() + (parts[0]?.slice(1) ?? ''),
            lastName:
              (parts[1]?.charAt(0).toUpperCase() ?? '') +
              (parts[1]?.slice(1) ?? 'Member'),
            email: trimmed,
            role: 'REPORTER',
            userType: 'STUDENT',
            department: 'Academic Operations',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setCurrentUser(guest);
          setIsAuthenticated(true);
          return null;
        }
        return 'Invalid email address.';
      }

      // ── Real backend login ─────────────────────────────────────────────
      try {
        await authApi.login({ email: trimmed, password });
        const me = await authApi.me();
        const user = mapMe(me);
        setCurrentUser(user);
        setIsAuthenticated(true);
        return null; // success
      } catch (err) {
        return err instanceof Error ? err.message : 'Login failed.';
      }
    },
    [isOffline]
  );

  const loginAsDemoUser = useCallback(
    async (identifier: string): Promise<void> => {
      // Offline demo — just find in mock list
      if (isOffline) {
        const user = mockUsers.find(
          (u) =>
            u.id === identifier ||
            u.role === identifier ||
            u.userType === identifier
        );
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
        return;
      }

      // Real backend demo login
      try {
        await authApi.loginDemo(identifier);
        const me = await authApi.me();
        setCurrentUser(mapMe(me));
        setIsAuthenticated(true);
      } catch {
        // Fallback to mock if backend not available yet
        const user = mockUsers.find(
          (u) =>
            u.id === identifier ||
            u.role === identifier ||
            u.userType === identifier
        );
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      }
    },
    [isOffline]
  );

  const switchRole = (role: UserRole) => {
    const user = mockUsers.find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } catch {
        /* ignore */
      }
    }
  };

  const logout = () => {
    authApi.logout(); // clears JWT from localStorage
    setIsAuthenticated(false);
    setCurrentUser(mockUsers[0]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        isAuthenticated,
        isLoading,
        isDemoMode,
        isOffline,
        setDemoMode,
        toggleDemoMode,
        login,
        loginAsDemoUser,
        switchRole,
        logout,
        demoUsers: mockUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
