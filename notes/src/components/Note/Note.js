import React from "react";
import "./Note.scss";

const Note = ({ data, deleteNote, updateNote, viewMode = "grid" }) => {
  const formatTimeDate = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };
  return (
    <div className={`app__notes ${viewMode === "list" ? "list-view" : ""}`}>
      {data &&
        data.map((item) => {
          return (
            <div
              className="app__note"
              key={item._id}
            >
              <div
                className="card shadow rounded border-0"
                style={{ "--note-color": item.color || "#ffffff" }}
              >
                <div className="card-body">
                  <h5 className="card-title">{item.title}</h5>
                  <hr />
                  <p className="card-text">{item.note}</p>
                  <div className="card-time-btn">
                    <span className="time-date">
                      {formatTimeDate(item.updatedAt || item.createdAt)}
                    </span>
                    <div className="card-btn">
                      <button
                        type="button"
                        data-bs-toggle="modal"
                        data-bs-target="#noteModal"
                        onClick={() =>
                          updateNote(
                            item._id,
                            item.title,
                            item.note,
                            item.color
                          )
                        }
                        className="edit"
                        aria-label={`Edit note: ${item.title}`} title="Edit note"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteNote(item._id, item.title)}
                        className="delete"
                        aria-label={`Delete note: ${item.title}`} title="Delete note"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 10v6M14 10v6"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default Note;
