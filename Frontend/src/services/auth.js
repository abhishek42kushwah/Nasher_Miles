import { fetchJSON } from './api';
import { API_BASE_URL } from '../config';

export function login({ email, password }) {
  return fetchJSON(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function register({ name, email, password }) {
  return fetchJSON(`${API_BASE_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
}
