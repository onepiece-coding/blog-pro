/**
 * @file src/pages/password/reset-password/index.tsx
 */

import { type TResetPasswordSchema, resetPasswordSchema } from "@/validations";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/forms";
import { Heading } from "@/components/common";
import {
  selectResetPasswordError,
  selectResetPasswordStatus,
} from "@/store/password/password-selectors";
import {
  clearPasswordError,
  resetPassword,
} from "@/store/password/password-slice";
import { useEffect } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { addToast } from "@/store/toasts/toasts-slice";

const FORM_ID = "reset-password-form";

const ResetPassword = () => {
  const { userId, token } = useParams();

  const status = useAppSelector(selectResetPasswordStatus);
  const error = useAppSelector(selectResetPasswordError);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const resetPasswordForm = useForm<TResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<TResetPasswordSchema> = async (data) => {
    if (!userId || !token) {
      console.error("Missing userId or token in URL");
      return;
    }

    try {
      await dispatch(
        resetPassword({
          authInfo: { userId, token },
          formData: { password: data.password },
        }),
      ).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "Passsword has been reset successfully, please log in",
        }),
      );
      resetPasswordForm.reset();
      navigate("/auth/login", { replace: true });
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Reset Password:", error);
      }
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearPasswordError("resetPassword"));
    };
  }, [dispatch]);

  return (
    <>
      <title>Blog Pro - Reset Password</title>

      <section
        aria-labelledby="reset-password-heading"
        className="my-3"
        role="region"
      >
        <Container>
          <Row>
            <Col lg={{ span: "8", offset: "2" }}>
              <Card className="viewport-card">
                <Card.Header>
                  <Heading id="reset-password-heading" title="Reset Password" />
                </Card.Header>

                <Card.Body>
                  {error && (
                    <Alert
                      className="text-center"
                      aria-live="assertive"
                      variant="danger"
                      role="alert"
                    >
                      {error}
                    </Alert>
                  )}

                  <Form
                    onSubmit={resetPasswordForm.handleSubmit(onSubmit)}
                    aria-labelledby="reset-password-heading"
                    id={FORM_ID}
                    noValidate
                  >
                    <FormField
                      placeholder="Minimum 8 characters"
                      control={resetPasswordForm.control}
                      formId={FORM_ID}
                      label="Password"
                      name="password"
                      type="password"
                    />

                    <FormField
                      placeholder="Re-enter your password"
                      control={resetPasswordForm.control}
                      label="Confirm Password"
                      name="confirmPassword"
                      formId={FORM_ID}
                      type="password"
                    />

                    <Button
                      aria-busy={status === "pending"}
                      disabled={status === "pending"}
                      type="submit"
                    >
                      {status === "pending" ? (
                        <>
                          <Spinner
                            aria-label="Resetting the password"
                            animation="border"
                            role="status"
                            size="sm"
                          />{" "}
                          Resetting the password...
                        </>
                      ) : (
                        "Reset the password"
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default ResetPassword;
