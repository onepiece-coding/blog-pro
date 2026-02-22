/**
 * @file src/pages/admin-dashboard/manage-users/index.tsx
 */

import {
  deleteUserProfile,
  getAllUsers,
  usersCleanUp,
} from "@/store/users/users-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Pagination, Search } from "@/components/common";
import { Alert, Button, Modal, Spinner, Table } from "react-bootstrap";
import { useEffect, useState } from "react";
import {
  selectDeleteUserProfileError,
  selectDeleteUserProfileStatus,
  selectGetAllUsersError,
  selectGetAllUsersRecords,
  selectGetAllUsersStatus,
  selectGetAllUsersTotalPages,
} from "@/store/users/users-selectors";

import TrashIcon from "@/assets/svg/trash.svg?react";
import EyeIcon from "@/assets/svg/eye.svg?react";
import { Link } from "react-router-dom";
import { Loading } from "@/components/feedback";
import { addToast } from "@/store/toasts/toasts-slice";

const ManageUsers = () => {
  const [userId, setUserId] = useState<null | string>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [username, setUserName] = useState("");
  const [show, setShow] = useState(false);

  const deleteUserProfileStatus = useAppSelector(selectDeleteUserProfileStatus);
  const deleteUserProfileError = useAppSelector(selectDeleteUserProfileError);

  const getAllUsersTotalPages = useAppSelector(selectGetAllUsersTotalPages);
  const getAllUsersRecords = useAppSelector(selectGetAllUsersRecords);
  const getAllUsersStatus = useAppSelector(selectGetAllUsersStatus);
  const getAllUsersError = useAppSelector(selectGetAllUsersError);

  const dispatch = useAppDispatch();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  const handleUsernameChange = (username: string) => {
    setPageNumber(1);
    setUserName(username);
  };

  const deleteUserHandler = async (userId: string | null) => {
    if (!userId) return;

    try {
      await dispatch(deleteUserProfile(userId)).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "User profile has been deleted",
        }),
      );

      if (pageNumber > 1 && getAllUsersRecords.length === 1) {
        setPageNumber(pageNumber - 1);
      }
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Delete user profile failed:", error);
      }
    } finally {
      handleClose();
    }
  };

  useEffect(() => {
    const promise = dispatch(getAllUsers({ pageNumber, username }));
    return () => {
      promise.abort();
      dispatch(usersCleanUp());
    };
  }, [dispatch, pageNumber, username]);

  return (
    <>
      <title>Admin Dashboard | Manage Users</title>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this account?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            disabled={deleteUserProfileStatus === userId}
            onClick={() => deleteUserHandler(userId)}
            variant="danger"
          >
            {deleteUserProfileStatus === userId ? (
              <>
                <Spinner
                  aria-label="Delete user"
                  animation="border"
                  role="status"
                  size="sm"
                />{" "}
                Removing user...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Loading status={getAllUsersStatus} error={getAllUsersError}>
        <div className="d-flex flex-column row-gap-3">
          {deleteUserProfileError && (
            <Alert
              className="text-center mb-0"
              aria-live="assertive"
              variant="danger"
              role="alert"
            >
              {deleteUserProfileError}
            </Alert>
          )}

          <Search
            handleSearchChange={handleUsernameChange}
            label={"Username"}
          />

          <div className="table-responsive">
            <Table striped bordered hover className="mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Bio</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getAllUsersRecords.length === 0 ? (
                  <tr className="text-center">
                    <td colSpan={5} className="text-info">
                      There is no users to view!
                    </td>
                  </tr>
                ) : (
                  getAllUsersRecords.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <img
                          src={user.profilePhoto.url}
                          alt={user.username}
                          width={40}
                          height={40}
                          className="rounded-circle"
                        />
                      </td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.bio || "-"}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link to={`/users/${user._id}/user-profile`}>
                            <Button variant="info" size="sm">
                              <EyeIcon width={16} height={16} />
                            </Button>
                          </Link>
                          <Button
                            onClick={() => {
                              setUserId(user._id);
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

          {getAllUsersRecords.length > 0 && (
            <Pagination
              handlePageChange={handlePageChange}
              totalPages={getAllUsersTotalPages}
              pageNumber={pageNumber}
            />
          )}
        </div>
      </Loading>
    </>
  );
};

export default ManageUsers;
