import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
});

export const getSettings = async () => {
  const { data } = await API.get("/settings");
  return data;
};

export const getSymbols = async () => {
  const { data } = await API.get("/settings/symbols");
  return data.symbols;
};

export const updateSettings = async (payload) => {
  const { data } = await API.put(
    "/settings",
    payload
  );

  return data;
};