import axios from "axios";

const authApi = axios.create({
  baseURL:
    "http://localhost:3000/api/auth",

  withCredentials: true,
});

export interface AuthPayload {
  username: string;
  password: string;
}

export const signup = async (
  data: AuthPayload
) => {
  const response =
    await authApi.post(
      "/signup",
      data
    );

  return response.data;
};

export const login = async (
  data: AuthPayload
) => {
  const response =
    await authApi.post(
      "/login",
      data
    );

  return response.data;
};

export const logout =
  async () => {
    const response =
      await authApi.post(
        "/logout"
      );

    return response.data;
  };