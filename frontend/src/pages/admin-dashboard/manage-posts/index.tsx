/**
 * @file src/pages/admin-dashboard/manage-posts/index.tsx
 */

import { deletePost, getPosts, postsCleanUp } from "@/store/posts/posts-slice";
import { Alert, Button, Modal, Spinner, Table } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Pagination, Search } from "@/components/common";
import { Loading } from "@/components/feedback";
import { Filtration } from "@/components/blog";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  selectDeletePostError,
  selectDeletePostStatus,
  selectGetPostsError,
  selectGetPostsRecords,
  selectGetPostsStatus,
  selectGetPostsTotalPages,
} from "@/store/posts/posts-selectors";

import TrashIcon from "@/assets/svg/trash.svg?react";
import EyeIcon from "@/assets/svg/eye.svg?react";
import { addToast } from "@/store/toasts/toasts-slice";

const ManagePosts = () => {
  const [postId, setPostId] = useState<null | string>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [category, setCategory] = useState("");
  const [show, setShow] = useState(false);
  const [text, setText] = useState("");

  const deletePostStatus = useAppSelector(selectDeletePostStatus);
  const deletePostError = useAppSelector(selectDeletePostError);

  const getPostsTotalPages = useAppSelector(selectGetPostsTotalPages);
  const getPostsRecords = useAppSelector(selectGetPostsRecords);
  const getPostsStatus = useAppSelector(selectGetPostsStatus);
  const getPostsError = useAppSelector(selectGetPostsError);

  const dispatch = useAppDispatch();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  const handleTextChange = (newText: string) => {
    setPageNumber(1);
    setText(newText);
  };

  const handleCategoryChange = (newCategory: string) => {
    setPageNumber(1);
    setCategory(newCategory);
  };

  const deletePostHandler = async (postId: string | null) => {
    if (!postId) return;

    try {
      await dispatch(deletePost(postId)).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "Post has been deleted",
        }),
      );

      if (pageNumber > 1 && getPostsRecords.length === 1) {
        setPageNumber(pageNumber - 1);
      }
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Delete post failed:", error);
      }
    } finally {
      handleClose();
    }
  };

  useEffect(() => {
    const promise = dispatch(getPosts({ pageNumber, text, category }));
    return () => {
      promise.abort();
      dispatch(postsCleanUp());
    };
  }, [dispatch, pageNumber, text, category]);

  return (
    <>
      <title>Admin Dashboard | Manage Posts</title>

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
            onClick={() => deletePostHandler(postId)}
            disabled={deletePostStatus === postId}
            variant="danger"
          >
            {deletePostStatus === postId ? (
              <>
                <Spinner
                  aria-label="Delete post"
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

      <Loading status={getPostsStatus} error={getPostsError}>
        <div className="d-flex flex-column row-gap-3">
          {deletePostError && (
            <Alert
              className="text-center mb-0"
              aria-live="assertive"
              variant="danger"
              role="alert"
            >
              {deletePostError}
            </Alert>
          )}

          <Search handleSearchChange={handleTextChange} label={"Post Title"} />

          <Filtration handleCategoryChange={handleCategoryChange} />

          <div className="table-responsive">
            <Table striped bordered hover className="mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Post Title</th>
                  <th>Post Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getPostsRecords.length === 0 ? (
                  <tr className="text-center">
                    <td colSpan={5} className="text-info">
                      There is no posts to view!
                    </td>
                  </tr>
                ) : (
                  getPostsRecords.map((post) => (
                    <tr key={post._id}>
                      <td>
                        <img
                          src={post.image.url}
                          alt={post.title}
                          width={70}
                          className="rounded-2"
                        />
                      </td>
                      <td>{post.title}</td>
                      <td>{post.categoryId.title}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link to={`/posts/${post._id}/post-details`}>
                            <Button variant="info" size="sm">
                              <EyeIcon width={16} height={16} />
                            </Button>
                          </Link>
                          <Button
                            onClick={() => {
                              setPostId(post._id);
                              handleShow();
                            }}
                            variant="danger"
                            size="sm"
                          >
                            <TrashIcon width={16} height={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {getPostsRecords.length > 0 && (
            <Pagination
              handlePageChange={handlePageChange}
              totalPages={getPostsTotalPages}
              pageNumber={pageNumber}
            />
          )}
        </div>
      </Loading>
    </>
  );
};

export default ManagePosts;
