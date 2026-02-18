/**
 * @file src/pages/password/get-reset-password-link/index.tsx
 */

import { Loading, LottieHandler } from "@/components/feedback";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useNavigate, useParams } from "react-router-dom";
import { Heading } from "@/components/common";
import {
  selectGetResetPasswordLinkError,
  selectGetResetPasswordLinkStatus,
} from "@/store/password/password-selectors";
import { Container } from "react-bootstrap";
import {
  clearPasswordError,
  getResetPasswordLink,
} from "@/store/password/password-slice";
import { useEffect } from "react";

const GetResetPasswordLink = () => {
  const { userId, token } = useParams();

  const status = useAppSelector(selectGetResetPasswordLinkStatus);
  const error = useAppSelector(selectGetResetPasswordLinkError);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || !token) {
      console.error("Missing userId or token in URL");
      return;
    }

    let timeoutId: number;

    dispatch(getResetPasswordLink({ userId, token }))
      .unwrap()
      .then(() => {
        timeoutId = setTimeout(() => {
          navigate(`/password/reset-password/${userId}/${token}`);
        }, 3000);
      })
      .catch();

    return () => {
      dispatch(clearPasswordError("getResetPasswordLink"));
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [userId, token, dispatch, navigate]);

  return (
    <>
      <title>Blog Pro - Get The Password Reset Link</title>

      <section
        className={"d-flex align-items-center h-100"}
        aria-labelledby="get-reset-password-link-heading"
        role="region"
      >
        <Container>
          <Heading
            id="get-reset-password-link-heading"
            title="Get the password reset link"
            srOnly={true}
          />
          <Loading status={status} error={error}>
            <LottieHandler
              message="Used url has been verified successfully"
              className="text-info mt-3 mb-0"
              type="lottie-success"
              title="Valid url"
            />
          </Loading>
        </Container>
      </section>
    </>
  );
};

export default GetResetPasswordLink;
