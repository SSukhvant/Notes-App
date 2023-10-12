import React from "react";
import "./Note.scss";

const Note = ({ note, deleteNote, updateNote }) => {
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

    return `${hrs}:${min} ${day} ${month}`;
  };
  return (
    <div className="app__notes row g-2 mt-4 px-2 g-lg-3 mt-lg-4 px-lg-3 g-xl-2 mt-xl-4 px-xl-2 g-xxl-3 mt-xxl-4 px-xxl-3 border-end border-start border-top rounded">
      {note.map((item, key) => {
        return (
          <div className="app__note col-sm-3 p-xxl-3 p-xl-2 p-lg-3 p-2" key={key}>
            <div className="card shadow rounded border-0" style={{backgroundColor: `${item.noteColor ==="" ? "#fff" : item.noteColor}`}}>
              <div className="card-body">
                <h5 className="card-title">{item.noteTitle}</h5>
                <hr />
                <p className="card-text">{item.noteText}</p>
                <div className="card-time-btn">
                  <span className="time-date">
                    {formatTimeDate(item.noteTime)}
                  </span>
                  <div className="card-btn">
                    <button
                      type="button"
                      data-bs-toggle="modal"
                      data-bs-target="#noteModal"
                      onClick={() =>
                        updateNote(item.id, item.noteTitle, item.noteText, item.noteColor)
                      }
                      className="edit"
                    >
                      <i className="fi fi-rr-pencil"></i>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteNote(item.id)}
                      className="delete"
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
