import { api } from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserInfo {
  id: number;
  displayName: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: UserInfo;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/api/auth/login", credentials);
  return response.data;
}
