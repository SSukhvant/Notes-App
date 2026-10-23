import React from "react";
import "./Fab.scss";

const Fab = ({ setToggle, setAddNote }) => (
  <button
    type="button"
    className="fab"
    data-bs-toggle="modal"
    data-bs-target="#noteModal"
    onClick={() => {
      setToggle(false);
      setAddNote({ title: "", note: "", color: "#ffffff" });
    }}
    aria-label="Create a note"
    title="Create a note"
  >
    <span aria-hidden="true">＋</span>
  </button>
);

export default Fab;
