/**
 * @file src/pages/posts/post-details/index.tsx
 */

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addToast } from "@/store/toasts/toasts-slice";
import { Loading } from "@/components/feedback";
import { Heading } from "@/components/common";
import { Link } from "react-router-dom";
import {
  selectDeletePostError,
  selectDeletePostStatus,
  selectGetSinglePostError,
  selectGetSinglePostRecord,
  selectGetSinglePostStatus,
  selectToggleLikeError,
  selectToggleLikeStatus,
  selectUpdatePostImageError,
  selectUpdatePostImageStatus,
} from "@/store/posts/posts-selectors";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/store/auth/auth-selectors";
import {
  clearPostsError,
  deletePost,
  getSinglePost,
  postsCleanUp,
  toggleLike,
  updatePostImage,
} from "@/store/posts/posts-slice";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";

import styles from "./styles.module.css";

const { postImageContainer, postImage } = styles;

const PostDetails = () => {
  const { postId } = useParams();

  const [preview, setPreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [show, setShow] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  const getSinglePostStatus = useAppSelector(selectGetSinglePostStatus);
  const getSinglePostRecord = useAppSelector(selectGetSinglePostRecord);
  const getSinglePostError = useAppSelector(selectGetSinglePostError);

  const updatePostImageStatus = useAppSelector(selectUpdatePostImageStatus);
  const updatePostImageError = useAppSelector(selectUpdatePostImageError);

  const deletePostStatus = useAppSelector(selectDeletePostStatus);
  const deletePostError = useAppSelector(selectDeletePostError);

  const toggleLikeStatus = useAppSelector(selectToggleLikeStatus);
  const toggleLikeError = useAppSelector(selectToggleLikeError);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      setImage(selectedFile);
      const imageUrl = URL.createObjectURL(selectedFile);
      setPreview(imageUrl);
    }
  };

  const saveImage = async () => {
    if (!image || !postId) return;

    const formData = new FormData();
    formData.append("image", image);

    try {
      await dispatch(updatePostImage({ formData, postId })).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "your post photo uploaded successfully",
        }),
      );
      setPreview(null);
      setImage(null);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update post photo failed:", error);
      }
    }
  };

  const cancelImageUpload = () => {
    setPreview(null);
    setImage(null);
  };

  const deleteSinglePost = async () => {
    if (!postId) return;

    try {
      await dispatch(deletePost(postId)).unwrap();
      dispatch(
        addToast({
          type: "success",
          message: "Your post has been deleted",
        }),
      );
      navigate("/posts/posts-list", { replace: true });
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Delete post failed:", error);
      }
    } finally {
      handleClose();
    }
  };

  const toggleLikeAction = async () => {
    if (!postId) return;

    try {
      await dispatch(toggleLike(postId)).unwrap();
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Toggle like failed:", error);
      }
    }
  };

  useEffect(() => {
    if (!postId) return;
    const promise = dispatch(getSinglePost(postId));
    return () => {
      promise.abort();
      dispatch(postsCleanUp());
      dispatch(clearPostsError("updatePostImage"));
      dispatch(clearPostsError("deletePost"));
      dispatch(clearPostsError("toggleLike"));
    };
  }, [dispatch, postId]);

  return (
    <>
      <title>OP-Blog - Post Details</title>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this post?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            aria-busy={deletePostStatus === getSinglePostRecord?._id}
            disabled={deletePostStatus === getSinglePostRecord?._id}
            onClick={deleteSinglePost}
            variant="danger"
          >
            {deletePostStatus === getSinglePostRecord?._id ? (
              <>
                <Spinner
                  aria-label="Delete single post"
                  animation="border"
                  role="status"
                  size="sm"
                />{" "}
                Removing post...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <section
        aria-labelledby="post-details-heading"
        className="my-3"
        role="region"
      >
        <Container>
          <Heading
            id="post-details-heading"
            title="Post Details"
            srOnly={true}
          />
          <Loading status={getSinglePostStatus} error={getSinglePostError}>
            <Row>
              <Col lg={{ span: "8", offset: "2" }}>
                <Card className="viewport-card">
                  {isAuthenticated &&
                    currentUser?._id === getSinglePostRecord?.user._id && (
                      <Card.Header>
                        <div className="d-flex gap-2 justify-content-between align-items-center">
                          <Link
                            to={`/posts/${getSinglePostRecord?._id}/update-post`}
                            className="text-decoration-none"
                            aria-label="Update Post"
                            state={{
                              title: getSinglePostRecord?.title,
                              description: getSinglePostRecord?.description,
                              categoryId: getSinglePostRecord?.categoryId._id,
                            }}
                          >
                            Update Post
                          </Link>
                          <div className="d-flex column-gap-2">
                            {image && (
                              <Button
                                aria-busy={updatePostImageStatus === "pending"}
                                disabled={updatePostImageStatus === "pending"}
                                onClick={saveImage}
                              >
                                {updatePostImageStatus === "pending" ? (
                                  <>
                                    <Spinner
                                      aria-label="Update post image"
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
                            <Button onClick={handleShow} variant="danger">
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card.Header>
                    )}
                  <Card.Body>
                    {updatePostImageError && (
                      <Alert
                        className="text-center"
                        aria-live="assertive"
                        variant="danger"
                        role="alert"
                      >
                        {updatePostImageError}
                      </Alert>
                    )}

                    {deletePostError && (
                      <Alert
                        className="text-center"
                        aria-live="assertive"
                        variant="danger"
                        role="alert"
                      >
                        {deletePostError}
                      </Alert>
                    )}

                    {toggleLikeError && (
                      <Alert
                        className="text-center"
                        aria-live="assertive"
                        variant="danger"
                        role="alert"
                      >
                        {toggleLikeError}
                      </Alert>
                    )}

                    <div className={postImageContainer}>
                      {isAuthenticated &&
                        currentUser?._id === getSinglePostRecord?.user._id &&
                        (!image ? (
                          <>
                            <label htmlFor="post-image">change</label>
                            <input
                              onChange={handleImageChange}
                              className="d-none"
                              accept="image/*"
                              id="post-image"
                              type="file"
                            />
                          </>
                        ) : (
                          <>
                            <Button onClick={cancelImageUpload}>Cancel</Button>
                          </>
                        ))}
                      <img
                        src={preview ?? getSinglePostRecord?.image.url}
                        alt={getSinglePostRecord?.title}
                        className={postImage}
                      />
                    </div>

                    <div className="d-flex justify-content-between align-items-center gap-2 mt-3">
                      <Link
                        to={`/users/${getSinglePostRecord?.user._id}/user-profile`}
                        className="d-flex align-items-center column-gap-2 text-decoration-none"
                      >
                        <img
                          src={getSinglePostRecord?.user.profilePhoto.url}
                          alt={getSinglePostRecord?.user.username}
                          className="rounded-circle"
                          width={70}
                          height={70}
                        />
                        <strong>{getSinglePostRecord?.user.username}</strong>
                      </Link>
                      {currentUser && (
                        <Button
                          aria-busy={toggleLikeStatus === "pending"}
                          disabled={toggleLikeStatus === "pending"}
                          onClick={toggleLikeAction}
                          variant={
                            getSinglePostRecord?.likes.includes(
                              currentUser?._id,
                            )
                              ? "primary"
                              : "outline-primary"
                          }
                        >
                          {toggleLikeStatus === "pending" ? (
                            <>
                              <Spinner
                                aria-label="Toggle like"
                                animation="border"
                                role="status"
                                size="sm"
                              />{" "}
                              Toggling like...
                            </>
                          ) : (
                            `Likes (${getSinglePostRecord?.likes.length})`
                          )}
                        </Button>
                      )}
                    </div>

                    <h2 className="mt-3 h5">{getSinglePostRecord?.title}</h2>

                    <p className="mt-3 mb-0">
                      {getSinglePostRecord?.description}
                    </p>
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-flex gap-2 justify-content-between align-items-center">
                      <Link
                        aria-label="Get the post comments"
                        className="text-decoration-none"
                        to={`/posts/posts-list`}
                      >
                        Get All Posts
                      </Link>
                      <Link
                        to={`/posts/${getSinglePostRecord?._id}/post-comments`}
                        aria-label="Get the post comments"
                        className="text-decoration-none"
                        state={getSinglePostRecord}
                      >
                        Post Comments
                      </Link>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            </Row>
          </Loading>
        </Container>
      </section>
    </>
  );
};

export default PostDetails;
