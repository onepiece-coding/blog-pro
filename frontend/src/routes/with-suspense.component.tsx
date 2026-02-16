import { Spinner } from "react-bootstrap";
import { Suspense } from "react";

interface WithSuspenseProps {
  children: React.ReactNode;
  forMainLayout?: boolean;
}

export const WithSuspense = ({
  children,
  forMainLayout = false,
}: WithSuspenseProps) => (
  <Suspense
    fallback={
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: forMainLayout ? "100vh" : "100%" }}
      >
        <Spinner animation="border" variant="info" />
      </div>
    }
  >
    {children}
  </Suspense>
);
