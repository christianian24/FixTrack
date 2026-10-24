/**
 * AuthContext — connects to the real FastAPI backend.
 *
 * Supports:
 *  - Real email/password login via POST /api/v1/auth/login
 *  - Approved real-user demo login via POST /api/v1/auth/demo-login
 *  - Persists JWT in localStorage via the api/client helper
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { User, UserRole } from '../types/user';
import { DemoAccount, demoAccounts } from '../data/demoAccounts';
import { authApi, MeResponse, RegisterRequest } from '../services/api/authApi';
import { usersApi } from '../services/api/adminApi';
import { clearToken, getToken } from '../services/api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
  /** Authenticate as an approved real database user through the demo endpoint */
  loginWithDemoAccount: (userId: string) => Promise<void>;
  logout: () => void;
  demoAccounts: DemoAccount[];
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EMPTY_USER: User = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  role: 'REPORTER',
  userType: 'STUDENT',
  status: 'INACTIVE',
  createdAt: '',
  updatedAt: '',
};

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
    status: me.is_active ? 'ACTIVE' : 'INACTIVE',
    isOnline: me.is_online,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>(EMPTY_USER);

  // ── On mount: try to hydrate from existing token ─────────────────────────

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      const token = getToken();
      if (token) {
        try {
          const me = await authApi.me();
          const user = mapMe(me);
          if (cancelled) return;
          setCurrentUser(user);
          setIsAuthenticated(true);
        } catch {
          clearToken();
          if (cancelled) return;
          setIsAuthenticated(false);
        }
      }
      if (!cancelled) setIsLoading(false);
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !currentUser.id) return;

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;
    const sendHeartbeat = async () => {
      try {
        await usersApi.heartbeat();
      } catch (error) {
        console.warn('Presence heartbeat failed; it will retry.', error);
      }
      if (!cancelled) {
        timeout = setTimeout(() => void sendHeartbeat(), 15_000);
      }
    };

    void sendHeartbeat();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [currentUser.id, isAuthenticated]);

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Login with email and password through the backend.
   */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const trimmed = email.trim().toLowerCase();
      await authApi.login({ email: trimmed, password });
      const me = await authApi.me();
      const user = mapMe(me);
      setCurrentUser(user);
      setIsAuthenticated(true);
    },
    []
  );

  const register = useCallback(
    async (data: RegisterRequest): Promise<void> => {
      await authApi.register(data);
      const me = await authApi.me();
      const user = mapMe(me);
      setCurrentUser(user);
      setIsAuthenticated(true);
    },
    []
  );

  const refreshCurrentUser = useCallback(async (): Promise<void> => {
    const me = await authApi.me();
    const user = mapMe(me);
    setCurrentUser(user);
    setIsAuthenticated(true);
  }, []);

  const loginWithDemoAccount = useCallback(async (userId: string): Promise<void> => {
    await authApi.loginDemo(userId);
    try {
      setCurrentUser(mapMe(await authApi.me()));
      setIsAuthenticated(true);
    } catch (error) {
      authApi.logout();
      throw error;
    }
  }, []);

  const logout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    setCurrentUser(EMPTY_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        isAuthenticated,
        isLoading,
        login,
        register,
        refreshCurrentUser,
        loginWithDemoAccount,
        logout,
        demoAccounts,
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
