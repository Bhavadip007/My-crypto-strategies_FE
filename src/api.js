import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  timeout: 30000,
});

async function withRetry(fn, retries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = err.response?.status;

      if (status && status < 500 && status !== 429) {
        throw err;
      }

      await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
    }
  }

  throw lastError;
}

export const getSettings = async () => {
  const { data } = await withRetry(() => API.get("/settings"));
  return data;
};

export const getSymbols = async () => {
  const { data } = await withRetry(() => API.get("/settings/symbols"));
  return data.symbols;
};

export const getSignalStatus = async () => {
  const { data } = await API.get("/settings/signal");
  return data;
};

export const updateSettings = async (payload) => {
  const { data } = await withRetry(() => API.post("/settings", payload));
  return data;
};
