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
                  <h2 className="card-title">{item.title}</h2>
                  <hr />
                  <p className="card-text">{item.note}</p>
                  <div className="card-time-btn">
                    <time className="time-date" dateTime={item.updatedAt || item.createdAt || undefined}>
                      {formatTimeDate(item.updatedAt || item.createdAt)}
                    </time>
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
                        title="Edit note"
                        aria-label={`Edit ${item.title}`}
                      >
                        <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m14 5 5 5M4 20l4.4-.9L19 8.5a2.1 2.1 0 0 0-3-3L5.4 16.1 4 20Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                      <button
                        type="button"
                        data-bs-toggle="modal"
                        data-bs-target="#deleteNoteModal"
                        onClick={() => deleteNote(item._id)}
                        className="delete"
                        title="Delete note"
                        aria-label={`Delete ${item.title}`}
                      >
                        <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V4h6v3m3 0-.8 13H6.8L6 7m4 4v5m4-5v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
