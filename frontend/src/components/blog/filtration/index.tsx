import { filtrationSchema, type TFiltrationSchema } from "@/validations";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "react-bootstrap";
import { Form } from "react-router-dom";

import FilterIcon from "@/assets/svg/filter.svg?react";
import ClearIcon from "@/assets/svg/clear.svg?react";
import CategorySelect from "../category-select";

const FORM_ID = "filtration-form";

interface FiltrationProps {
  handleCategoryChange: (newCategory: string) => void;
}

const Filtration = ({ handleCategoryChange }: FiltrationProps) => {
  const filtrationForm = useForm<TFiltrationSchema>({
    resolver: zodResolver(filtrationSchema),
    defaultValues: {
      category: "",
    },
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<TFiltrationSchema> = async (data) => {
    handleCategoryChange(data.category || "");
  };

  const onClear = () => {
    filtrationForm.reset({ category: "" });
    handleCategoryChange("");
  };

  return (
    <Form
      onSubmit={filtrationForm.handleSubmit(onSubmit)}
      className="d-flex align-items-start gap-2"
      aria-labelledby="filter-heading"
      id={FORM_ID}
      noValidate
    >
      <CategorySelect
        className="mb-0 flex-grow-1"
        form={filtrationForm}
        formId={FORM_ID}
        name="category"
        srOnly={true}
      />
      <Button variant="danger" type="button" onClick={onClear}>
        <ClearIcon width={16} height={16} />
      </Button>
      <Button type="submit">
        <FilterIcon width={16} height={16} />
      </Button>
    </Form>
  );
};

export default Filtration;
