import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Modal from "./Modal";

const createProps = (overrides = {}) => ({
  addNote: { title: "", note: "", color: "#ffffff" },
  handleInput: jest.fn(),
  handleColorInput: jest.fn(),
  saveNote: jest.fn().mockResolvedValue(false),
  updateExistingNote: jest.fn().mockResolvedValue(false),
  toggle: false,
  saving: false,
  error: "",
  ...overrides,
});

test("renders labeled editor fields and pressed state for paper colors", () => {
  const props = createProps();
  render(<Modal {...props} />);

  expect(screen.getByLabelText("Title")).toBeInTheDocument();
  expect(screen.getByLabelText("Your thoughts")).toBeInTheDocument();
  expect(screen.getByRole("group", { name: "Note color", hidden: true })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "White note", hidden: true })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "Note color #fab1a0", hidden: true })).toHaveAttribute("aria-pressed", "false");

  fireEvent.click(screen.getByRole("button", { name: "Note color #fab1a0", hidden: true }));
  expect(props.handleColorInput).toHaveBeenCalledWith("#fab1a0");
});

test("submits the correct create or edit callback and exposes save errors", async () => {
  const createPropsForTest = createProps({ error: "Add a title and some note content before saving." });
  render(<Modal {...createPropsForTest} />);

  expect(screen.getByRole("alert", { hidden: true })).toHaveTextContent("Add a title and some note content before saving.");
  fireEvent.click(screen.getByRole("button", { name: /save note/i, hidden: true }));
  await waitFor(() => expect(createPropsForTest.saveNote).toHaveBeenCalledTimes(1));
});
