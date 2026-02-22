/**
 * @file src/pages/auth/email-verification/index.tsx
 */

import { clearAuthError, emailVerification } from "@/store/auth/auth-slice";
import { Loading, LottieHandler } from "@/components/feedback";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Heading } from "@/components/common";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import {
  selectEmailVerificationError,
  selectEmailVerificationStatus,
} from "@/store/auth/auth-selectors";
import { useEffect } from "react";

const EmailVerification = () => {
  const { userId, token } = useParams();

  const status = useAppSelector(selectEmailVerificationStatus);
  const error = useAppSelector(selectEmailVerificationError);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userId || !token) {
      console.error("Missing userId or token in URL");
      return;
    }

    const promise = dispatch(emailVerification({ userId, token }));

    return () => {
      dispatch(clearAuthError("emailVerification"));
      promise.abort();
    };
  }, [userId, token, dispatch]);

  return (
    <>
      <title>OP-Blog - Email Verification</title>
      <section
        className={"d-flex align-items-center h-100"}
        aria-labelledby="email-verification-heading"
        role="region"
      >
        <Container>
          <Heading
            id="email-verification-heading"
            title="Email Verification"
            srOnly={true}
          />
          <Loading status={status} error={error}>
            <LottieHandler
              message="Your account has been verified successfully"
              title="Email Verification Success"
              className="text-info mt-3 mb-0"
              type="lottie-success"
            />
          </Loading>
        </Container>
      </section>
    </>
  );
};

export default EmailVerification;
