import {
  loginSchema,
  type TLoginSchema,
  registerSchema,
  type TRegisterSchema,
} from "./auth-schemas";

import {
  resetPasswordSchema,
  type TResetPasswordSchema,
  sendResetPasswordLinkSchema,
  type TSendResetPasswordLinkSchema,
} from "./password-schemas";

import {
  createPostSchema,
  type TCreatePostSchema,
  updatePostSchema,
  type TUpdatePostSchema,
  type TUpdatePostOutput,
  type TUpdatePostInput,
  filtrationSchema,
  type TFiltrationSchema,
} from "./posts-schemas";

import {
  updateUserProfileSchema,
  type TUpdateUserProfileSchema,
  type TUpdateUserInput,
  type TUpdateUserOutput,
} from "./users-schemas";

import { commentsSchema, type TCommentsSchema } from "./comments-schemas";

import {
  createCategorySchema,
  type TCreateCategorySchema,
} from "./categories-schemas";

export {
  loginSchema,
  type TLoginSchema,
  registerSchema,
  type TRegisterSchema,
  resetPasswordSchema,
  type TResetPasswordSchema,
  sendResetPasswordLinkSchema,
  type TSendResetPasswordLinkSchema,
  createPostSchema,
  type TCreatePostSchema,
  updatePostSchema,
  type TUpdatePostSchema,
  type TUpdatePostOutput,
  type TUpdatePostInput,
  filtrationSchema,
  type TFiltrationSchema,
  updateUserProfileSchema,
  type TUpdateUserProfileSchema,
  type TUpdateUserInput,
  type TUpdateUserOutput,
  commentsSchema,
  type TCommentsSchema,
  createCategorySchema,
  type TCreateCategorySchema,
};
