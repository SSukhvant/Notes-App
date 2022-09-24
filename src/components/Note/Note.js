import React from "react";
import "./Note.scss";

const Note = ({ note, deleteNote ,updateNote}) => {
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
    let amPm = hrs >= 12 ? "PM" : "AM";
    hrs = hrs ? hrs : "12";
    hrs = hrs > 12 ? (hrs = 24 - hrs) : hrs;

    let min = date.getMinutes();
    min = min < 10 ? "0" + min : min;

    let day = date.getDate();
    const month = monthNames[date.getMonth()];

    return `${hrs}:${min} ${amPm} ${day} ${month}`;
  };
  return (
    <div className="app__notes row g-3 mt-md-4 mt-1">
      {note.map((item, key) => {
        return (
          <div className="app__note col-sm-3 p-2 p-md-3" key={key}>
            <div className="card shadow rounded-4 border-0 p-2">
              <div className="card-body">
                <h5 className="card-title">{item.noteTitle}</h5>
                <hr/>
                <p className="card-text">{item.noteText}</p>
                <div className="card-time-btn">
                  <span className="time-date">
                    {formatTimeDate(item.noteTime)}
                  </span>
                  <div className="card-btn">
                    <button type="button" data-bs-toggle="modal"
                    data-bs-target="#noteModal" onClick={() => updateNote(item.id, item.noteTitle, item.noteText)} className="edit">
                      <i className="fi fi-rr-pencil"></i>
                    </button>
                    <button type="button" onClick={() => deleteNote(item.id)} className="delete">
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
