/**
 * @file src/lib/types.ts
 */

export type TStatus = "idle" | "pending" | "succeeded" | "failed";

// don't return boolean => return value is string if the condtion is true
export const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

export interface ICategory {
  title: string;
  _id: string;
}

export interface IImage {
  publicId: string | null;
  url: string;
}

export interface IPost {
  categoryId: ICategory;
  description: string;
  createdAt: string;
  likes: string[];
  image: IImage;
  title: string;
  _id: string;
  user: IUser;
}

export interface IUser {
  profilePhoto: IImage;
  createdAt: string;
  isAdmin: boolean;
  username: string;
  posts: IPost[];
  email: string;
  _id: string;
  bio: string;
}

export interface IComment {
  createdAt: string;
  text: string;
  _id: string;
  user: IUser;
}

export interface IInfo {
  categories: number;
  comments: number;
  users: number;
  posts: number;
}

export interface IToast {
  type: "primary" | "success" | "warning" | "danger";
  title?: string | null;
  message: string;
  id?: string;
}
