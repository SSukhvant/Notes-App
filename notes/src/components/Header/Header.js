import React, { useEffect, useRef } from "react";

const Header = ({ searchQuery, handleSearchInputChange, setToggle, setAddNote, user, onSignOut, theme, onToggleTheme }) => {
  const searchRef = useRef(null);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <header className="app__header">
      <a className="app__name-logo" href="/" aria-label="Keep Notes home">
        <img src="/brand-mark.svg" alt="" className="app__logo" />
      </a>
      <label className="notes-search">
        <span aria-hidden="true">⌕</span>
        <input ref={searchRef} type="search" name="searchNote" value={searchQuery} autoComplete="off" onChange={handleSearchInputChange} placeholder="Search your notes…" aria-label="Search your notes" />
        <kbd>⌘ K</kbd>
      </label>
      <div className="header-account">
        <span className="account-avatar" aria-hidden="true">{user?.name?.trim()?.charAt(0)?.toUpperCase() || "U"}</span>
        <span className="account-name">{user?.name || "Your account"}</span>
        <button type="button" className="sign-out-button" onClick={onSignOut}>Sign out</button>
      </div>
      <button
        type="button"
        className="theme-toggle"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
      </button>
      <button type="button" className="header-add-note" data-bs-toggle="modal" data-bs-target="#noteModal" onClick={() => { setToggle(false); setAddNote({ title: "", note: "", color: "#ffffff" }); }} aria-label="Create a note">＋</button>
    </header>
  );
};

export default Header;
