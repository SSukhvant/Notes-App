import React, { useEffect, useState } from "react";
import Fab from "../Fab/Fab";
import Header from "../Header/Header";
import Modal from "../Modal/Modal";
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
    time: "",
  });
  const [notesData, setNotesData] = useState(getLocalData());
  const [toggle, setToggle] = useState(false);
  const [isId, setIsId] = useState();
  const [searchNote, setSearchNote] = useState(notesData);
  const [search, setSearch] = useState("");
  const [color, setColor] = useState("");

  const handleInput = (event) => {
    const { name, value } = event.target;
    setNote({ ...note, [name]: value });
  };

  const handleColorInput = (val) => {
    setColor(val);
  }

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
      colorNote: color
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
              noteTime: note.time,
              colorNote: color
            };
          }
          return elem;
        })
      );

      setNote({
        noteTitle: "",
        noteText: "",
        noteTime: "",
      });
      setIsId(null);
      setColor("")
    } else {
      setNotesData([...notesData, allNotes]);
      setNote({
        noteTitle: "",
        noteText: "",
        noteTime: "",
        colorNote: ""
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
    setNote({ noteTitle: noteTitle, noteText: noteText, time: Date.now() });
  };

  useEffect(() => {
    localStorage.setItem("localNotes", JSON.stringify(notesData));
  }, [notesData]);

  return (
    <section className="app container-sm">
      <Header
        search={search}
        setNote={setNote}
        setToggle={setToggle}
        handleSearch={handleSearch}
      />

      <Modal
        noteTitle={note.noteTitle}
        noteText={note.noteText}
        handleInput={handleInput}
        handleColorInput={handleColorInput}
        saveNote={saveNote}
        toggle={toggle}
      />
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
      <Fab setToggle={setToggle} setNote={setNote} />
    </section>
  );
};

export default Notes;
