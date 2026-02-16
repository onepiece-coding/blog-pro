/**
 * @file src/hooks/useDocumentTitle.ts
 */

import { useEffect } from "react";

export const useDocumentTitle = (title: string) => {
  console.log("useDocumentTitle on fire...");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};
