const API_URL = "/api";

const request = async (url, options = {}) => {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
};

export const getProfiles = () => {
  return request("/profiles");
};

export const createProfile = (profile) => {
  return request("/profiles", {
    method: "POST",
    body: JSON.stringify(profile),
  });
};

export const updateProfile = (profileId, profileData) => {
  return request(`/profiles/${profileId}`, {
    method: "PATCH",
    body: JSON.stringify(profileData),
  });
};

export const getEvents = (profileId) => {
  const query = profileId
    ? `?profileId=${encodeURIComponent(profileId)}`
    : "";

  return request(`/events${query}`);
};

export const createEvent = (event) => {
  return request("/events", {
    method: "POST",
    body: JSON.stringify(event),
  });
};

export const updateEvent = (id, event) => {
  return request(`/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(event),
  });
};

export const getEventLogs = (id) => {
  return request(`/events/${id}/logs`);
};