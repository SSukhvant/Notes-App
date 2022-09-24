import React, { useEffect, useState } from "react";
import Note from "../Note/Note";
import "./Notes.scss";

const getLocalData = () => {
  let localNote = localStorage.getItem("localNotes");
  if (localNote) {
    return JSON.parse(localStorage.getItem("localNotes"));
  } else {
    return [];
  }
};

const Notes = () => {
  const [note, setNote] = useState({
    noteTitle: "",
    noteText: "",
  });
  const [notesData, setNotesData] = useState(getLocalData());
  const [toggle, setToggle] = useState(false);
  const [isId, setIsId] = useState();
  const [searchNote, setSearchNote] = useState(notesData);
  const [search, setSearch] = useState("");

  const handleInput = (event) => {
    const { name, value } = event.target;
    setNote({ ...note, [name]: value });
  };

  const handleSearch = (value) => {
    setSearch(value);
    filterNote(value);
  };
  const filterNote = (value) => {
    const lowerCaseValue = value.toLowerCase().trim();
    if (!lowerCaseValue) {
      setSearchNote(notesData);
    } else {
      const filteredData = notesData.filter((item) => {
        return Object.keys(item).some((key) => {
          return item[key].toString().toLowerCase().includes(lowerCaseValue);
        });
      });
      setSearchNote(filteredData);
    }
  };

  const saveNote = () => {
    const allNotes = {
      id: Date.now() + "" + Math.floor(Math.random() * 78),
      noteTitle: note.noteTitle,
      noteText: note.noteText,
      noteTime: Date.now(),
    };
    if (!note) {
    } else if (note && toggle === true) {
      setNotesData(
        notesData.map((elem) => {
          if (elem.id === isId) {
            return {
              ...notesData,
              noteTitle: note.noteTitle,
              noteText: note.noteText,
            };
          }
          return elem;
        })
      );

      setNote({
        noteTitle: "",
        noteText: "",
      });
      setIsId(null);
    } else {
      setNotesData([...notesData, allNotes]);
      setNote({
        noteTitle: "",
        noteText: "",
      });
    }
  };

  const deleteNote = (id) => {
    const tempDeleteNotes = [...notesData];

    const deleteIndex = tempDeleteNotes.findIndex((item) => item.id === id);
    if (deleteIndex < 0) return;

    tempDeleteNotes.splice(deleteIndex, 1);
    setNotesData(tempDeleteNotes);
  };

  const updateNote = (id, noteTitle, noteText) => {
    setToggle(true);
    setIsId(id);
    setNote({ noteTitle: noteTitle, noteText: noteText });
  };

  useEffect(() => {
    localStorage.setItem("localNotes", JSON.stringify(notesData));
  }, [notesData]);

  return (
    <section className="app container-sm">
      <div className="app__header pt-4 px-4">
        <h2 className="app__name">Notes App</h2>
        <input
          type="text"
          name="searchNote"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search Note"
          className="shadow-sm border-1"
        />
        <button
          type="button"
          className="bg-warning text-white shadow-sm"
          data-bs-toggle="modal"
          data-bs-target="#noteModal"
          onClick={() => {
            setToggle(false);
            setNote({ noteTitle: "", noteText: "" });
          }}
        >
          <i className="fi fi-br-plus"></i>
        </button>
      </div>

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
                    value={note.noteTitle}
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
                    value={note.noteText}
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
      {search ? (
        <Note
          note={searchNote}
          deleteNote={deleteNote}
          updateNote={updateNote}
        />
      ) : (
        <Note
          note={notesData}
          deleteNote={deleteNote}
          updateNote={updateNote}
        />
      )}

      <button
        type="button"
        className="fab bg-warning text-white shadow-sm"
        data-bs-toggle="modal"
        data-bs-target="#noteModal"
        onClick={() => {
          setToggle(false);
          setNote({ noteTitle: "", noteText: "" });
        }}
      >
        <i className="fi fi-br-plus"></i>
      </button>
    </section>
  );
};

export default Notes;
