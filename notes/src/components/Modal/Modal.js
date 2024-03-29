import "./Modal.scss";

const Modal = ({
  addNote,
  handleInput,
  handleColorInput,
  updateExistingNote,
  saveNote,
  toggle,
}) => {
  const colors = [
    "#fab1a0",
    "#ffeaa7",
    "#74b9ff",
    "#a29bfe",
    "#55efc4",
    "#dfe6e9",
  ];

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
                  className="form-control no-outline"
                  id="title-name"
                  name="title"
                  placeholder="Title"
                  value={addNote.title}
                  onChange={handleInput}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="message-text" className="col-form-label">
                  Take a note
                </label>
                <textarea
                  className="form-control no-outline"
                  id="message-text"
                  name="note"
                  placeholder="Take a note..."
                  rows={7}
                  value={addNote.note}
                  onChange={handleInput}
                ></textarea>
              </div>
            </div>
          </div>
          <div className="modal-footer d-flex justify-content-between align-items-center">
            <div className="color-btns">
              <ul>
                {colors.map((item, key) => {
                  return (
                    <li
                      className="color-btn"
                      key={key}
                      style={{ backgroundColor: item }}
                    >
                      <input
                        type="radio"
                        name="color"
                        value={item}
                        onClick={(e) => handleColorInput(e.target.value)}
                      />
                      <span
                        className={
                          addNote.color !== item
                            ? "checkmark"
                            : "checkmark active"
                        }
                      ></span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <button
              type="button"
              onClick={toggle ? () => updateExistingNote() : saveNote}
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
