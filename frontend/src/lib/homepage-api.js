import API_BASE_URL from '../config';
import { readJsonResponse } from './http';

export const normalizeEventsResponse = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.events)) return payload.events;
  return [];
};

export const normalizeTeamResponse = (payload) => {
  if (!Array.isArray(payload)) return [];

  return payload.map((member) => ({
    ...member,
    bio: member.bio || '',
    category: typeof member.category === 'string' ? member.category.toLowerCase() : '',
    linkedin: member.linkedin || member.socials?.linkedin || '',
    instagram: member.instagram || member.socials?.instagram || '',
  }));
};

export const fetchHomepageJson = async (path, options = {}) => {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, options);
  const data = await readJsonResponse(response, url);

  if (!response.ok) {
    throw new Error(data?.message || `Request to ${url} failed with HTTP ${response.status}.`);
  }

  return data;
};
