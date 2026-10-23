import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("axios", () => {
  const createClient = () => ({
    defaults: {
      baseURL: "http://localhost:3001",
      headers: { common: {} },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  });

  return {
    __esModule: true,
    default: {
      create: jest.fn(createClient),
    },
  };
});

import App from "./App";

beforeEach(() => {
  sessionStorage.clear();
  localStorage.removeItem("keep-notes-theme");
});

test("renders the sign-in experience", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /good to have you back/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
});

test("allows a visitor to switch to account registration", () => {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: /create account/i }));
  expect(screen.getByRole("heading", { name: /make room for your thoughts/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toHaveAttribute("minLength", "12");
});

test("persists the selected appearance mode", () => {
  const { unmount } = render(<App />);
  fireEvent.click(screen.getByRole("button", { name: /switch to dark mode/i }));
  expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  expect(localStorage.getItem("keep-notes-theme")).toBe("dark");
  unmount();

  render(<App />);
  expect(screen.getByRole("button", { name: /switch to light mode/i })).toBeInTheDocument();
});
