import React from "react";
import "./Fab.scss";

const Fab = ({ setToggle, setAddNote }) => (
  <button
    type="button"
    className="fab"
    aria-label="Create a note"
    title="Create a note"
    data-bs-toggle="modal"
    data-bs-target="#noteModal"
    onClick={() => {
      setToggle(false);
      setAddNote({ title: "", note: "", color: "#ffffff" });
    }}
  >
    <svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
  </button>
);

export default Fab;
