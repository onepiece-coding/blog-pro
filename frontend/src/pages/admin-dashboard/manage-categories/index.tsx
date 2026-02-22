/**
 * @file src/pages/admin-dashboard/manage-categories/index.tsx
 */

import { Alert, Button, Spinner, Table } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Pagination, Search } from "@/components/common";
import {
  selectDeleteCategoryError,
  selectDeleteCategoryStatus,
  selectGetAllCategoriesError,
  selectGetAllCategoriesRecords,
  selectGetAllCategoriesStatus,
  selectGetAllCategoriesTotalPages,
} from "@/store/categories/categories-selectors";
import { Loading } from "@/components/feedback";
import {
  categoriesCleanUp,
  deleteCategory,
  getAllCategories,
} from "@/store/categories/categories-slice";
import { useEffect, useState } from "react";

import TrashIcon from "@/assets/svg/trash.svg?react";
import { addToast } from "@/store/toasts/toasts-slice";

const ManageCategories = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [category, setCategory] = useState("");

  const deleteCategoryStatus = useAppSelector(selectDeleteCategoryStatus);
  const deleteCategoryError = useAppSelector(selectDeleteCategoryError);

  const getAllCategoriesRecords = useAppSelector(selectGetAllCategoriesRecords);
  const getAllCategoriesStatus = useAppSelector(selectGetAllCategoriesStatus);
  const getAllCategoriesError = useAppSelector(selectGetAllCategoriesError);
  const getAllCategoriesTotalPages = useAppSelector(
    selectGetAllCategoriesTotalPages,
  );

  const dispatch = useAppDispatch();

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  const handleCategoryChange = (category: string) => {
    setPageNumber(1);
    setCategory(category);
  };

  const deleteCategoryHandler = async (categoryId: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (confirm) {
      try {
        await dispatch(deleteCategory(categoryId)).unwrap();
        dispatch(
          addToast({
            type: "success",
            message: "Category has been deleted",
          }),
        );

        if (pageNumber > 1 && getAllCategoriesRecords.length === 1) {
          setPageNumber(pageNumber - 1);
        }
      } catch (error) {
        if (import.meta.env.MODE === "development") {
          console.error("Delete category failed:", error);
        }
      }
    }
  };

  useEffect(() => {
    const promise = dispatch(
      getAllCategories({ pageNumber, search: category }),
    );
    return () => {
      promise.abort();
      dispatch(categoriesCleanUp());
    };
  }, [dispatch, pageNumber, category]);

  return (
    <>
      <title>Admin Dashboard | Manage Categories</title>

      <Loading status={getAllCategoriesStatus} error={getAllCategoriesError}>
        <div className="d-flex flex-column row-gap-3">
          {deleteCategoryError && (
            <Alert
              className="text-center mb-0"
              aria-live="assertive"
              variant="danger"
              role="alert"
            >
              {deleteCategoryError}
            </Alert>
          )}

          <Search
            handleSearchChange={handleCategoryChange}
            label={"Category"}
          />

          <div className="table-responsive">
            <Table striped bordered hover className="mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category Title</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getAllCategoriesRecords.length === 0 ? (
                  <tr className="text-center">
                    <td colSpan={5} className="text-info">
                      There is no categories to view!
                    </td>
                  </tr>
                ) : (
                  getAllCategoriesRecords.map((category, index) => (
                    <tr key={category._id}>
                      <td>{index + 1}</td>
                      <td>{category.title}</td>
                      <td>
                        <Button
                          onClick={() => deleteCategoryHandler(category._id)}
                          disabled={deleteCategoryStatus === category._id}
                          variant="danger"
                          size="sm"
                        >
                          {deleteCategoryStatus === category._id ? (
                            <Spinner
                              aria-label="Delete category"
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

          {getAllCategoriesRecords.length > 0 && (
            <Pagination
              totalPages={getAllCategoriesTotalPages}
              handlePageChange={handlePageChange}
              pageNumber={pageNumber}
            />
          )}
        </div>
      </Loading>
    </>
  );
};

export default ManageCategories;
