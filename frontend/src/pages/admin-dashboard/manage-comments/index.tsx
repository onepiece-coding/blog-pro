/**
 * @file src/pages/admin-dashboard/manage-comments/index.tsx
 */

import {
  commentsCleanUp,
  deleteComment,
  getAllComments,
} from "@/store/comments/comments-slice";
import { Alert, Button, Spinner, Table } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
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
import { Link } from "react-router-dom";

import TrashIcon from "@/assets/svg/trash.svg?react";
import { addToast } from "@/store/toasts/toasts-slice";

const ManageComments = () => {
  const [pageNumber, setPageNumber] = useState(1);

  const [isDeleting, setIsDeleting] = useState<null | string>(null);

  const deleteCommentError = useAppSelector(selectDeleteCommentError);

  const getAllCommentsTotalPages = useAppSelector(
    selectGetAllCommentsTotalPages,
  );
  const getAllCommentsRecords = useAppSelector(selectGetAllCommentsRecords);
  const getAllCommentsStatus = useAppSelector(selectGetAllCommentsStatus);
  const getAllCommentsError = useAppSelector(selectGetAllCommentsError);

  const dispatch = useAppDispatch();

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  const deleteCommentHandler = async (commentId: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this account?",
    );

    if (confirm) {
      setIsDeleting(commentId);
      try {
        await dispatch(deleteComment(commentId)).unwrap();
        dispatch(
          addToast({
            type: "success",
            message: "Comment has been deleted",
          }),
        );

        setIsDeleting(null);

        if (pageNumber > 1 && getAllCommentsRecords.length === 1) {
          setPageNumber(pageNumber - 1);
        }
      } catch (error) {
        setIsDeleting(null);
        if (import.meta.env.MODE === "development") {
          console.error("Delete comment failed:", error);
        }
      }
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
                          onClick={() => deleteCommentHandler(comment._id)}
                          disabled={isDeleting === comment._id}
                          variant="danger"
                          size="sm"
                        >
                          {isDeleting === comment._id ? (
                            <Spinner
                              aria-label="Delete comment"
                              animation="border"
                              role="status"
                              size="sm"
                            />
                          ) : (
                            <TrashIcon width={16} height={16} />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          <Pagination
            totalPages={getAllCommentsTotalPages}
            handlePageChange={handlePageChange}
            pageNumber={pageNumber}
          />
        </div>
      </Loading>
    </>
  );
};

export default ManageComments;
