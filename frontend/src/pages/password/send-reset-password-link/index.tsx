import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/forms";
import { Heading } from "@/components/common";
import { useDocumentTitle } from "@/hooks";
import { useEffect } from "react";
import {
  type TSendResetPasswordLinkSchema,
  sendResetPasswordLinkSchema,
} from "@/validations";
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
import {
  selectSendResetPasswordLinkError,
  selectSendResetPasswordLinkStatus,
} from "@/store/password/password-selectors";
import {
  clearPasswordError,
  sendResetPasswordLink,
} from "@/store/password/password-slice";
import { addToast } from "@/store/toasts/toasts-slice";

const FORM_ID = "send-reset-password-link-form";

const SendResetPasswordLink = () => {
  useDocumentTitle("Blog Pro - Send The Password Reset Link");

  const status = useAppSelector(selectSendResetPasswordLinkStatus);
  const error = useAppSelector(selectSendResetPasswordLinkError);

  const dispatch = useAppDispatch();

  const sendResetPasswordLinkForm = useForm<TSendResetPasswordLinkSchema>({
    resolver: zodResolver(sendResetPasswordLinkSchema),
    defaultValues: {
      email: "",
    },
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<TSendResetPasswordLinkSchema> = async (
    data,
  ) => {
    try {
      await dispatch(sendResetPasswordLink(data)).unwrap();

      dispatch(
        addToast({
          type: "success",
          message:
            "Password reset link has been sent to your email, please check your inbox",
        }),
      );
      sendResetPasswordLinkForm.reset();
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Send Reset Password Link:", error);
      }
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearPasswordError("sendResetPasswordLink"));
    };
  }, [dispatch]);

  return (
    <section
      aria-labelledby="send-reset-password-link-heading"
      className="my-3"
      role="region"
    >
      <Container>
        <Row>
          <Col lg={{ span: "8", offset: "2" }}>
            <Card className="viewport-card">
              <Card.Header>
                <Heading
                  id="send-reset-password-link-heading"
                  title="Send the password reset link"
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
                  onSubmit={sendResetPasswordLinkForm.handleSubmit(onSubmit)}
                  aria-labelledby="send-reset-password-link-heading"
                  id={FORM_ID}
                  noValidate
                >
                  <FormField
                    placeholder="your.email@example.com"
                    control={sendResetPasswordLinkForm.control}
                    formId={FORM_ID}
                    label="Email"
                    name="email"
                    type="email"
                  />

                  <Button
                    aria-busy={status === "pending"}
                    disabled={status === "pending"}
                    type="submit"
                  >
                    {status === "pending" ? (
                      <>
                        <Spinner
                          aria-label="Sending the password reset link"
                          animation="border"
                          role="status"
                          size="sm"
                        />{" "}
                        Sending the password reset link...
                      </>
                    ) : (
                      "Send the password reset link"
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default SendResetPasswordLink;
