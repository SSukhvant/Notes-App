import React, { useEffect, useState } from "react";
import axios from "axios";
import Fab from "../Fab/Fab";
import Header from "../Header/Header";
import Modal from "../Modal/Modal";
import Note from "../Note/Note";
import "./Notes.scss";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://keepnotes.ap-south-1.elasticbeanstalk.com";

const Notes = () => {
  const [addNote, setAddNote] = useState({
    title: "",
    note: "",
    color: "",
  });

  const [toggle, setToggle] = useState(false);
  const [data, setData] = useState();
  const [isId, setIsId] = useState();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    searchNotes();
  }, [searchQuery]);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const searchNotes = async () => {
    try {
      const response = await axios.get(`/search?q=${searchQuery}`);
      setData(response.data.data);
    } catch (error) {
      console.error("Error searching notes:", error);
    }
  };

  const handleInput = (event) => {
    const { name, value } = event.target;
    setAddNote({ ...addNote, [name]: value });
  };

  const handleColorInput = (val) => {
    setAddNote({ ...addNote, color: val });
  };

  const saveNote = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/insert", addNote);
      getData();
      console.log(response.data);
    } catch (error) {
      console.error("Error while saving the note:", error);
    }
  };

  const updateNote = (id, title, note, color) => {
    setToggle(true);
    setAddNote({
      title: title,
      note: note,
      color: color,
    });
    setIsId(id);
  };

  const updateExistingNote = () => {
    axios
      .put(`/update/${isId}`, addNote)
      .then((response) => {
        if (response.data.success) {
          setToggle(false);
          getData();
          console.log("Note updated successfully");
        } else {
          console.log("Note update failed");
        }
      })
      .catch((err) => {
        console.log("Error updating note:", err);
      });
  };

  const deleteNote = (id) => {
    axios
      .delete(`/delete/${id}`)
      .then((response) => {
        if (response.data.success) {
          getData();
          console.log("Note deleted successfully");
        } else {
          console.log("Note deletion failed");
        }
      })
      .catch((err) => {
        console.log("Error deleting note:", err);
      });
  };

  const getData = () => {
    try {
      axios.get("/read").then((response) => {
        setData(response.data.data);
      });
    } catch (error) {
      console.error("Error while saving the note:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <section className="app container-sm">
      <Header
        searchQuery={searchQuery}
        handleSearchInputChange={handleSearchInputChange}
        setAddNote={setAddNote}
        setToggle={setToggle}
      />

      <Modal
        addNote={addNote}
        handleInput={handleInput}
        handleColorInput={handleColorInput}
        saveNote={saveNote}
        updateExistingNote={updateExistingNote}
        toggle={toggle}
      />
      <Note data={data} updateNote={updateNote} deleteNote={deleteNote} />
      <Fab setToggle={setToggle} setAddNote={setAddNote} />
    </section>
  );
};

export default Notes;
