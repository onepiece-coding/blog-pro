import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { logout } from "@/store/auth/auth-slice";
import { Loading } from "@/components/feedback";
import { Heading } from "@/components/common";
import { formatTimeAgo } from "@/lib/utils";
import { useDocumentTitle } from "@/hooks";
import { Link } from "react-router-dom";
import {
  selectGetUserProfileStatus,
  selectGetUserProfileError,
  selectGetUserProfileUser,
  selectUpdateProfilePhotoError,
  selectUpdateProfilePhotoStatus,
  selectDeleteUserProfileStatus,
  selectDeleteUserProfileError,
} from "@/store/users/users-selectors";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/store/auth/auth-selectors";
import {
  clearUsersError,
  deleteUserProfile,
  getUserProfile,
  updateProfilePhoto,
  usersCleanUp,
} from "@/store/users/users-slice";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Row,
  Spinner,
} from "react-bootstrap";

import styles from "./styles.module.css";
import { addToast } from "@/store/toasts/toasts-slice";

const { userProfilePhotoContainer, userProfilePhoto, userInfoList } = styles;

const UserProfile = () => {
  useDocumentTitle("Blog Pro - Get User Profile");

  const { userId } = useParams();

  const [preview, setPreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  const getUserProfileStatus = useAppSelector(selectGetUserProfileStatus);
  const getUserProfileError = useAppSelector(selectGetUserProfileError);
  const getUserProfileUser = useAppSelector(selectGetUserProfileUser);

  const updateProfilePhotoStatus = useAppSelector(
    selectUpdateProfilePhotoStatus,
  );
  const updateProfilePhotoError = useAppSelector(selectUpdateProfilePhotoError);

  const deleteUserProfileStatus = useAppSelector(selectDeleteUserProfileStatus);
  const deleteUserProfileError = useAppSelector(selectDeleteUserProfileError);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      setImage(selectedFile);
      const imageUrl = URL.createObjectURL(selectedFile);
      setPreview(imageUrl);
    }
  };

  const saveImage = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);

    try {
      await dispatch(updateProfilePhoto(formData)).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "your profile photo uploaded successfully",
        }),
      );
      setPreview(null);
      setImage(null);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update profile photo failed:", error);
      }
    }
  };

  const cancelImageUpload = () => {
    setPreview(null);
    setImage(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  const deleteProfile = async () => {
    if (!userId) return;

    const confirm = window.confirm(
      "Are you sure you want to delete your account?",
    );

    if (confirm) {
      try {
        await dispatch(deleteUserProfile(userId)).unwrap();
        dispatch(
          addToast({
            type: "success",
            message: "Your profile has been deleted",
          }),
        );
        handleLogout();
      } catch (error) {
        if (import.meta.env.MODE === "development") {
          console.error("Delete user profile failed:", error);
        }
      }
    }
  };

  useEffect(() => {
    if (!userId) return;
    const promise = dispatch(getUserProfile(userId));
    return () => {
      promise.abort();
      dispatch(usersCleanUp());
      dispatch(clearUsersError("deleteUserProfile"));
      dispatch(clearUsersError("updateProfilePhoto"));
    };
  }, [dispatch, userId]);

  return (
    <section
      className="my-3"
      aria-labelledby="user-profile-heading"
      role="region"
    >
      <Container>
        <Heading id="user-profile-heading" title="User Profile" srOnly={true} />
        <Loading status={getUserProfileStatus} error={getUserProfileError}>
          <Row>
            <Col md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
              <Card className="viewport-card">
                <Card.Header>
                  <div className="d-flex flex-column gap-2 flex-sm-row justify-content-between align-items-center">
                    <p className="mb-0">
                      Welcome {getUserProfileUser?.username}
                    </p>
                    {isAuthenticated &&
                      currentUser?._id === getUserProfileUser?._id && (
                        <Link
                          to={`/users/${getUserProfileUser?._id}/update-user-profile`}
                          className="text-decoration-none"
                          aria-label="Update User Profile"
                          state={{
                            username: getUserProfileUser?.username,
                            bio: getUserProfileUser?.bio,
                          }}
                        >
                          Update Profile
                        </Link>
                      )}
                  </div>
                </Card.Header>
                <Card.Body>
                  {updateProfilePhotoError && (
                    <Alert
                      className="text-center"
                      aria-live="assertive"
                      variant="danger"
                      role="alert"
                    >
                      {updateProfilePhotoError}
                    </Alert>
                  )}

                  {deleteUserProfileError && (
                    <Alert
                      className="text-center"
                      aria-live="assertive"
                      variant="danger"
                      role="alert"
                    >
                      {deleteUserProfileError}
                    </Alert>
                  )}

                  <div className="d-flex flex-column gap-3 flex-sm-row align-items-center text-center text-sm-start">
                    <div className={userProfilePhotoContainer}>
                      {isAuthenticated &&
                        currentUser?._id === getUserProfileUser?._id &&
                        (!image ? (
                          <>
                            <label htmlFor="profile-photo">change</label>
                            <input
                              onChange={handleImageChange}
                              className="d-none"
                              id="profile-photo"
                              accept="image/*"
                              type="file"
                            />
                          </>
                        ) : (
                          <>
                            <Button onClick={cancelImageUpload}>Cancel</Button>
                          </>
                        ))}
                      <img
                        src={preview ?? getUserProfileUser?.profilePhoto.url}
                        alt={getUserProfileUser?.username}
                        className={userProfilePhoto}
                      />
                    </div>
                    <ul className={userInfoList}>
                      <li>Username: {getUserProfileUser?.username}</li>
                      <li>Email: {getUserProfileUser?.email}</li>
                      {getUserProfileUser?.bio && (
                        <li>Bio: {getUserProfileUser.bio}</li>
                      )}
                      <li>
                        Join Us:{" "}
                        {formatTimeAgo(getUserProfileUser?.createdAt || "")}
                      </li>
                    </ul>
                  </div>
                </Card.Body>
                <Card.Footer>
                  <div className="d-flex gap-2 justify-content-between align-items-center">
                    <Link
                      className="text-decoration-none"
                      aria-label="Get Your Posts"
                      to="/posts/posts-list"
                      state={{
                        username: getUserProfileUser?.username,
                        userPosts: getUserProfileUser?.posts,
                      }}
                    >
                      User Posts
                    </Link>
                    <div className="d-flex column-gap-2">
                      {isAuthenticated &&
                        currentUser?._id === getUserProfileUser?._id &&
                        image && (
                          <Button
                            aria-busy={updateProfilePhotoStatus === "pending"}
                            disabled={updateProfilePhotoStatus === "pending"}
                            onClick={saveImage}
                          >
                            {updateProfilePhotoStatus === "pending" ? (
                              <>
                                <Spinner
                                  aria-label="Update user profile"
                                  animation="border"
                                  role="status"
                                  size="sm"
                                />{" "}
                                Saving...
                              </>
                            ) : (
                              "Save"
                            )}
                          </Button>
                        )}
                      {isAuthenticated &&
                        currentUser?._id === getUserProfileUser?._id && (
                          <Button
                            aria-busy={
                              deleteUserProfileStatus ===
                              getUserProfileUser?._id
                            }
                            disabled={
                              deleteUserProfileStatus ===
                              getUserProfileUser?._id
                            }
                            onClick={deleteProfile}
                          >
                            {deleteUserProfileStatus ===
                            getUserProfileUser?._id ? (
                              <>
                                <Spinner
                                  aria-label="Delete user profile"
                                  animation="border"
                                  role="status"
                                  size="sm"
                                />{" "}
                                Removing account...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </Button>
                        )}
                    </div>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Loading>
      </Container>
    </section>
  );
};

export default UserProfile;
