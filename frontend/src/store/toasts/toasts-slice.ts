/**
 * @file src/store/toasts/toasts-slcie.ts
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IToast } from "@/lib/types";

interface IToastsState {
  records: IToast[];
}

const initialState: IToastsState = {
  records: [],
};

const toastsSlice = createSlice({
  name: "toasts",
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<IToast>) => {
      state.records.push({
        /**
         * Modern browsers have a built-in method called crypto.randomUUID().
         * It generates a 36-character string that is just as reliable as nanoid
         * for client-side IDs.
         */
        id: window.crypto.randomUUID(),
        type: action.payload.type,
        title: action.payload.title || action.payload.type,
        message: action.payload.message,
      });
    },
    removeToast: (state, action) => {
      state.records = state.records.filter(
        (record) => record.id !== action.payload,
      );
    },
  },
});

export const { addToast, removeToast } = toastsSlice.actions;

export default toastsSlice.reducer;
