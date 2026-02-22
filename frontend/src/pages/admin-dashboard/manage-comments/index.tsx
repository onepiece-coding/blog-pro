/**
 * @file src/pages/admin-dashboard/manage-comments/index.tsx
 */

import { Alert, Button, Modal, Spinner, Table } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToast } from "@/store/toasts/toasts-slice";
import { Pagination } from "@/components/common";
import { Loading } from "@/components/feedback";
import {
  selectDeleteCommentError,
  selectGetAllCommentsError,
  selectGetAllCommentsRecords,
  selectGetAllCommentsStatus,
  selectGetAllCommentsTotalPages,
} from "@/store/comments/comments-selectors";
import { useEffect, useState } from "react";
import {
  commentsCleanUp,
  deleteComment,
  getAllComments,
} from "@/store/comments/comments-slice";
import { Link } from "react-router-dom";

import TrashIcon from "@/assets/svg/trash.svg?react";

const ManageComments = () => {
  const [isDeleting, setIsDeleting] = useState<null | string>(null);
  const [commentId, setCommentId] = useState<null | string>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [show, setShow] = useState(false);

  const deleteCommentError = useAppSelector(selectDeleteCommentError);

  const getAllCommentsTotalPages = useAppSelector(
    selectGetAllCommentsTotalPages,
  );
  const getAllCommentsRecords = useAppSelector(selectGetAllCommentsRecords);
  const getAllCommentsStatus = useAppSelector(selectGetAllCommentsStatus);
  const getAllCommentsError = useAppSelector(selectGetAllCommentsError);

  const dispatch = useAppDispatch();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  const deleteCommentHandler = async (commentId: string | null) => {
    if (!commentId) return;
    setIsDeleting(commentId);
    try {
      await dispatch(deleteComment(commentId)).unwrap();
      dispatch(
        addToast({
          type: "success",
          message: "Comment has been deleted",
        }),
      );

      if (pageNumber > 1 && getAllCommentsRecords.length === 1) {
        setPageNumber(pageNumber - 1);
      }
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Delete comment failed:", error);
      }
    } finally {
      setIsDeleting(null);
      handleClose();
    }
  };

  useEffect(() => {
    const promise = dispatch(getAllComments({ pageNumber }));
    return () => {
      promise.abort();
      dispatch(commentsCleanUp());
    };
  }, [dispatch, pageNumber]);

  return (
    <>
      <title>Admin Dashboard | Manage Comments</title>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this comment?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={() => deleteCommentHandler(commentId)}
            aria-busy={isDeleting === commentId}
            disabled={isDeleting === commentId}
            variant="danger"
          >
            {isDeleting === commentId ? (
              <>
                <Spinner
                  aria-label="Delete comment"
                  animation="border"
                  role="status"
                  size="sm"
                />{" "}
                Removing comment...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Loading status={getAllCommentsStatus} error={getAllCommentsError}>
        <div className="d-flex flex-column row-gap-3">
          {deleteCommentError && (
            <Alert
              className="text-center mb-0"
              aria-live="assertive"
              variant="danger"
              role="alert"
            >
              {deleteCommentError}
            </Alert>
          )}

          <div className="table-responsive">
            <Table striped bordered hover className="mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Comment</th>
                  <th>Author</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getAllCommentsRecords.length === 0 ? (
                  <tr className="text-center">
                    <td colSpan={5} className="text-info">
                      There is no comments to view!
                    </td>
                  </tr>
                ) : (
                  getAllCommentsRecords.map((comment, index) => (
                    <tr key={comment._id}>
                      <td>{index + 1}</td>
                      <td title={comment.text}>
                        {comment.text.substring(0, 70)}
                        {comment.text.length > 70 && "..."}
                      </td>
                      <td>
                        <Link
                          className="d-flex align-items-center gap-2 text-decoration-none"
                          to={`/users/${comment.user._id}/user-profile`}
                        >
                          <img
                            src={comment.user.profilePhoto.url}
                            alt={comment.user.username}
                            className="rounded-circle"
                            width={40}
                            height={40}
                          />
                          <span>{comment.user.username}</span>
                        </Link>
                      </td>
                      <td>
                        <Button
                          onClick={() => {
                            setCommentId(comment._id);
                            handleShow();
                          }}
                          variant="danger"
                          size="sm"
                        >
                          <TrashIcon width={16} height={16} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {getAllCommentsRecords.length > 0 && (
            <Pagination
              totalPages={getAllCommentsTotalPages}
              handlePageChange={handlePageChange}
              pageNumber={pageNumber}
            />
          )}
        </div>
      </Loading>
    </>
  );
};

export default ManageComments;
