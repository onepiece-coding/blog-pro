/**
 * @file src/components/feedback/loading/index.tsx
 */

import type { TStatus } from "@/lib/types";
import { Spinner } from "react-bootstrap";

import LottieHandler from "../lottie-handler";

interface ILoadingProps {
  status: TStatus;
  error: null | string;
  children: React.ReactNode;
}

const Loading = ({ status, error, children }: ILoadingProps) => {
  /* if (state === "failed") {
    throw new Response(error, { status: 400 });
  } */
  return (
    <div aria-busy={status === "pending"} aria-live="polite">
      {status === "pending" && (
        <div className="text-center" role="status">
          <Spinner aria-label="Loding..." animation="border" variant="info" />
        </div>
      )}

      {status === "failed" && (
        <LottieHandler
          className="text-danger mt-3 mb-0"
          message={error ?? "Unknown error"}
          type="lottie-error"
          title="Error"
        />
      )}

      {status === "succeeded" && children}
    </div>
  );
};

export default Loading;
