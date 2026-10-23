import React from "react";
import "./Note.scss";

const Note = ({ data, deleteNote, updateNote, viewMode = "grid" }) => {
  const formatTimeDate = (value) => {
    if (!value) return "";

    const date = new Date(value);
    const monthNames = [
      "Jan",
      "Feb",
      "March",
      "April",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];

    let hrs = date.getHours();
    let min = date.getMinutes();
    let day = date.getDate();
    const month = monthNames[date.getMonth()];

    return `${String(hrs).padStart(2, "0")}:${String(min).padStart(2, "0")} · ${day} ${month}`;
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
                      {formatTimeDate(item.createdAt)}
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
                        aria-label={`Edit ${item.title}`}
                      >
                        <i className="fi fi-rr-pencil"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteNote(item._id)}
                        className="delete"
                        aria-label={`Delete ${item.title}`}
                      >
                        <i className="fi fi-rr-trash"></i>
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
