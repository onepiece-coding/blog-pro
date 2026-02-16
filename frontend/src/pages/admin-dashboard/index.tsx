import { Alert, Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { createCategory } from "@/store/categories/categories-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useForm, type SubmitHandler } from "react-hook-form";
import { getAllInfo } from "@/store/admin/admin-slice";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  selectCreateCategoryError,
  selectCreateCategoryStatus,
} from "@/store/categories/categories-selectors";
import { Loading } from "@/components/feedback";
import { FormField } from "@/components/forms";
import {
  selectGetAllInfoError,
  selectGetAllInfoRecord,
  selectGetAllInfoStatus,
} from "@/store/admin/admin-selectors";
import { useEffect } from "react";
import {
  createCategorySchema,
  type TCreateCategorySchema,
} from "@/validations";

import AddPlusIcon from "@/assets/svg/add-plus.svg?react";
import { addToast } from "@/store/toasts/toasts-slice";

const FORM_ID = "create-category-form";

const AdminDashboard = () => {
  const dispatch = useAppDispatch();

  const getAllInfoStatus = useAppSelector(selectGetAllInfoStatus);
  const getAllInfoError = useAppSelector(selectGetAllInfoError);

  const createCategoryStatus = useAppSelector(selectCreateCategoryStatus);
  const createCategoryError = useAppSelector(selectCreateCategoryError);
  const getAllInfoRecord = useAppSelector(selectGetAllInfoRecord);

  const { control, handleSubmit, reset, setFocus } =
    useForm<TCreateCategorySchema>({
      resolver: zodResolver(createCategorySchema),
      defaultValues: {
        title: "",
      },
      mode: "onSubmit",
    });

  const onSubmit: SubmitHandler<TCreateCategorySchema> = async (data) => {
    try {
      await dispatch(createCategory(data.title)).unwrap();
      dispatch(
        addToast({
          type: "success",
          message: "Category has been created successfully",
        }),
      );
      reset();
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Create / Update comment failed:", error);
      }

      setFocus("title");
    }
  };

  useEffect(() => {
    if (getAllInfoRecord) return;
    const promise = dispatch(getAllInfo());
    return () => {
      promise.abort();
    };
  }, [getAllInfoRecord, dispatch]);

  return (
    <div className="d-flex flex-column gap-3">
      <Loading status={getAllInfoStatus} error={getAllInfoError}>
        <Row className="d-flex flex-column flex-sm-row row-gap-3">
          {getAllInfoRecord ? (
            Object.entries(getAllInfoRecord).map(([key, value]) => {
              return (
                <Col key={key} sm={6} md={3}>
                  <div className="w-100 p-3 bg-light text-dark text-center rounded-2 border">
                    <h3 className="mb-0">{value}</h3>
                    <span className="text-muted text-capitalize">
                      {key.replace(/([A-Z])/g, " $1")}{" "}
                    </span>
                  </div>
                </Col>
              );
            })
          ) : (
            <p className="text-info mb-0">There is no informations to view!</p>
          )}
        </Row>
      </Loading>

      {createCategoryError && (
        <Alert
          className="text-center mb-0"
          aria-live="assertive"
          variant="danger"
          role="alert"
        >
          {createCategoryError}
        </Alert>
      )}

      <Form
        onSubmit={handleSubmit(onSubmit)}
        className="d-flex align-items-start gap-2"
        aria-labelledby="comments-heading"
        id={FORM_ID}
        noValidate
      >
        <FormField
          className="mb-0 flex-grow-1"
          placeholder="Category Title"
          label="Category Title"
          control={control}
          formId={FORM_ID}
          srOnly={true}
          name="title"
          type="text"
        />
        <Button
          aria-busy={createCategoryStatus === "pending"}
          disabled={createCategoryStatus === "pending"}
          type="submit"
        >
          {createCategoryStatus === "pending" ? (
            <Spinner
              aria-label="Create Category"
              animation="border"
              role="status"
              size="sm"
            />
          ) : (
            <AddPlusIcon width={16} height={16} />
          )}
        </Button>
      </Form>
    </div>
  );
};

export default AdminDashboard;
