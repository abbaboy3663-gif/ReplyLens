
// Mock Authentication Service using LocalStorage
// Replaces the Supabase client to avoid backend dependencies for now.

const USERS_KEY = 'replylens_users_db';
const SESSION_KEY = 'replylens_session_active';

export interface UserSession {
  id: string;
  email: string;
  isPro: boolean;
  isAdmin?: boolean;
}

export const authService = {
  /**
   * Register a new user in local storage
   */
  async signUp(email: string, password: string): Promise<{ user?: UserSession; error?: { message: string } }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      return { error: { message: 'این ایمیل قبلاً ثبت شده است.' } };
    }

    const newUser = { 
      id: crypto.randomUUID(), 
      email, 
      password, 
      isPro: false,
      isAdmin: email === 'admin@replylens.com' // Auto-grant admin to this specific email
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login after signup
    this.setSession(newUser);
    return { user: newUser };
  },

  /**
   * Sign in an existing user
   */
  async signIn(email: string, password: string): Promise<{ user?: UserSession; error?: { message: string } }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (!user) {
      return { error: { message: 'ایمیل یا رمز عبور اشتباه است.' } };
    }
    
    // Store session (exclude password)
    const sessionUser = { 
      id: user.id, 
      email: user.email, 
      isPro: user.isPro,
      isAdmin: user.isAdmin 
    };
    
    this.setSession(sessionUser);
    return { user: sessionUser };
  },

  /**
   * Sign out
   */
  async signOut() {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event('auth-change'));
  },

  /**
   * Get current active session
   */
  getSession(): UserSession | null {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  },

  /**
   * Internal helper to set session and notify app
   */
  setSession(user: any) {
    // Don't store password in session
    const { password, ...safeUser } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    window.dispatchEvent(new Event('auth-change'));
  },

  /**
   * Mock upgrade to Pro
   */
  async upgradeUserToPro() {
    const session = this.getSession();
    if (!session) return;
    
    // Update "Database"
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map((u: any) => 
      u.id === session.id ? { ...u, isPro: true } : u
    );
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

    // Update Current Session
    const updatedSession = { ...session, isPro: true };
    this.setSession(updatedSession);
  },

  /**
   * ADMIN ONLY: Get all users
   */
  getAllUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  },

  /**
   * ADMIN ONLY: Update specific user fields
   */
  async updateUser(userId: string, updates: Partial<UserSession>) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updatedUsers = users.map((u: any) => 
      u.id === userId ? { ...u, ...updates } : u
    );
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    
    // If updating current logged in user, update session too
    const currentSession = this.getSession();
    if (currentSession && currentSession.id === userId) {
      this.setSession({ ...currentSession, ...updates });
    }
  },

  /**
   * ADMIN ONLY: Delete a user
   */
  async deleteUser(userId: string) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const filteredUsers = users.filter((u: any) => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
  }
};
