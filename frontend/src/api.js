const API_BASE = '/api';

function getHeaders(includeJson = true) {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (includeJson) headers['Content-Type'] = 'application/json';
  return headers;
}

export async function register(data) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Registration failed');
  return json;
}

export async function login(data) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Login failed');
  return json;
}

export async function createExam(data) {
  const res = await fetch(`${API_BASE}/exams`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create exam');
  return json;
}

export async function getExams() {
  const res = await fetch(`${API_BASE}/exams`, { headers: getHeaders(false) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch exams');
  return json;
}

export async function getExam(examId) {
  const res = await fetch(`${API_BASE}/exams/${examId}`, { headers: getHeaders(false) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch exam');
  return json;
}

export async function getExamResults(examId) {
  const res = await fetch(`${API_BASE}/exams/${examId}/results`, { headers: getHeaders(false) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch results');
  return json;
}

export async function joinExam(examId, password) {
  const res = await fetch(`${API_BASE}/exams/${examId}/join`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to join exam');
  return json;
}

export async function saveAnswers(examId, answers) {
  const res = await fetch(`${API_BASE}/exams/${examId}/answers`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ answers }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to save answers');
  return json;
}

export async function reportCheat(examId, eventType, screenshotBlob = null) {
  const formData = new FormData();
  formData.append('eventType', eventType);
  if (screenshotBlob) formData.append('screenshot', screenshotBlob, 'screenshot.png');

  const headers = {};
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/exams/${examId}/cheat`, {
    method: 'POST',
    headers,
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to report cheat');
  return json;
}

export async function submitExam(examId) {
  const res = await fetch(`${API_BASE}/exams/${examId}/submit`, {
    method: 'POST',
    headers: getHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to submit exam');
  return json;
}

export async function analyzeFrame(imageBase64) {
  const res = await fetch(`${API_BASE}/ai/analyze`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ image: imageBase64 }),
  });
  const json = await res.json();
  return json;
}
