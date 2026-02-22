/**
 * @file src/pages/posts/create-post/index.tsx
 */

import { createPostSchema, type TCreatePostSchema } from "@/validations";
import { clearPostsError, createPost } from "@/store/posts/posts-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySelect } from "@/components/blog";
import { useNavigate } from "react-router-dom";
import { FormField } from "@/components/forms";
import { Heading } from "@/components/common";
import { Link } from "react-router-dom";
import {
  selectCreatePostError,
  selectCreatePostStatus,
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
import { addToast } from "@/store/toasts/toasts-slice";

const FORM_ID = "create-post-user-form";

const CreatePost = () => {
  const status = useAppSelector(selectCreatePostStatus);
  const error = useAppSelector(selectCreatePostError);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const createPostForm = useForm<TCreatePostSchema>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      image: undefined,
    },
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<TCreatePostSchema> = async (data) => {
    const { title, description, categoryId, image } = data;

    const formData = new FormData();

    formData.append("description", description);
    formData.append("categoryId", categoryId);
    formData.append("title", title);
    formData.append("image", image);

    try {
      await dispatch(createPost(formData)).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "Post has been created successfully",
        }),
      );
      createPostForm.reset();
      navigate("/posts/posts-list");
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Create post failed:", error);
      }

      createPostForm.setFocus("title");
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearPostsError("createPost"));
    };
  }, [dispatch]);

  return (
    <>
      <title>OP-Blog - Create Post</title>

      <section
        className="my-3"
        aria-labelledby="create-post-heading"
        role="region"
      >
        <Container>
          <Row>
            <Col lg={{ span: "8", offset: "2" }}>
              <Card className="viewport-card">
                <Card.Header>
                  <Heading id="create-post-heading" title="Create New Post" />
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
                    onSubmit={createPostForm.handleSubmit(onSubmit)}
                    aria-labelledby="create-post-heading"
                    id={FORM_ID}
                    noValidate
                  >
                    <CategorySelect
                      form={createPostForm}
                      name="categoryId"
                      formId={FORM_ID}
                    />

                    <FormField
                      control={createPostForm.control}
                      label="Post Image"
                      formId={FORM_ID}
                      name="image"
                      type="file"
                    />

                    <FormField
                      placeholder="Choose a post title"
                      control={createPostForm.control}
                      label="Post Title"
                      formId={FORM_ID}
                      name="title"
                    />

                    <FormField
                      placeholder="Choose a post description"
                      control={createPostForm.control}
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
                            aria-label="Creating post"
                            animation="border"
                            role="status"
                            size="sm"
                          />{" "}
                          Creating post...
                        </>
                      ) : (
                        "Create Post"
                      )}
                    </Button>
                  </Form>
                </Card.Body>

                <Card.Footer>
                  <Link
                    className="text-decoration-none"
                    aria-label="Go back to posts page"
                    to="/posts/posts-list"
                  >
                    Go back to posts page?
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

export default CreatePost;
