/**
 * @file src/components/blog/category-select/index.tsx
 */

import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { getAllCategories } from "@/store/categories/categories-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { CustomSelect } from "@/components/forms";
import {
  selectGetAllCategoriesError,
  selectGetAllCategoriesRecords,
  selectGetAllCategoriesStatus,
  selectGetAllCategoriesTotalPages,
} from "@/store/categories/categories-selectors";
import { useEffect, useState } from "react";

interface CategorySelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues extends FieldValues | undefined = undefined,
> {
  form: UseFormReturn<TFieldValues, unknown, TTransformedValues>;
  className?: string;
  srOnly?: boolean;
  formId: string;
  name: TName;
}

const CategorySelect = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues extends FieldValues | undefined = undefined,
>({
  className = "mb-3",
  srOnly = false,
  formId,
  form,
  name,
}: CategorySelectProps<TFieldValues, TName, TTransformedValues>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  const dispatch = useAppDispatch();

  const getAllCategoriesRecords = useAppSelector(selectGetAllCategoriesRecords);
  const getAllCategoriesStatus = useAppSelector(selectGetAllCategoriesStatus);
  const getAllCategoriesError = useAppSelector(selectGetAllCategoriesError);
  const getAllCategoriesTotalPages = useAppSelector(
    selectGetAllCategoriesTotalPages,
  );

  const options = getAllCategoriesRecords.map((category) => ({
    value: category._id,
    label: category.title,
  }));

  const handleSearchTermChange = (newSearchTerm: string) => {
    setPageNumber(1);
    setSearchTerm(newSearchTerm);
  };

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const promise = dispatch(
        getAllCategories({ search: searchTerm, pageNumber }),
      );
      return () => promise.abort();
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, searchTerm, pageNumber]);

  return (
    <CustomSelect
      handleSearchTermChange={handleSearchTermChange}
      totalPages={getAllCategoriesTotalPages}
      handlePageChange={handlePageChange}
      status={getAllCategoriesStatus}
      error={getAllCategoriesError}
      searchTerm={searchTerm}
      pageNumber={pageNumber}
      control={form.control}
      className={className}
      label="Post Category"
      options={options}
      formId={formId}
      srOnly={srOnly}
      name={name}
    />
  );
};

export default CategorySelect;
