import React from "react";

const Modal = ({ noteTitle, noteText, handleInput, saveNote, toggle }) => {
  return (
    <div
      className="modal fade"
      id="noteModal"
      tabIndex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              {toggle ? "Update Note" : "New Note"}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="app__inputs">
              <div className="mb-3">
                <label htmlFor="title-name" className="col-form-label">
                  Title
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title-name"
                  name="noteTitle"
                  value={noteTitle}
                  onChange={handleInput}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="message-text" className="col-form-label">
                  Take a note...
                </label>
                <textarea
                  className="form-control"
                  id="message-text"
                  name="noteText"
                  value={noteText}
                  onChange={handleInput}
                ></textarea>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              onClick={saveNote}
              data-bs-dismiss="modal"
              aria-label="Close"
              className="btn btn-warning text-white"
            >
              {toggle ? "Update Note" : "Add Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
