/**
 * @file src/services/auth-service.ts
 */

import type { IUser } from "@/lib/types";

const TOKEN_KEY = "access_token";
const USER_KEY = "user";

export const TokenService = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
};

export const UserService = {
  getUser: (): IUser | null => {
    const userFromLS = localStorage.getItem(USER_KEY);
    if (userFromLS) {
      return JSON.parse(userFromLS) as IUser;
    }
    return null;
  },
  setUser: (user: IUser): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },
};
