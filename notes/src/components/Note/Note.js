import React from "react";
import "./Note.scss";

const Note = ({ data, deleteNote, updateNote }) => {
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
    <div className="app__notes row p-2 p-lg-3 mt-5 rounded bg-light">
      {data &&
        data.map((item, key) => {
          return (
            <div
              className="app__note col-sm-3 p-xxl-3 p-xl-2 p-lg-3 p-2"
              key={key}
            >
              <div
                className="card shadow rounded border-0"
                style={{
                  backgroundColor: `${item.color === "" ? "#fff" : item.color}`,
                }}
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
                      >
                        <i className="fi fi-rr-pencil"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteNote(item._id)}
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
