import React from 'react'
import './Fab.scss'

const Fab = ({setToggle, setAddNote}) => {
  return (
    <button
    type="button"
    className="fab bg-warning text-white shadow-sm"
    data-bs-toggle="modal"
    data-bs-target="#noteModal"
    onClick={() => {
      setToggle(false);
      setAddNote({ title: "", note: "", color:"" });
    }}
  >
    <i className="fi fi-br-plus"></i>
  </button>
  )
}

export default Fab