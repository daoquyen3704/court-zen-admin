import axiosClient from "./axiosClient";

export const authApi = {
  login: (data: { email: string; password: string }) => axiosClient.post("login", data),
  logout: () => axiosClient.post("logout"),
};
