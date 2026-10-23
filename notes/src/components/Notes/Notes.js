import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const getInitialTheme = () => {
  let initialTheme = "light";
  try {
    const storedTheme = window.localStorage.getItem(themeKey);
    if (storedTheme === "light" || storedTheme === "dark") {
      initialTheme = storedTheme;
    } else if (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches) {
      initialTheme = "dark";
    }
  } catch {
    if (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches) {
      initialTheme = "dark";
    }
  }

  // Set the theme before React paints to avoid a light/dark flash.
  document.documentElement.dataset.theme = initialTheme;
  return initialTheme;
};

const ThemeToggle = ({ theme, onToggle }) => (
  <button
    type="button"
    className="theme-toggle"
    onClick={onToggle}
    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
  >
    <span aria-hidden="true">{theme === "dark" ? <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg> : <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" /></svg>}</span>
  </button>
);

const Notes = () => {
  const [token, setToken] = useState(() => sessionStorage.getItem(tokenKey) || "");
  const [sessionStatus, setSessionStatus] = useState(() => sessionStorage.getItem(tokenKey) ? "checking" : "signed-out");
  const [sessionRetry, setSessionRetry] = useState(0);
  const [theme, setTheme] = useState(getInitialTheme);
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
  const [editorError, setEditorError] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deletingId, setDeletingId] = useState("");
  const validatedSessionToken = useRef("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(themeKey, theme);
    } catch {
      // Theme still works for this session when storage is unavailable.
    }
  }, [theme]);

  useEffect(() => {
    if (!deleteCandidate) return undefined;
    const handleEscape = (event) => {
      if (event.key === "Escape" && !deletingId) setDeleteCandidate(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [deleteCandidate, deletingId]);

  const request = useMemo(() => {
    const instance = axios.create({ baseURL: api.defaults.baseURL, timeout: 15000 });
    if (token) instance.defaults.headers.common.Authorization = `Bearer ${token}`;
    return instance;
  }, [token]);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(tokenKey);
    validatedSessionToken.current = "";
    setToken("");
    setSessionStatus("signed-out");
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
    if (!token) {
      validatedSessionToken.current = "";
      setSessionStatus("signed-out");
      setUser(null);
      return undefined;
    }
    if (validatedSessionToken.current === token) return undefined;

    let cancelled = false;
    setSessionStatus("checking");
    request.get("/auth/me")
      .then((response) => {
        if (cancelled) return;
        validatedSessionToken.current = token;
        setUser(response.data.user);
        setAuthError("");
        setSessionStatus("authenticated");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 401) {
          signOut();
          return;
        }
        setSessionStatus("error");
        setAuthError("We couldn’t verify your session. Check your connection and try again. Your saved session has been kept.");
      });

    return () => { cancelled = true; };
  }, [request, signOut, token, sessionRetry]);

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
      validatedSessionToken.current = response.data.token;
      setUser(response.data.user);
      setSessionStatus("authenticated");
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

  const handleInput = (event) => {
    setAddNote((current) => ({ ...current, [event.target.name]: event.target.value }));
    setEditorError("");
  };
  const handleColorInput = (color) => setAddNote((current) => ({ ...current, color }));
  const resetEditor = () => {
    setAddNote({ title: "", note: "", color: "#ffffff" });
    setIsId("");
    setToggle(false);
    setEditorError("");
  };

  const saveNote = async (event) => {
    event?.preventDefault?.();
    if (!addNote.title.trim() || !addNote.note.trim()) {
      setEditorError("Add a title and some note content before saving.");
      return;
    }
    setSaveBusy(true);
    setError("");
    setEditorError("");
    try {
      if (toggle && isId) await request.put(`/update/${isId}`, addNote);
      else await request.post("/insert", addNote);
      setNotice(toggle ? "Note updated" : "Note saved");
      window.setTimeout(() => setNotice(""), 2500);
      resetEditor();
      await loadNotes();
      return true;
    } catch (err) {
      setEditorError(err.response?.data?.message || "Your note couldn't be saved. Your changes are still here.");
      return false;
    } finally {
      setSaveBusy(false);
    }
  };

  const updateNote = (id, title, note, color) => {
    setToggle(true);
    setEditorError("");
    setAddNote({ title, note, color: color || "#ffffff" });
    setIsId(id);
  };

  const deleteNote = (id, title) => setDeleteCandidate({ id, title });

  const confirmDelete = async () => {
    if (!deleteCandidate || deletingId) return;
    const id = deleteCandidate.id;
    setDeletingId(id);
    setError("");
    try {
      await request.delete("/delete/" + id);
      setDeleteCandidate(null);
      setNotice("Note deleted");
      window.setTimeout(() => setNotice(""), 2500);
      await loadNotes();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn’t delete this note. Please try again.");
      setDeleteCandidate(null);
    } finally {
      setDeletingId("");
    }
  };

  const visibleNotes = useMemo(() => {
    const notes = [...data];
    if (sortMode === "title") return notes.sort((a, b) => a.title.localeCompare(b.title));
    if (sortMode === "created-asc") return notes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortMode === "created-desc") return notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return notes.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }, [data, sortMode]);

  if (token && sessionStatus !== "authenticated") {
    return (
      <main className="session-check-shell">
        <section className="session-check-card" role="status" aria-live="polite">
          <img src="/brand-mark.svg" alt="" className="auth-brand-logo" />
          {sessionStatus === "checking" ? (
            <>
              <p className="eyebrow">RESTORING YOUR SPACE</p>
              <h1>Checking your session…</h1>
              <p className="auth-subtitle">Your notes are being securely loaded.</p>
              <span className="loading-dot" aria-hidden="true" />
            </>
          ) : (
            <>
              <p className="eyebrow">CONNECTION INTERRUPTED</p>
              <h1>Let’s reconnect.</h1>
              <p className="session-check-message">{authError}</p>
              <button className="auth-submit" type="button" onClick={() => setSessionRetry((value) => value + 1)}>
                <span>Try again</span><span aria-hidden="true">↻</span>
              </button>
              <button className="session-signout" type="button" onClick={signOut}>Sign in with another account</button>
            </>
          )}
        </section>
      </main>
    );
  }

  if (!token || !user) {
    return (
      <main className="auth-shell" data-theme={theme}>
        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-brand-row">
            <div className="auth-brand" aria-label="Notes"><img src="/brand-mark.svg" alt="" className="auth-brand-logo" /></div>
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
      {deleteCandidate && (
        <div className="confirm-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !deletingId) setDeleteCandidate(null); }}>
          <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description">
            <span className="confirm-icon" aria-hidden="true">!</span>
            <h2 id="delete-dialog-title">Delete this note?</h2>
            <p id="delete-dialog-description"><strong>{deleteCandidate.title || "Untitled note"}</strong> will be permanently deleted. This can’t be undone.</p>
            <div className="confirm-actions">
              <button type="button" className="confirm-cancel" autoFocus onClick={() => setDeleteCandidate(null)} disabled={Boolean(deletingId)}>Cancel</button>
              <button type="button" className="confirm-delete" onClick={confirmDelete} disabled={Boolean(deletingId)}>{deletingId ? "Deleting…" : "Delete note"}</button>
            </div>
          </section>
        </div>
      )}
      <Modal addNote={addNote} handleInput={handleInput} handleColorInput={handleColorInput} saveNote={saveNote} updateExistingNote={saveNote} toggle={toggle} saving={saveBusy} error={editorError} />
      <Fab setToggle={setToggle} setAddNote={(value) => { setAddNote(value); setIsId(""); setEditorError(""); }} />
    </section>
  );
};

export default Notes;
