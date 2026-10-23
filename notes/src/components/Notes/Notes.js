import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Fab from "../Fab/Fab";
import Header from "../Header/Header";
import Modal from "../Modal/Modal";
import Note from "../Note/Note";
import "./Notes.scss";

const api = axios.create({
  baseURL: (process.env.REACT_APP_API_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://notes-app-api-lac.vercel.app")).trim().replace(/\/+$/, ""),
  timeout: 15000,
});
const tokenKey = "keep-notes-session";
const apiConfigured = Boolean(api.defaults.baseURL);
const localApi = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/i.test(api.defaults.baseURL);
const themeKey = "keep-notes-theme";

const ThemeToggle = ({ theme, onToggle }) => (
  <button
    type="button"
    className="theme-toggle"
    onClick={onToggle}
    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
  >
    <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
  </button>
);

const Notes = () => {
  const [token, setToken] = useState(() => sessionStorage.getItem(tokenKey) || "");
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(themeKey);
    return savedTheme || (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light");
  });
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [addNote, setAddNote] = useState({ title: "", note: "", color: "#ffffff" });
  const [toggle, setToggle] = useState(false);
  const [data, setData] = useState([]);
  const [isId, setIsId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortMode, setSortMode] = useState("updated");
  const [loading, setLoading] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(themeKey, theme);
  }, [theme]);

  const request = useMemo(() => {
    const instance = axios.create({ baseURL: api.defaults.baseURL, timeout: 15000 });
    if (token) instance.defaults.headers.common.Authorization = `Bearer ${token}`;
    return instance;
  }, [token]);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(tokenKey);
    setToken("");
    setUser(null);
    setData([]);
  }, []);

  const loadNotes = useCallback(async (query = searchQuery) => {
    if (!token || !apiConfigured) return;
    setLoading(true);
    setError("");
    try {
      const response = await request.get("/search", { params: { q: query } });
      setData(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      if (err.response?.status === 401) signOut();
      else setError(err.response?.data?.message || "Couldn't load your notes. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [request, searchQuery, signOut, token]);

  useEffect(() => {
    if (!token) return;
    request.get("/auth/me").then((response) => setUser(response.data.user)).catch(() => signOut());
  }, [request, signOut, token]);

  useEffect(() => {
    if (!token || !user) return;
    const timer = window.setTimeout(() => loadNotes(searchQuery), searchQuery ? 220 : 0);
    return () => window.clearTimeout(timer);
  }, [loadNotes, searchQuery, token, user]);

  const submitAuth = async (event) => {
    event.preventDefault();
    if (!apiConfigured) {
      setAuthError("Authentication service is not configured. Please set REACT_APP_API_URL to your deployed API URL.");
      return;
    }
    setAuthBusy(true);
    setAuthError("");
    try {
      const endpoint = authMode === "register" ? "/auth/register" : "/auth/login";
      const response = await api.post(endpoint, authForm);
      sessionStorage.setItem(tokenKey, response.data.token);
      setUser(response.data.user);
      setToken(response.data.token);
      setAuthForm({ name: "", email: "", password: "" });
    } catch (err) {
      const networkError = err.code === "ERR_NETWORK" || !err.response;
      const message = err.response?.data?.message || (networkError
        ? localApi
          ? `Cannot reach the local API at ${api.defaults.baseURL}. Make sure MongoDB is running, start the API with \`cd server && npm run dev\`, and confirm CLIENT_ORIGIN matches this frontend.`
          : "Cannot reach the authentication API. Check that the backend is deployed and REACT_APP_API_URL and CLIENT_ORIGIN are configured correctly."
        : "Unable to sign in right now. Please try again.");
      setAuthError(message);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleInput = (event) => setAddNote((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleColorInput = (color) => setAddNote((current) => ({ ...current, color }));
  const resetEditor = () => {
    setAddNote({ title: "", note: "", color: "#ffffff" });
    setIsId("");
    setToggle(false);
  };

  const saveNote = async (event) => {
    event?.preventDefault?.();
    if (!addNote.title.trim() || !addNote.note.trim()) {
      setError("Add a title and some note content before saving.");
      return;
    }
    setSaveBusy(true);
    setError("");
    try {
      if (toggle && isId) await request.put(`/update/${isId}`, addNote);
      else await request.post("/insert", addNote);
      setNotice(toggle ? "Note updated" : "Note saved");
      window.setTimeout(() => setNotice(""), 2500);
      resetEditor();
      await loadNotes();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Your note couldn't be saved. Your changes are still here.");
      return false;
    } finally {
      setSaveBusy(false);
    }
  };

  const updateNote = (id, title, note, color) => {
    setToggle(true);
    setAddNote({ title, note, color: color || "#ffffff" });
    setIsId(id);
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Delete this note permanently? This action cannot be undone.")) return;
    try {
      await request.delete(`/delete/${id}`);
      setNotice("Note deleted");
      window.setTimeout(() => setNotice(""), 2500);
      await loadNotes();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't delete this note.");
    }
  };

  const visibleNotes = useMemo(() => {
    const notes = [...data];
    if (sortMode === "title") return notes.sort((a, b) => a.title.localeCompare(b.title));
    if (sortMode === "created-asc") return notes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortMode === "created-desc") return notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return notes.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }, [data, sortMode]);

  if (!token || !user) {
    return (
      <main className="auth-shell" data-theme={theme}>
        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-brand-row">
            <div className="auth-brand"><span className="auth-mark">K</span><span>keep notes</span></div>
            <ThemeToggle theme={theme} onToggle={() => setTheme((current) => current === "dark" ? "light" : "dark")} />
          </div>
          <p className="eyebrow">YOUR SPACE, IN FOCUS</p>
          <h1 id="auth-title">{authMode === "register" ? "Make room for your thoughts." : "Good to have you back."}</h1>
          <p className="auth-subtitle">A calmer place to capture ideas, keep plans, and find what matters.</p>
          {!apiConfigured && <p className="auth-error" role="alert">The API URL is missing. Configure REACT_APP_API_URL in your frontend deployment and rebuild.</p> }
          <form className="auth-form" onSubmit={submitAuth}>
            {authMode === "register" && <label>Your name<input autoComplete="name" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} minLength={2} maxLength={80} required /></label>}
            <label>Email address<input type="email" autoComplete="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required /></label>
            <label>Password<input type="password" autoComplete={authMode === "register" ? "new-password" : "current-password"} value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} minLength={authMode === "register" ? 12 : 1} maxLength={128} required />{authMode === "register" && <small>Use at least 12 characters.</small>}</label>
            {authError && <p className="auth-error" role="alert">{authError}</p>}
            <button className="auth-submit" type="submit" disabled={authBusy}>{authBusy ? "Please wait…" : authMode === "register" ? "Create your account" : "Sign in"} <span aria-hidden="true">↗</span></button>
          </form>
          <p className="auth-switch">{authMode === "register" ? "Already have an account?" : "New to Keep Notes?"} <button type="button" onClick={() => { setAuthMode(authMode === "register" ? "login" : "register"); setAuthError(""); }}> {authMode === "register" ? "Sign in" : "Create account"}</button></p>
          <p className="auth-footnote">Your notes are private to your account.</p>
        </section>
        <aside className="auth-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-note art-note-back"><span>MONDAY / 09:41</span><i>✳</i><h3>Make space<br/>for good ideas.</h3><p>Collect thoughts. Connect the dots.</p></div><div className="art-note art-note-front"><span>FIELD NOTES&nbsp; · &nbsp;01</span><h3>Small steps,<br/>big picture.</h3><div className="art-lines"><i/><i/><i/></div><footer><span>PERSONAL JOURNAL</span><b>↗</b></footer></div><div className="art-caption">A little clarity goes a long way.</div></aside>
      </main>
    );
  }

  return (
    <section className="app" data-theme={theme}>
      <Header searchQuery={searchQuery} handleSearchInputChange={(event) => setSearchQuery(event.target.value)} setToggle={setToggle} setAddNote={setAddNote} user={user} onSignOut={signOut} theme={theme} onToggleTheme={() => setTheme((current) => current === "dark" ? "light" : "dark")} />
      <div className="notes-toolbar"><div><p className="eyebrow">YOUR WORKSPACE</p><h1>Your notes<span className="notes-count">{visibleNotes.length}</span></h1><p className="notes-description">A home for everything on your mind.</p></div><button type="button" className="new-note-button" data-bs-toggle="modal" data-bs-target="#noteModal" onClick={resetEditor}><span aria-hidden="true">＋</span> New note</button></div>
      {notice && <p className="app-notice" role="status">{notice}</p>}
      {error && <div className="app-error" role="alert"><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}
      <div className="notes-controls">
        <p className="results-summary" aria-live="polite">{searchQuery ? `${visibleNotes.length} ${visibleNotes.length === 1 ? "result" : "results"}` : `${visibleNotes.length} ${visibleNotes.length === 1 ? "note" : "notes"}`}</p>
        <div className="notes-control-actions">
          <label className="sort-control">Sort
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value)} aria-label="Sort notes">
              <option value="updated">Recently updated</option>
              <option value="created-desc">Newest created</option>
              <option value="created-asc">Oldest created</option>
              <option value="title">Title A–Z</option>
            </select>
          </label>
          <div className="view-toggle" role="group" aria-label="Notes layout">
            <button type="button" className={viewMode === "grid" ? "active" : ""} aria-pressed={viewMode === "grid"} aria-label="Grid view" onClick={() => setViewMode("grid")}><span aria-hidden="true">▦</span></button>
            <button type="button" className={viewMode === "list" ? "active" : ""} aria-pressed={viewMode === "list"} aria-label="List view" onClick={() => setViewMode("list")}><span aria-hidden="true">☰</span></button>
          </div>
        </div>
      </div>
      {loading ? <div className="notes-state"><span className="loading-dot"/> Gathering your notes…</div> : visibleNotes.length === 0 ? <div className="notes-empty"><span className="empty-icon">✳</span><h2>{searchQuery ? "Nothing found just yet" : "A fresh page."}</h2><p>{searchQuery ? "Try another search or a shorter phrase." : "Every good idea starts somewhere. Create your first note."}</p>{!searchQuery && <button type="button" data-bs-toggle="modal" data-bs-target="#noteModal" onClick={resetEditor}>Create your first note <span aria-hidden="true">↗</span></button>}</div> : <Note data={visibleNotes} viewMode={viewMode} updateNote={updateNote} deleteNote={deleteNote} />}
      <Modal addNote={addNote} handleInput={handleInput} handleColorInput={handleColorInput} saveNote={saveNote} updateExistingNote={saveNote} toggle={toggle} saving={saveBusy} error={error} />
      <Fab setToggle={setToggle} setAddNote={(value) => { setAddNote(value); setIsId(""); }} />
    </section>
  );
};

export default Notes;
