import { deleteComment } from "@/store/comments/comments-slice";
import { Button, Card, Spinner } from "react-bootstrap";
import type { IComment, IUser } from "@/lib/types";
import { useAppDispatch } from "@/store/hooks";
import { formatTimeAgo } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useState } from "react";

import TrashIcon from "@/assets/svg/trash.svg?react";
import EditIcon from "@/assets/svg/edit.svg?react";
import { addToast } from "@/store/toasts/toasts-slice";

interface CommentItemProps {
  editCommentHandler: (commentId: string, commentText: string) => void;
  currentUser: IUser | null;
  isAuthenticated: boolean;
  comment: IComment;
}

const CommentItem = ({
  isAuthenticated,
  currentUser,
  comment,
  editCommentHandler,
}: CommentItemProps) => {
  const [isDelting, setIsDeleting] = useState(false);

  const dispatch = useAppDispatch();

  const deleteCommentHandler = async (commentId: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this comment?",
    );
    if (confirm) {
      try {
        setIsDeleting(true);
        await dispatch(deleteComment(commentId)).unwrap();
        setIsDeleting(false);
        dispatch(
          addToast({
            type: "success",
            message: "Post has been deleted successfully",
          }),
        );
      } catch (error) {
        if (import.meta.env.MODE === "development") {
          console.error("Delete comment failed:", error);
        }

        setIsDeleting(false);
      }
    }
  };

  return (
    <Card key={comment._id}>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center gap-3">
          <Link
            to={`/users/${comment.user._id}/user-profile`}
            className="d-flex align-items-center column-gap-2 text-decoration-none"
          >
            <img
              src={comment.user.profilePhoto.url}
              alt={comment.user.username}
              className="rounded-circle"
              width={40}
              height={40}
            />
            <strong>{comment.user.username}</strong>
          </Link>
          <em style={{ fontSize: "14px" }}>
            {formatTimeAgo(comment.createdAt || "")}
          </em>
        </div>
      </Card.Header>
      <Card.Body>{comment.text}</Card.Body>
      {isAuthenticated && currentUser?._id === comment.user._id && (
        <Card.Footer>
          <div className="d-flex justify-content-between align-items-center gap-3">
            <Button
              variant="success"
              onClick={() => editCommentHandler(comment._id, comment.text)}
            >
              <EditIcon width={16} height={16} />
            </Button>
            <Button
              aria-busy={isDelting}
              disabled={isDelting}
              variant="danger"
              onClick={() => deleteCommentHandler(comment._id)}
            >
              {isDelting ? (
                <Spinner
                  aria-label="Delete post comment"
                  animation="border"
                  role="status"
                  size="sm"
                />
              ) : (
                <TrashIcon width={16} height={16} />
              )}
            </Button>
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default CommentItem;
