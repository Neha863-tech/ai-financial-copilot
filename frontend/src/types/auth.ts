export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  whatsappOptIn: boolean;
  role: 'user' | 'admin' | string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}
