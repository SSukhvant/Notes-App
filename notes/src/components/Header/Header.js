import React from "react";
import "./Header.scss";
import logo32 from "../../assets/logo32.png";

const Header = ({ searchQuery, handleSearchInputChange, setToggle, setAddNote, user, onSignOut }) => (
  <header className="app__header">
    <a className="app__name-logo" href="/" aria-label="Keep Notes home">
      <img src={logo32} alt="" className="app__logo" />
      <span className="app__name">keep notes<span className="brand-period">.</span></span>
    </a>
    <label className="notes-search">
      <span aria-hidden="true">⌕</span>
      <input type="search" name="searchNote" value={searchQuery} autoComplete="off" onChange={handleSearchInputChange} placeholder="Search your notes…" aria-label="Search your notes" />
      <kbd>⌘ K</kbd>
    </label>
    <div className="header-account">
      <span className="account-avatar" aria-hidden="true">{user?.name?.trim()?.charAt(0)?.toUpperCase() || "U"}</span>
      <span className="account-name">{user?.name || "Your account"}</span>
      <button type="button" className="sign-out-button" onClick={onSignOut}>Sign out</button>
    </div>
    <button type="button" className="header-add-note" data-bs-toggle="modal" data-bs-target="#noteModal" onClick={() => { setToggle(false); setAddNote({ title: "", note: "", color: "#ffffff" }); }} aria-label="Create a note">＋</button>
  </header>
);

export default Header;
