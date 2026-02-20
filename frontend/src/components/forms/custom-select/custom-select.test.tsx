/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @file src/components/forms/custom-select/custom-select.test.tsx
 *
 * CustomSelect is a complex searchable select with infinite scroll:
 * - Controlled by RHF via Controller
 * - Search input that filters options
 * - Dropdown opens on focus, closes on blur
 * - Pagination via scroll detection
 * - Loading spinner during pending state
 * - Error display during failed state
 * - "No more options" when pageNumber >= totalPages
 * - "No options match your search" when filtered results are empty
 * - Clear button when value is selected
 * - Shows selected label when closed, shows searchTerm when open
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { render } from "@testing-library/react";
import { useForm } from "react-hook-form";

import CustomSelect from "@/components/forms/custom-select";
import userEvent from "@testing-library/user-event";

// ─────────────────────────────────────────────────────────────────────────────
// TEST HARNESS
// ─────────────────────────────────────────────────────────────────────────────

interface FormValues {
  category: string;
}

const CustomSelectHarness = ({
  options = [],
  status = "idle" as any,
  error = null,
  totalPages = 1,
  pageNumber = 1,
  searchTerm = "",
  handleSearchTermChange = vi.fn(),
  handlePageChange = vi.fn(),
}: any) => {
  const { control } = useForm<FormValues>({
    defaultValues: { category: "" },
  });

  return (
    <CustomSelect
      handleSearchTermChange={handleSearchTermChange}
      handlePageChange={handlePageChange}
      placeholder="Select category"
      label="Category"
      formId="test-form"
      name="category"
      totalPages={totalPages}
      pageNumber={pageNumber}
      searchTerm={searchTerm}
      control={control}
      options={options}
      status={status}
      error={error}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("CustomSelect", () => {
  const mockOptions = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3" },
  ];

  const mockHandleSearchTermChange = vi.fn();
  const mockHandlePageChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("🧱 Rendering — closed state", () => {
    it("renders the label", () => {
      render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
        />,
      );

      expect(screen.getByText("Category")).toBeInTheDocument();
    });

    it("renders input with placeholder when no value selected", () => {
      render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
        />,
      );

      expect(
        screen.getByPlaceholderText("Select category"),
      ).toBeInTheDocument();
    });

    it("does NOT render dropdown menu when closed", () => {
      render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
        />,
      );

      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });

    it("does NOT render clear button when no value selected", () => {
      render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
        />,
      );

      expect(
        screen.queryByRole("button", { name: /clear selection/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("🧱 Rendering — open state", () => {
    it("opens dropdown when input is focused", async () => {
      const user = userEvent.setup();
      render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
        />,
      );

      await user.click(screen.getByPlaceholderText("Select category"));

      expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("renders all options in the dropdown", async () => {
      const user = userEvent.setup();
      render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
        />,
      );

      await user.click(screen.getByPlaceholderText("Select category"));

      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 2")).toBeInTheDocument();
      expect(screen.getByText("Option 3")).toBeInTheDocument();
    });

    it("closes dropdown after short delay when input loses focus", async () => {
      const user = userEvent.setup();
      render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
        />,
      );

      const input = screen.getByPlaceholderText("Select category");
      await user.click(input);
      expect(screen.getByRole("list")).toBeInTheDocument();

      await user.tab(); // blur

      await waitFor(() => {
        expect(screen.queryByRole("list")).not.toBeInTheDocument();
      });
    });
  });

  describe("🎭 Interactions — search", () => {
    it("calls handlePageChange(1) when search term changes", async () => {
      /**
       * When user types, we reset to page 1 because the filtered results
       * are a new dataset. This is critical for search UX.
       */
      const user = userEvent.setup();
      render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
          pageNumber={3}
        />,
      );

      await user.type(screen.getByPlaceholderText("Select category"), "a");

      expect(mockHandlePageChange).toHaveBeenCalledWith(1);
    });

    it("displays searchTerm in input when dropdown is open", async () => {
      const user = userEvent.setup();
      render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
          searchTerm="test query"
        />,
      );

      const input = screen.getByPlaceholderText(
        "Select category",
      ) as HTMLInputElement;
      await user.click(input);

      expect(input.value).toBe("test query");
    });
  });

  describe("🎭 Interactions — selection", () => {
    it("selects an option when clicked", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
        />,
      );

      await user.click(screen.getByPlaceholderText("Select category"));

      // Click "Option 2"
      const option2 = screen.getByText("Option 2");
      fireEvent.mouseDown(option2); // onMouseDown prevents default blur

      await waitFor(() => {
        const input = container.querySelector("input") as HTMLInputElement;
        // After selection, dropdown closes and shows selected label
        expect(input.value).toBe("Option 2");
      });
    });

    it("displays selected option label when dropdown is closed", async () => {
      /**
       * When an option is selected and dropdown is closed, the input
       * shows the selected label, not the searchTerm.
       */
      const user = userEvent.setup();
      const { container } = render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
        />,
      );

      await user.click(screen.getByPlaceholderText("Select category"));
      fireEvent.mouseDown(screen.getByText("Option 1"));

      await waitFor(() => {
        const input = container.querySelector("input") as HTMLInputElement;
        expect(input.value).toBe("Option 1");
      });
    });
  });

  describe("🎭 Interactions — clear button", () => {
    it("renders clear button when a value is selected", async () => {
      const user = userEvent.setup();
      render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
        />,
      );

      await user.click(screen.getByPlaceholderText("Select category"));
      fireEvent.mouseDown(screen.getByText("Option 1"));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /clear selection/i }),
        ).toBeInTheDocument();
      });
    });

    it("clears selection when clear button is clicked", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
        />,
      );

      // Select an option
      await user.click(screen.getByPlaceholderText("Select category"));
      fireEvent.mouseDown(screen.getByText("Option 1"));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /clear selection/i }),
        ).toBeInTheDocument();
      });

      // Click clear
      await user.click(
        screen.getByRole("button", { name: /clear selection/i }),
      );

      // Value should be cleared
      const input = container.querySelector("input") as HTMLInputElement;
      expect(input.value).toBe("");
    });

    it("calls handleSearchTermChange with empty string when cleared", async () => {
      const user = userEvent.setup();
      render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
        />,
      );

      await user.click(screen.getByPlaceholderText("Select category"));
      fireEvent.mouseDown(screen.getByText("Option 1"));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /clear selection/i }),
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /clear selection/i }),
      );

      expect(mockHandleSearchTermChange).toHaveBeenCalledWith("");
    });
  });

  describe("🧱 Rendering — loading state", () => {
    it("renders loading spinner when status is pending", async () => {
      const user = userEvent.setup();
      render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
          status="pending"
        />,
      );

      await user.click(screen.getByPlaceholderText("Select category"));

      const spinners = screen.getAllByRole("status", { hidden: true });
      expect(spinners.length).toBeGreaterThan(0);
    });

    it("does NOT render clear button when loading", () => {
      render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
          status="pending"
        />,
      );

      expect(
        screen.queryByRole("button", { name: /clear selection/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("🧱 Rendering — error state", () => {
    it("renders error message in dropdown when status is failed", async () => {
      const user = userEvent.setup();
      render(
        <CustomSelectHarness
          options={[]}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
          status="failed"
          error="Failed to load categories"
        />,
      );

      await user.click(screen.getByPlaceholderText("Select category"));

      expect(screen.getByText("Failed to load categories")).toBeInTheDocument();
    });

    it("marks input as invalid when status is failed", () => {
      const { container } = render(
        <CustomSelectHarness
          options={[]}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
          status="failed"
          error="Error"
        />,
      );

      const input = container.querySelector("input");
      expect(input).toHaveClass("is-invalid");
    });
  });

  describe("🧱 Rendering — empty states", () => {
    it("shows 'No more options' when all pages loaded", async () => {
      const user = userEvent.setup();
      render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
          pageNumber={3}
          totalPages={3}
        />,
      );

      await user.click(screen.getByPlaceholderText("Select category"));

      expect(screen.getByText("No more options")).toBeInTheDocument();
    });

    it("shows 'No options match your search' when search returns no results", async () => {
      const user = userEvent.setup();
      render(
        <CustomSelectHarness
          options={[]}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
          searchTerm="nonexistent"
          status="succeeded"
        />,
      );

      await user.click(screen.getByPlaceholderText("Select category"));

      expect(
        screen.getByText("No options match your search."),
      ).toBeInTheDocument();
    });
  });

  describe("🎭 Interactions — infinite scroll", () => {
    it("calls handlePageChange when scrolled to bottom and more pages exist", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
          pageNumber={1}
          totalPages={3}
        />,
      );

      await user.click(screen.getByPlaceholderText("Select category"));

      const dropdown = container.querySelector(".optionsMenu");

      // Simulate scroll to bottom
      if (dropdown) {
        Object.defineProperty(dropdown, "scrollTop", {
          value: 100,
          writable: true,
        });
        Object.defineProperty(dropdown, "scrollHeight", {
          value: 105,
          writable: true,
        });
        Object.defineProperty(dropdown, "clientHeight", {
          value: 5,
          writable: true,
        });

        fireEvent.scroll(dropdown);

        expect(mockHandlePageChange).toHaveBeenCalledWith(2);
      }
    });

    it("does NOT call handlePageChange when on last page", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
          pageNumber={3}
          totalPages={3}
        />,
      );

      await user.click(screen.getByPlaceholderText("Select category"));

      const dropdown = container.querySelector(".optionsMenu");

      if (dropdown) {
        fireEvent.scroll(dropdown);
        expect(mockHandlePageChange).not.toHaveBeenCalled();
      }
    });

    it("does NOT call handlePageChange when already loading", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CustomSelectHarness
          options={mockOptions}
          handleSearchTermChange={mockHandleSearchTermChange}
          handlePageChange={mockHandlePageChange}
          pageNumber={1}
          totalPages={3}
          status="pending"
        />,
      );

      await user.click(screen.getByPlaceholderText("Select category"));

      const dropdown = container.querySelector(".optionsMenu");

      if (dropdown) {
        Object.defineProperty(dropdown, "scrollTop", {
          value: 100,
          writable: true,
        });
        Object.defineProperty(dropdown, "scrollHeight", {
          value: 105,
          writable: true,
        });
        Object.defineProperty(dropdown, "clientHeight", {
          value: 5,
          writable: true,
        });

        fireEvent.scroll(dropdown);

        expect(mockHandlePageChange).not.toHaveBeenCalled();
      }
    });
  });
});
