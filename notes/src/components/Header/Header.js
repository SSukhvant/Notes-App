import React, { useEffect, useRef } from "react";

const Header = ({ searchQuery, handleSearchInputChange, setToggle, setAddNote, user, onSignOut, theme, onToggleTheme }) => {
  const searchRef = useRef(null);
  const shortcutLabel = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || "")
    ? "⌘ K"
    : "Ctrl K";

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
        <span aria-hidden="true" className="search-icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="10.8" cy="10.8" r="7.1" /><path d="m16 16 4.2 4.2" /></svg></span>
        <input ref={searchRef} type="search" name="searchNote" value={searchQuery} autoComplete="off" onChange={handleSearchInputChange} placeholder="Search your notes…" aria-label="Search your notes" />
        <kbd>{shortcutLabel}</kbd>
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
        <span aria-hidden="true">{theme === "dark" ? <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg> : <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" /></svg>}</span>
      </button>
      <button type="button" className="header-add-note" data-bs-toggle="modal" data-bs-target="#noteModal" onClick={() => { setToggle(false); setAddNote({ title: "", note: "", color: "#ffffff" }); }} aria-label="Create a note">＋</button>
    </header>
  );
};

export default Header;
