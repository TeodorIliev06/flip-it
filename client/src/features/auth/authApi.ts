const BASE_URL = "https://localhost:7299";
const API_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  GOOGLE_AUTH: "/auth/google",
  GITHUB_AUTH: "/auth/github",
  REFRESH: "/auth/refresh",
  LOGOUT: "/auth/logout",
  ME: "/me",
} as const;

const HTTP_HEADERS = {
  CONTENT_TYPE: "application/json",
} as const;

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid credentials",
  GOOGLE_SIGNIN_FAILED: "Google sign-in failed",
  GITHUB_SIGNIN_FAILED: "GitHub sign-in failed",
  REFRESH_FAILED: "Refresh failed",
  LOGOUT_FAILED: "Logout failed",
  UNAUTHORIZED: "Unauthorized",
} as const;

export type AuthResponse = {
  userId: number;
  email: string;
  accessToken: string;
  accessTokenExpiresAt: string;
};

export async function register(
  email: string,
  password: string
): Promise<{ id: number; email: string }> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.REGISTER}`, {
    method: "POST",
    headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.LOGIN}`, {
    method: "POST",
    headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  return res.json();
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.GOOGLE_AUTH}`, {
    method: "POST",
    headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    throw new Error(ERROR_MESSAGES.GOOGLE_SIGNIN_FAILED);
  }

  return res.json();
}

export async function loginWithGitHub(code: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.GITHUB_AUTH}`, {
    method: "POST",
    headers: { "Content-Type": HTTP_HEADERS.CONTENT_TYPE },
    credentials: "include",
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("GitHub login failed:", errorText);
    throw new Error(ERROR_MESSAGES.GITHUB_SIGNIN_FAILED);
  }

  return res.json();
}

export async function refresh(): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.REFRESH}`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(ERROR_MESSAGES.REFRESH_FAILED);
  }

  return res.json();
}

export async function me(
  accessToken: string
): Promise<{ userId: number; email: string }> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.ME}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  return res.json();
}

export async function logout(): Promise<void> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(ERROR_MESSAGES.LOGOUT_FAILED);
  }
}
