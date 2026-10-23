import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Note from "./Note";

const sampleNote = {
  _id: "note-1",
  title: "Planning the week",
  note: "Write the project plan and review the backlog.",
  color: "#ffffff",
  createdAt: "2026-10-21T08:30:00.000Z",
  updatedAt: "2026-10-22T10:45:00.000Z",
};

test("renders a note with accessible edit and delete actions", () => {
  const updateNote = jest.fn();
  const deleteNote = jest.fn();
  const { container } = render(
    <Note data={[sampleNote]} updateNote={updateNote} deleteNote={deleteNote} />
  );

  expect(screen.getByRole("heading", { level: 2, name: "Planning the week" })).toBeInTheDocument();
  expect(screen.getByText(sampleNote.note)).toBeInTheDocument();

  const editButton = screen.getByRole("button", { name: "Edit Planning the week" });
  const deleteButton = screen.getByRole("button", { name: "Delete Planning the week" });
  expect(editButton).toHaveAttribute("data-bs-target", "#noteModal");
  expect(deleteButton).toHaveAttribute("data-bs-target", "#deleteNoteModal");
  expect(container.querySelector("time")).toHaveAttribute("datetime", sampleNote.updatedAt);

  fireEvent.click(editButton);
  expect(updateNote).toHaveBeenCalledWith(
    sampleNote._id,
    sampleNote.title,
    sampleNote.note,
    sampleNote.color
  );

  fireEvent.click(deleteButton);
  expect(deleteNote).toHaveBeenCalledWith(sampleNote._id);
});

test("renders list layout without changing note actions", () => {
  render(<Note data={[sampleNote]} viewMode="list" updateNote={jest.fn()} deleteNote={jest.fn()} />);
  expect(document.querySelector(".app__notes.list-view")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Edit Planning the week" })).toBeInTheDocument();
});
