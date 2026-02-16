/**
 * @file src/pages/auth/register-user/index.tsx
 */

import { clearAuthError, registerUser } from "@/store/auth/auth-slice";
import { registerSchema, type TRegisterSchema } from "@/validations";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToast } from "@/store/toasts/toasts-slice";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/forms";
import { Heading } from "@/components/common";
import {
  selectIsAuthenticated,
  selectRegisterError,
  selectRegisterStatus,
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

const FORM_ID = "register-user-form";

const RegisterUser = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const status = useAppSelector(selectRegisterStatus);
  const error = useAppSelector(selectRegisterError);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const registerForm = useForm<TRegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<TRegisterSchema> = async (data) => {
    const { username, email, password } = data;

    try {
      await dispatch(registerUser({ username, email, password })).unwrap();

      dispatch(
        addToast({
          type: "success",
          message:
            "We sent a verification link to your email, please verify your email address",
        }),
      );
      registerForm.reset();
      navigate("/auth/login", {
        replace: true, // Prevent back button to registration
        state: { email }, // Pre-fill email in login form
      });
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Registration failed:", error);
      }

      registerForm.setFocus("email");
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearAuthError("register"));
    };
  }, [dispatch]);

  if (isAuthenticated) return <Navigate to={"/"} />;

  return (
    <>
      <title>Blog Pro - Register User</title>
      <section
        className="my-3"
        aria-labelledby="register-heading"
        role="region"
      >
        <Container>
          <Row>
            <Col lg={{ span: "8", offset: "2" }}>
              <Card className="viewport-card">
                <Card.Header>
                  <Heading
                    id="register-heading"
                    title="Sign Up To Your Account"
                  />
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
                    onSubmit={registerForm.handleSubmit(onSubmit)}
                    aria-labelledby="register-heading"
                    id={FORM_ID}
                    noValidate
                  >
                    <FormField
                      placeholder="Choose a unique username"
                      control={registerForm.control}
                      label="Username"
                      formId={FORM_ID}
                      name="username"
                    />

                    <FormField
                      placeholder="your.email@example.com"
                      control={registerForm.control}
                      formId={FORM_ID}
                      label="Email"
                      name="email"
                      type="email"
                    />

                    <FormField
                      placeholder="Minimum 8 characters"
                      control={registerForm.control}
                      label="Password"
                      formId={FORM_ID}
                      name="password"
                      type="password"
                    />

                    <FormField
                      placeholder="Re-enter your password"
                      control={registerForm.control}
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
                            aria-label="Registering account"
                            animation="border"
                            role="status"
                            size="sm"
                          />{" "}
                          Registering...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </Form>
                </Card.Body>

                <Card.Footer>
                  <Link
                    className="text-decoration-none"
                    aria-label="Already have an account"
                    to="/auth/login"
                  >
                    Already have an account?
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

export default RegisterUser;
