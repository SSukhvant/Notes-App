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
const readSessionToken = () => {
  try { return window.sessionStorage.getItem(tokenKey) || ""; } catch { return ""; }
};
const writeSessionToken = (token) => {
  try { window.sessionStorage.setItem(tokenKey, token); } catch { /* Current session remains usable. */ }
};
const clearSessionToken = () => {
  try { window.sessionStorage.removeItem(tokenKey); } catch { /* Continue sign-out if storage is blocked. */ }
};
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
    <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
  </button>
);

const Notes = () => {
  const [token, setToken] = useState(readSessionToken);
  const [authChecking, setAuthChecking] = useState(() => Boolean(readSessionToken()));
  const [authCheckError, setAuthCheckError] = useState("");
  const [editorError, setEditorError] = useState("");
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(themeKey, theme);
    } catch {
      // Theme still works for this session when storage is unavailable.
    }
  }, [theme]);

  const request = useMemo(() => {
    const instance = axios.create({ baseURL: api.defaults.baseURL, timeout: 15000 });
    if (token) instance.defaults.headers.common.Authorization = `Bearer ${token}`;
    return instance;
  }, [token]);

  const signOut = useCallback(() => {
    clearSessionToken();
    setToken("");
    setUser(null);
    setData([]);
    setAuthChecking(false);
    setAuthCheckError("");
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
      setAuthChecking(false);
      return undefined;
    }

    let active = true;
    request.get("/auth/me")
      .then((response) => {
        if (active) setUser(response.data.user);
      })
      .catch((err) => {
        if (!active) return;
        if (err.response?.status === 401) {
          signOut();
        } else {
          setAuthCheckError("We couldn't verify your session. Check your connection and try again.");
        }
      })
      .finally(() => {
        if (active) setAuthChecking(false);
      });

    return () => { active = false; };
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
      writeSessionToken(response.data.token);
      setAuthChecking(false);
      setAuthCheckError("");
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

  const handleInput = (event) => {
    setAddNote((current) => ({ ...current, [event.target.name]: event.target.value }));
    setEditorError("");
  };
  const handleColorInput = (color) => {
    setAddNote((current) => ({ ...current, color }));
    setEditorError("");
  };
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
      return false;
    }
    setSaveBusy(true);
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
    setAddNote({ title, note, color: color || "#ffffff" });
    setIsId(id);
    setEditorError("");
  };

  const deleteNote = (id) => {
    const candidate = data.find((item) => item._id === id);
    setDeleteCandidate(candidate || { _id: id, title: "this note" });
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!deleteCandidate || deleteBusy) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await request.delete(`/delete/${deleteCandidate._id}`);
      setNotice("Note deleted");
      window.setTimeout(() => setNotice(""), 2500);
      await loadNotes();
      document.querySelector('#deleteNoteModal [data-bs-dismiss="modal"]')?.click();
      setDeleteCandidate(null);
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Couldn't delete this note. Please try again.");
    } finally {
      setDeleteBusy(false);
    }
  };

  const visibleNotes = useMemo(() => {
    const notes = [...data];
    if (sortMode === "title") return notes.sort((a, b) => a.title.localeCompare(b.title));
    if (sortMode === "created-asc") return notes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortMode === "created-desc") return notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return notes.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }, [data, sortMode]);

  if (authChecking) {
    return (
      <main className="auth-shell auth-checking" data-theme={theme}>
        <section className="auth-card" aria-live="polite" aria-busy="true">
          <img src="/brand-mark.svg" alt="" className="auth-brand-logo" />
          <span className="auth-loading-spinner" aria-hidden="true" />
          <p>Opening your workspace…</p>
        </section>
      </main>
    );
  }

  if (token && authCheckError && !user) {
    return (
      <main className="auth-shell auth-checking" data-theme={theme}>
        <section className="auth-card" aria-labelledby="session-error-title">
          <img src="/brand-mark.svg" alt="" className="auth-brand-logo" />
          <h1 id="session-error-title">Your workspace is almost ready.</h1>
          <p className="auth-subtitle" role="alert">{authCheckError}</p>
          <button className="auth-submit" type="button" onClick={() => {
            setAuthChecking(true);
            setAuthCheckError("");
            request.get("/auth/me")
              .then((response) => setUser(response.data.user))
              .catch((err) => {
                if (err.response?.status === 401) signOut();
                else setAuthCheckError("We couldn't verify your session. Check your connection and try again.");
              })
              .finally(() => setAuthChecking(false));
          }}>Try again <span aria-hidden="true">↻</span></button>
          <button className="auth-switch-button" type="button" onClick={signOut}>Sign in instead</button>
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
          <form className="auth-form" onSubmit={submitAuth} aria-busy={authBusy}>
            {authMode === "register" && <label>Your name<input autoComplete="name" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} minLength={2} maxLength={80} required disabled={authBusy} /></label>}
            <label>Email address<input type="email" autoComplete="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required disabled={authBusy} /></label>
            <label>Password<input type="password" autoComplete={authMode === "register" ? "new-password" : "current-password"} value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} minLength={authMode === "register" ? 12 : 1} maxLength={128} required disabled={authBusy} />{authMode === "register" && <small>Use at least 12 characters.</small>}</label>
            {authError && <p className="auth-error" role="alert">{authError}</p>}
            <button className="auth-submit" type="submit" disabled={authBusy}>{authBusy ? "Please wait…" : authMode === "register" ? "Create your account" : "Sign in"} <span aria-hidden="true">↗</span></button>
          </form>
          <p className="auth-switch">{authMode === "register" ? "Already have an account?" : "New to Notes?"} <button type="button" disabled={authBusy} onClick={() => { setAuthMode(authMode === "register" ? "login" : "register"); setAuthError(""); }}> {authMode === "register" ? "Sign in" : "Create account"}</button></p>
          <p className="auth-footnote">Your notes are private to your account.</p>
        </section>
        <aside className="auth-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-note art-note-back"><span>MONDAY / 09:41</span><i>✳</i><h3>Make space<br/>for good ideas.</h3><p>Collect thoughts. Connect the dots.</p></div><div className="art-note art-note-front"><span>FIELD NOTES&nbsp; · &nbsp;01</span><h3>Small steps,<br/>big picture.</h3><div className="art-lines"><i/><i/><i/></div><footer><span>PERSONAL JOURNAL</span><b>↗</b></footer></div><div className="art-caption">A little clarity goes a long way.</div></aside>
      </main>
    );
  }

  return (
    <main className="app" id="app-top" data-theme={theme}>
      <Header searchQuery={searchQuery} handleSearchInputChange={(event) => setSearchQuery(event.target.value)} user={user} onSignOut={signOut} theme={theme} onToggleTheme={() => setTheme((current) => current === "dark" ? "light" : "dark")} />
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
      {loading ? <div className="notes-state" role="status" aria-live="polite"><span className="loading-dot" aria-hidden="true"/> Gathering your notes…</div> : visibleNotes.length === 0 ? <div className="notes-empty"><span className="empty-icon">✳</span><h2>{searchQuery ? "Nothing found just yet" : "A fresh page."}</h2><p>{searchQuery ? "Try another search or a shorter phrase." : "Every good idea starts somewhere. Create your first note."}</p>{!searchQuery && <button type="button" data-bs-toggle="modal" data-bs-target="#noteModal" onClick={resetEditor}>Create your first note <span aria-hidden="true">↗</span></button>}</div> : <Note data={visibleNotes} viewMode={viewMode} updateNote={updateNote} deleteNote={deleteNote} />}
      <Modal addNote={addNote} handleInput={handleInput} handleColorInput={handleColorInput} saveNote={saveNote} updateExistingNote={saveNote} toggle={toggle} saving={saveBusy} error={editorError} />
      <div className="modal fade" id="deleteNoteModal" tabIndex="-1" aria-labelledby="deleteNoteTitle" aria-describedby="deleteNoteDescription" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered delete-confirm-dialog">
          <div className="modal-content delete-confirm-content">
            <div className="modal-header">
              <div className="delete-confirm-icon" aria-hidden="true">!</div>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close delete confirmation" onClick={() => setDeleteCandidate(null)} />
            </div>
            <div className="modal-body">
              <h2 id="deleteNoteTitle">Delete note?</h2>
              <p id="deleteNoteDescription">“{deleteCandidate?.title || "This note"}” will be permanently deleted. This action cannot be undone.</p>
              {deleteError && <p className="delete-confirm-error" role="alert">{deleteError}</p>}
            </div>
            <div className="modal-footer">
              <button type="button" className="delete-cancel-button" data-bs-dismiss="modal" disabled={deleteBusy} onClick={() => { setDeleteCandidate(null); setDeleteError(""); }}>Cancel</button>
              <button type="button" className="delete-confirm-button" onClick={confirmDelete} disabled={deleteBusy || !deleteCandidate}>{deleteBusy ? "Deleting…" : "Delete note"}</button>
            </div>
          </div>
        </div>
      </div>
      <Fab setToggle={setToggle} setAddNote={(value) => { setAddNote(value); setIsId(""); setEditorError(""); }} />
    </main>
  );
};

export default Notes;
