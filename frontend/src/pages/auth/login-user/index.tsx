/**
 * @file src/pages/auth/login-user/index.tsx
 */

import { clearAuthError, loginUser } from "@/store/auth/auth-slice";
import { loginSchema, type TLoginSchema } from "@/validations";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { addToast } from "@/store/toasts/toasts-slice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate } from "react-router-dom";
import { FormField } from "@/components/forms";
import { Heading } from "@/components/common";
import {
  selectIsAuthenticated,
  selectLoginError,
  selectLoginStatus,
} from "@/store/auth/auth-selectors";
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

const FORM_ID = "login-user-form";

const LoginUser = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const status = useAppSelector(selectLoginStatus);
  const error = useAppSelector(selectLoginError);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract email from navigation state (set during registration)
  const prefilledEmail = (location.state as { email?: string })?.email ?? "";

  // Capture where users were trying to go
  const from = (location.state as { from?: string })?.from ?? "/";

  const loginForm = useForm<TLoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: prefilledEmail,
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<TLoginSchema> = async (data) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      dispatch(
        addToast({
          type: "success",
          message: "Successful login to your account",
        }),
      );
      loginForm.reset();
      navigate(from, { replace: true });
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Login failed:", error);
      }
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearAuthError("login"));
    };
  }, [dispatch]);

  if (isAuthenticated) return <Navigate to={"/"} />;

  return (
    <>
      <title>Blog Pro - Login User</title>
      <section className="my-3" aria-labelledby="login-heading" role="region">
        <Container>
          <Row>
            <Col lg={{ span: "8", offset: "2" }}>
              <Card className="viewport-card">
                <Card.Header>
                  <Heading id="login-heading" title="Sign In To Your Account" />
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
                    onSubmit={loginForm.handleSubmit(onSubmit)}
                    aria-labelledby="login-heading"
                    id={FORM_ID}
                    noValidate
                  >
                    <FormField
                      placeholder="your.email@example.com"
                      control={loginForm.control}
                      formId={FORM_ID}
                      label="Email"
                      name="email"
                      type="email"
                    />

                    <FormField
                      placeholder="Password"
                      control={loginForm.control}
                      label="Password"
                      formId={FORM_ID}
                      name="password"
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
                            aria-label="Registering account"
                            animation="border"
                            role="status"
                            size="sm"
                          />{" "}
                          Logging in...
                        </>
                      ) : (
                        "Log in"
                      )}
                    </Button>
                  </Form>
                </Card.Body>

                <Card.Footer>
                  <Link
                    className="text-decoration-none"
                    aria-label="Reset your password"
                    to="/password/send-reset-password-link"
                  >
                    Forgot password?
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default LoginUser;
