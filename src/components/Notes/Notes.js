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
    noteColor:""
  });
  const [notesData, setNotesData] = useState(getLocalData());
  const [toggle, setToggle] = useState(false);
  const [isId, setIsId] = useState();
  const [searchNote, setSearchNote] = useState(notesData);
  const [search, setSearch] = useState("");
  // const [color, setColor] = useState("");

  const handleInput = (event) => {
    const { name, value } = event.target;
    setNote({ ...note, [name]: value });
  };

  const handleColorInput = (val) => {
    setNote({...note, noteColor: val});
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
      noteColor: note.noteColor
    };
    if (!note) {
    } else if (note && toggle === true) {
      // setNotesData(
      //   notesData.map((elem) => {
      //     if (elem.id === isId) {
      //       return {
      //         ...notesData,
      //         noteTitle: note.noteTitle,
      //         noteText: note.noteText,
      //         noteTime: note.time,
      //         noteColor: note.noteColor
      //       };
      //     }
      //     return elem;
      //   })
      // );
      let items = [...notesData];
      let item = items[isId]
      console.log(item)
      item.noteTitle = note.noteTitle
      item.noteText = note.noteText
      item.Time = note.time
      item.noteColor = note.noteColor
      items[isId] = item
      setNotesData(items)
      setNote({
        noteTitle: "",
        noteText: "",
        noteTime: "",
        noteColor:"",
      }); 
      setIsId(null);
    } else {
      setNotesData([...notesData, allNotes]);
      setNote({
        noteTitle: "",
        noteText: "",
        noteTime: "",
        noteColor: ""
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

  const updateNote = (id, noteTitle, noteText, noteColor) => {
    setToggle(true);
    setIsId(id);
    setNote({ noteTitle: noteTitle, noteText: noteText, time: Date.now(), noteColor: noteColor });
    let tempUpdateNotes = [...notesData];
    const index = tempUpdateNotes.findIndex((i) => i.id === id);
    if (index < 0) return;
    setIsId(index)
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
        note={note}
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
