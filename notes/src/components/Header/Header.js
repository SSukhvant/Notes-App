import React from 'react'
import './Header.scss'
import logo32 from '../../assets/logo32.png';

const Header = ({search, handleSearch, setToggle, setNote}) => {
  return (
    <div className="app__header pt-4 px-4">
    <div className='app__name-logo'>
    <img src={logo32} alt="logo" className='app__logo'/>
    <h2 className="app__name">Keep Notes</h2>
    </div>
    <input
      type="text"
      name="searchNote"
      value={search}
      autoComplete="off"
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
        setNote({ noteTitle: "", noteText: "", noteColor:"" });
      }}
    >
      <i className="fi fi-br-plus"></i>
    </button>
  </div>
  )
}

export default Header