/**
 * @file src/components/common/search/index.tsx
 */

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Button } from "react-bootstrap";
import { FormField } from "../../forms";

import SearchIcon from "@/assets/svg/search.svg?react";
import ClearIcon from "@/assets/svg/clear.svg?react";
import z from "zod";

const FORM_ID = "search-form";

const searchSchema = z.object({
  search: z.string().trim().optional(),
});

type TSearchSchema = z.infer<typeof searchSchema>;

interface SearchProps {
  handleSearchChange: (newText: string) => void;
  label: string;
}

const Search = ({ handleSearchChange, label }: SearchProps) => {
  const searchForm = useForm<TSearchSchema>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search: "",
    },
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<TSearchSchema> = async (data) => {
    handleSearchChange(data.search || "");
  };

  const onClear = () => {
    searchForm.reset({ search: "" });
    handleSearchChange("");
  };

  return (
    <Form
      onSubmit={searchForm.handleSubmit(onSubmit)}
      className="d-flex align-items-start gap-2"
      aria-labelledby="search-heading"
      id={FORM_ID}
      noValidate
    >
      <FormField
        control={searchForm.control}
        className="mb-0 flex-grow-1"
        placeholder={label}
        label={label}
        formId={FORM_ID}
        srOnly={true}
        name="search"
        type="text"
      />
      <Button variant="danger" type="button" onClick={onClear}>
        <ClearIcon width={16} height={16} />
      </Button>
      <Button type="submit">
        <SearchIcon width={16} height={16} />
      </Button>
    </Form>
  );
};

export default Search;
