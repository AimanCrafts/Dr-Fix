import api from "./axios";

export const listAddresses = () => api.get("/addresses");

export const createAddress = ({ label, detail }) =>
  api.post("/addresses", { label, detail });

export const updateAddress = (id, { label, detail }) =>
  api.put(`/addresses/${id}`, { label, detail });

export const makeAddressDefault = (id) => api.post(`/addresses/${id}/default`);

export const deleteAddress = (id) => api.delete(`/addresses/${id}`);
