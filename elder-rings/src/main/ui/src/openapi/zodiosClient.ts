import { createApiClient } from "./openapizod";

export const apiClient = createApiClient("/", {
  axiosConfig: {
    headers: { "X-Requested-With": "Javascript" },
    timeout: 20000,
  },
});
