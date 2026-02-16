import { commentsSchema, type TCommentsSchema } from "@/validations";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useForm, type SubmitHandler } from "react-hook-form";
import { getPostComments, postsCleanUp } from "@/store/posts/posts-slice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useParams } from "react-router-dom";
import { Loading } from "@/components/feedback";
import { CommentItem } from "@/components/blog";
import { FormField } from "@/components/forms";
import { Heading } from "@/components/common";
import {
  selectCreateOrUpdateCommentError,
  selectCreateOrUpdateCommentStatus,
  selectDeleteCommentError,
} from "@/store/comments/comments-selectors";
import { useEffect, useState } from "react";
import { useDocumentTitle } from "@/hooks";
import {
  clearCommentsError,
  createComment,
  updateComment,
} from "@/store/comments/comments-slice";
import {
  selectGetPostCommentsError,
  selectGetPostCommentsRecords,
  selectGetPostCommentsStatus,
} from "@/store/posts/posts-selectors";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/store/auth/auth-selectors";
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

import AddPlusIcon from "@/assets/svg/add-plus.svg?react";
import EditIcon from "@/assets/svg/edit.svg?react";
import { addToast } from "@/store/toasts/toasts-slice";

const FORM_ID = "comments-form";

const Comments = () => {
  useDocumentTitle("Blog Pro - Post Comments");

  const { postId } = useParams();

  const [commentId, setCommentId] = useState<string | null>(null);

  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  const getPostCommentsRecords = useAppSelector(selectGetPostCommentsRecords);
  const getPostCommentsStatus = useAppSelector(selectGetPostCommentsStatus);
  const getPostCommentsError = useAppSelector(selectGetPostCommentsError);

  const createOrUpdateCommentStatus = useAppSelector(
    selectCreateOrUpdateCommentStatus,
  );
  const createOrUpdateCommentError = useAppSelector(
    selectCreateOrUpdateCommentError,
  );

  const deleteCommentError = useAppSelector(selectDeleteCommentError);

  const { control, handleSubmit, reset, setValue, setFocus } =
    useForm<TCommentsSchema>({
      resolver: zodResolver(commentsSchema),
      defaultValues: {
        text: "",
      },
      mode: "onSubmit", // Validation triggers only on submit
    });

  const onSubmit: SubmitHandler<TCommentsSchema> = async (data) => {
    try {
      if (commentId) {
        await dispatch(updateComment({ commentId, text: data.text })).unwrap();
        dispatch(
          addToast({
            type: "success",
            message: "Post has been updated successfully",
          }),
        );
        setCommentId(null);
      } else if (postId) {
        await dispatch(createComment({ postId, text: data.text })).unwrap();
        dispatch(
          addToast({
            type: "success",
            message: "Post has been created successfully",
          }),
        );
      }

      reset();
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Create / Update comment failed:", error);
      }

      setFocus("text");
    }
  };

  const editCommentHandler = (commentId: string, commentText: string) => {
    setValue("text", commentText);
    setCommentId(commentId);
    setFocus("text");
  };

  const cancelEdit = () => {
    reset();
    setCommentId(null);
  };

  useEffect(() => {
    if (!postId) return;
    const promise = dispatch(getPostComments(postId));
    return () => {
      promise.abort();
      dispatch(clearCommentsError("createOrUpdateComment"));
      dispatch(clearCommentsError("deleteComment"));
      dispatch(postsCleanUp());
    };
  }, [dispatch, postId]);

  return (
    <section aria-labelledby="comments-heading" className="my-3" role="region">
      <Container>
        <Heading id="post-details-heading" title="Post Details" srOnly={true} />
        <Loading status={getPostCommentsStatus} error={getPostCommentsError}>
          <Row>
            <Col lg={{ span: "8", offset: "2" }}>
              <Card className="viewport-card">
                <Card.Header>
                  {isAuthenticated ? (
                    <Form
                      onSubmit={handleSubmit(onSubmit)}
                      className="d-flex align-items-start gap-2"
                      aria-labelledby="comments-heading"
                      id={FORM_ID}
                      noValidate
                    >
                      <FormField
                        control={control}
                        className="mb-0 flex-grow-1"
                        placeholder="Comment Text"
                        label="Comment Text"
                        formId={FORM_ID}
                        srOnly={true}
                        name="text"
                        type="text"
                      />
                      <div className="d-flex gap-2">
                        <Button
                          aria-busy={createOrUpdateCommentStatus === "pending"}
                          disabled={createOrUpdateCommentStatus === "pending"}
                          variant={commentId ? "success" : "primary"}
                          type="submit"
                        >
                          {createOrUpdateCommentStatus === "pending" ? (
                            <Spinner
                              aria-label="Create / Update post comment"
                              animation="border"
                              role="status"
                              size="sm"
                            />
                          ) : commentId ? (
                            <EditIcon width={16} height={16} />
                          ) : (
                            <AddPlusIcon width={16} height={16} />
                          )}
                        </Button>
                        {commentId && (
                          <Button
                            variant={"danger"}
                            type="button"
                            onClick={cancelEdit}
                          >
                            X
                          </Button>
                        )}
                      </div>
                    </Form>
                  ) : (
                    "You must be logged in to post a comment."
                  )}
                </Card.Header>
                <Card.Body>
                  {createOrUpdateCommentError && (
                    <Alert
                      className="text-center"
                      aria-live="assertive"
                      variant="danger"
                      role="alert"
                    >
                      {createOrUpdateCommentError}
                    </Alert>
                  )}

                  {deleteCommentError && (
                    <Alert
                      className="text-center"
                      aria-live="assertive"
                      variant="danger"
                      role="alert"
                    >
                      {deleteCommentError}
                    </Alert>
                  )}

                  {getPostCommentsRecords.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {getPostCommentsRecords.map((comment) => (
                        <CommentItem
                          editCommentHandler={editCommentHandler}
                          isAuthenticated={isAuthenticated}
                          currentUser={currentUser}
                          key={comment._id}
                          comment={comment}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mb-0">
                      There are no comments on this post to view!
                    </p>
                  )}
                </Card.Body>
                <Card.Footer>
                  <Link
                    to={`/posts/${postId}/post-details`}
                    aria-label="Go back to post details"
                    className="text-decoration-none"
                  >
                    Go back to post details
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Loading>
      </Container>
    </section>
  );
};

export default Comments;
