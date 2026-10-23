import "./Modal.scss";

const COLORS = ["#ffffff", "#fab1a0", "#ffeaa7", "#74b9ff", "#a29bfe", "#55efc4", "#dfe6e9"];

const Modal = ({ addNote, handleInput, handleColorInput, updateExistingNote, saveNote, toggle, saving = false, error = "" }) => {
  const submit = async () => {
    const result = await (toggle ? updateExistingNote() : saveNote());
    if (result) {
      document.querySelector("#noteModal [data-bs-dismiss=\"modal\"]")?.click();
    }
  };

  return (
    <div className="modal fade" id="noteModal" tabIndex="-1" aria-labelledby="noteModalTitle" aria-describedby="noteEditorHint" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered note-editor-dialog">
        <div className="modal-content note-editor">
          <div className="modal-header">
            <div><p className="editor-eyebrow">{toggle ? "MAKE IT BETTER" : "CAPTURE THE MOMENT"}</p><h2 className="modal-title" id="noteModalTitle">{toggle ? "Edit your note" : "A thought worth keeping"}</h2></div>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close editor" />
          </div>
          <div className="modal-body">
            <label className="editor-label" htmlFor="title-name">Title</label>
            <input type="text" className="form-control note-title-input" id="title-name" name="title" placeholder="Give this note a name" value={addNote.title} onChange={handleInput} maxLength={160} autoComplete="off" />
            <label className="editor-label mt-4" htmlFor="message-text">Your thoughts</label>
            <textarea className="form-control note-body-input" id="message-text" name="note" placeholder="Start writing… no thought is too small." rows={6} value={addNote.note} onChange={handleInput} maxLength={20000} />
            <div className="editor-color-row"><span className="editor-label">Paper color</span><div className="color-options" role="group" aria-label="Note color">
              {COLORS.map((color) => <button key={color} type="button" aria-pressed={(addNote.color || "#ffffff") === color} aria-label={color === "#ffffff" ? "White note" : `Note color ${color}`} className={`color-option ${(addNote.color || "#ffffff") === color ? "selected" : ""}`} style={{ backgroundColor: color }} onClick={() => handleColorInput(color)}><span>{(addNote.color || "#ffffff") === color ? "✓" : ""}</span></button>)}
            </div></div>
            {error && <p className="editor-error" role="alert">{error}</p>}
          </div>
          <div className="modal-footer">
            <span className="editor-hint" id="noteEditorHint">Your notes are saved to your private workspace.</span>
            <button type="button" className="editor-save-button" onClick={submit} disabled={saving}>{saving ? "Saving…" : toggle ? "Save changes ↗" : "Save note ↗"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
