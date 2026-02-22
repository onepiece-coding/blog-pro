/**
 * @file src/pages/error-element/index.tsx
 */

import { isRouteErrorResponse, useRouteError } from "react-router";
import { LottieHandler } from "@/components/feedback";
import { Heading } from "@/components/common";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const ErrorElement = () => {
  const error = useRouteError();

  let errorStatus: number | string = 500;
  let errorStatusText: string = "Something went wrong";

  // Case A: Error thrown from a Loader/Action (Standard React Router error)
  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorStatusText = error.statusText;
  }

  // Case B: Raw Response thrown from a Component (Loading component)
  else if (error instanceof Response) {
    errorStatus = error.status;
    errorStatusText = error.statusText || "Server Error";
  }

  // Case C: Standard JS Error (e.g., a code crash)
  else if (error instanceof Error) {
    errorStatus = "App Error";
    errorStatusText = error.message;
  }

  useEffect(() => {
    if (error instanceof Error && import.meta.env.MODE === "development") {
      console.error("Uncaught App Error:", error);
    }
  }, [error]);

  return (
    <>
      <title>OP-Blog - Error Element</title>

      <section
        className={"d-flex align-items-center vh-100"}
        aria-labelledby="error-element-heading"
        role="region"
      >
        <Container>
          <Heading
            id="error-element-heading"
            title={`${errorStatus} | ${errorStatusText}`}
            srOnly={true}
          />
          <LottieHandler
            message={`${errorStatus} | ${errorStatusText}`}
            className="text-danger mt-3 mb-0"
            title={errorStatusText}
            type="lottie-error"
          />
          <p className="text-center mb-0">
            <Link className="link-opacity-100" to={"/"}>
              Go back to safety
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
};

export default ErrorElement;
