export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
export const IS_MOCK_FALLBACK_ENABLED = import.meta.env.VITE_ENABLE_MOCK_FALLBACK !== 'false';

let isBackendAlive = null;

export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      isBackendAlive = false;
      return { alive: false, url: API_BASE_URL };
    }
    const data = await res.json();
    isBackendAlive = true;
    return {
      alive: true,
      url: API_BASE_URL,
      groqConfigured: Boolean(data.groqConfigured),
      paypalConfigured: Boolean(data.paypalConfigured),
    };
  } catch (err) {
    isBackendAlive = false;
    return { alive: false, url: API_BASE_URL };
  }
}

export async function registerUser(payload) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (err.message) detail = err.message;
      else if (err.detail) detail = err.detail;
    } catch { }
    throw new Error(detail);
  }
  return await res.json();
}

export async function loginUser(payload) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (err.message) detail = err.message;
      else if (err.detail) detail = err.detail;
    } catch { }
    throw new Error(detail);
  }
  return await res.json();
}

export async function requestOTP(payload) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/otp/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (err.message) detail = err.message;
    } catch { }
    throw new Error(detail);
  }
  return await res.json();
}

export async function verifyOTP(payload) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (err.message) detail = err.message;
    } catch { }
    throw new Error(detail);
  }
  return await res.json();
}

export async function getMyProfile(token) {
  const res = await fetch(`${API_BASE_URL}/api/v1/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}
