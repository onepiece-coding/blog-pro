import { clearUsersError, updateUserProfile } from "@/store/users/users-slice";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/forms";
import { Heading } from "@/components/common";
import { useDocumentTitle } from "@/hooks";
import { Link } from "react-router-dom";
import {
  selectUpdateUserProfileStatus,
  selectUpdateUserProfileError,
} from "@/store/users/users-selectors";
import { useEffect } from "react";
import {
  updateUserProfileSchema,
  type TUpdateUserInput,
  type TUpdateUserOutput,
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
import { addToast } from "@/store/toasts/toasts-slice";

const FORM_ID = "update-user-profile-form";

const UpdateUserProfile = () => {
  useDocumentTitle("Blog Pro - Update User Profile");

  const { userId } = useParams();

  const status = useAppSelector(selectUpdateUserProfileStatus);
  const error = useAppSelector(selectUpdateUserProfileError);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const prefilleds =
    (location.state as { username?: string; bio?: string }) ?? null;

  const updateUserProfileForm = useForm<
    TUpdateUserInput,
    unknown,
    TUpdateUserOutput
  >({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      username: prefilleds?.username ?? "",
      bio: prefilleds?.bio ?? "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<TUpdateUserOutput> = async (data) => {
    if (!userId) return;

    try {
      const body: Partial<Record<string, string>> = {};

      if (data.password) body.password = data.password;
      if (data.username) body.username = data.username;
      if (data.bio) body.bio = data.bio;

      await dispatch(updateUserProfile({ userId, body })).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "Successful update your user profile",
        }),
      );
      updateUserProfileForm.reset();
      navigate(`/users/${userId}/user-profile`, { replace: true });
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update user profile failed:", error);
      }
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearUsersError("updateUserProfile"));
    };
  }, [dispatch]);

  return (
    <section
      aria-labelledby="update-user-profile-heading"
      className="my-3"
      role="region"
    >
      <Container>
        <Row>
          <Col lg={{ span: "8", offset: "2" }}>
            <Card className="viewport-card">
              <Card.Header>
                <Heading
                  id="update-user-profile-heading"
                  title="Update User Profile"
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
                  onSubmit={updateUserProfileForm.handleSubmit(onSubmit)}
                  aria-labelledby="update-user-profile-heading"
                  id={FORM_ID}
                  noValidate
                >
                  <FormField<TUpdateUserInput, "username", TUpdateUserOutput>
                    placeholder="Username"
                    control={updateUserProfileForm.control}
                    formId={FORM_ID}
                    label="Username"
                    name="username"
                    type="text"
                  />

                  <FormField<TUpdateUserInput, "bio", TUpdateUserOutput>
                    placeholder="Bio"
                    control={updateUserProfileForm.control}
                    formId={FORM_ID}
                    label="Bio"
                    name="bio"
                    type="text"
                  />

                  <FormField
                    placeholder="Password"
                    control={updateUserProfileForm.control}
                    label="Password"
                    formId={FORM_ID}
                    name="password"
                    type="password"
                  />

                  <FormField
                    control={updateUserProfileForm.control}
                    placeholder="Confirm Password"
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
                          aria-label="Update user profile"
                          animation="border"
                          role="status"
                          size="sm"
                        />{" "}
                        Updating...
                      </>
                    ) : (
                      "Update"
                    )}
                  </Button>
                </Form>
              </Card.Body>

              <Card.Footer>
                <Link
                  className="text-decoration-none"
                  aria-label="Update user profile"
                  to={`/users/${userId}/user-profile`}
                >
                  Go back to your profile?
                </Link>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default UpdateUserProfile;
