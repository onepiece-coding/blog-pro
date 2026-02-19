/**
 * @file src/pages/posts/update-post/index.tsx
 */

import { clearPostsError, updatePost } from "@/store/posts/posts-slice";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useForm, type SubmitHandler } from "react-hook-form";
import { addToast } from "@/store/toasts/toasts-slice";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySelect } from "@/components/blog";
import { FormField } from "@/components/forms";
import { Heading } from "@/components/common";
import { Link } from "react-router-dom";
import {
  selectUpdatePostError,
  selectUpdatePostStatus,
} from "@/store/posts/posts-selectors";
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
import {
  updatePostSchema,
  type TUpdatePostInput,
  type TUpdatePostOutput,
} from "@/validations";

const FORM_ID = "update-post-form";

const UpdatePost = () => {
  const { postId } = useParams();

  const status = useAppSelector(selectUpdatePostStatus);
  const error = useAppSelector(selectUpdatePostError);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const prefilleds =
    (location.state as {
      title?: string;
      description?: string;
      categoryId?: string;
    }) ?? null;

  const updatePostForm = useForm<TUpdatePostInput, unknown, TUpdatePostOutput>({
    resolver: zodResolver(updatePostSchema),
    defaultValues: {
      title: prefilleds?.title ?? "",
      description: prefilleds?.description ?? "",
      categoryId: prefilleds?.categoryId ?? "",
    },
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<TUpdatePostOutput> = async (data) => {
    if (!postId) return;

    try {
      const body: Partial<Record<string, string>> = {};

      if (data.title) body.title = data.title;
      if (data.description) body.description = data.description;
      if (data.categoryId) body.categoryId = data.categoryId;

      await dispatch(updatePost({ postId, body })).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "Successful update your post",
        }),
      );
      updatePostForm.reset();
      navigate(`/posts/${postId}/post-details`, { replace: true });
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update post failed:", error);
      }
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearPostsError("updatePost"));
    };
  }, [dispatch]);

  return (
    <>
      <title>Blog Pro - Update Post</title>

      <section
        aria-labelledby="update-post-heading"
        className="my-3"
        role="region"
      >
        <Container>
          <Row>
            <Col lg={{ span: "8", offset: "2" }}>
              <Card className="viewport-card">
                <Card.Header>
                  <Heading id="update-post-heading" title="Update Post" />
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
                    onSubmit={updatePostForm.handleSubmit(onSubmit)}
                    aria-labelledby="update-post-heading"
                    id={FORM_ID}
                    noValidate
                  >
                    <CategorySelect
                      form={updatePostForm}
                      name="categoryId"
                      formId={FORM_ID}
                    />

                    <FormField<TUpdatePostInput, "title", TUpdatePostOutput>
                      placeholder="Post Title"
                      control={updatePostForm.control}
                      formId={FORM_ID}
                      label="Post Title"
                      name="title"
                      type="text"
                    />

                    <FormField<
                      TUpdatePostInput,
                      "description",
                      TUpdatePostOutput
                    >
                      control={updatePostForm.control}
                      placeholder="Post Description"
                      label="Post Description"
                      name="description"
                      formId={FORM_ID}
                      as="textarea"
                    />

                    <Button
                      aria-busy={status === "pending"}
                      disabled={status === "pending"}
                      type="submit"
                    >
                      {status === "pending" ? (
                        <>
                          <Spinner
                            aria-label="Update post"
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
                    to={`/posts/${postId}/post-details`}
                  >
                    Go back to your post?
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

export default UpdatePost;
