import api from "./api";

export const getStates = () => api.get("/locations/states");

export const getDistricts = (stateId) =>
  api.get(`/locations/states/${stateId}/districts`);

export const getTalukas = (districtId) =>
  api.get(`/locations/districts/${districtId}/talukas`);

export const getVillages = (talukaId) =>
  api.get(`/locations/talukas/${talukaId}/villages`);
