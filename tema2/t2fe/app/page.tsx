"use client";

import dynamic from "next/dynamic";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiRequest, AppUser, EventItem, getApiBaseUrl } from "./lib/api";

type MessageState = { type: "success" | "error"; text: string } | null;
type MainTab = "home" | "calendar" | "mobility" | "wakeup" | "reading" | "admin";

type MePayload = {
  user: {
    home?: { lat: number; lng: number; address?: string | null } | null;
  };
};

type CommutePayload = {
  firstActivity?: {
    eventId: string;
    car: { distanceMeters?: number; durationSeconds?: string | number };
    walk: { distanceMeters?: number; durationSeconds?: string | number };
  } | null;
  nextFromCurrent?: {
    fromEventId: string;
    toEventId: string;
    car: { distanceMeters?: number; durationSeconds?: string | number };
    walk: { distanceMeters?: number; durationSeconds?: string | number };
  } | null;
};

type WeatherPayload = {
  weather?: {
    summary?: string;
    temperatureC?: number | null;
    precipitationProbability?: number;
    severe?: boolean;
  };
};

type WalkPredictionPayload = {
  canWalk?: boolean;
  factors?: {
    walkMinutes?: number;
    precipitationProbability?: number;
    severe?: boolean;
  };
};

type ReadingRecommendationPayload = {
  recommendation?: {
    books?: Array<{ id?: string | number; title?: string; author?: string }>;
    suggestedActivity?: {
      title: string;
      startDateTime: string;
      endDateTime: string;
      location: string;
      description?: string;
      recurrence: "once" | "weekly";
      lat?: number;
      lng?: number;
    };
  };
};

const PinMap = dynamic(() => import("./components/PinMap"), { ssr: false });

const now = new Date();
const today = now.toISOString().slice(0, 10);

const defaultEventForm = {
  title: "",
  startDateTime: `${today}T09:00`,
  endDateTime: `${today}T10:00`,
  location: "",
  description: "",
  recurrence: "once",
  lat: "",
  lng: "",
};

function toIso(value: string) {
  if (!value) return "";
  return new Date(value).toISOString();
}

function formatEventDate(iso: string) {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return iso;
  return date.toLocaleString();
}

function formatDuration(duration: string | number | undefined) {
  if (typeof duration === "number") {
    const minutes = Math.ceil(duration / 60);
    return `${minutes} min`;
  }
  if (typeof duration === "string") {
    const matched = duration.match(/^(\d+)(?:\.\d+)?s$/);
    if (matched) {
      const minutes = Math.ceil(Number(matched[1]) / 60);
      return `${minutes} min`;
    }
    return duration;
  }
  return "N/A";
}

function formatDistance(distanceMeters: number | undefined) {
  if (typeof distanceMeters !== "number") return "N/A";
  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [message, setMessage] = useState<MessageState>(null);
  const [loading, setLoading] = useState(false);

  const [authTab, setAuthTab] = useState<"login" | "register" | "reset">("login");
  const [mainTab, setMainTab] = useState<MainTab>("home");

  const [registerForm, setRegisterForm] = useState({ email: "", password: "", name: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const [homeForm, setHomeForm] = useState({ lat: "", lng: "" });
  const [weeklyWakeupForm, setWeeklyWakeupForm] = useState({ dayOfWeek: "monday", time: "07:00" });
  const [overrideWakeupForm, setOverrideWakeupForm] = useState({ date: today, time: "06:30" });
  const [wakeupQueryDate, setWakeupQueryDate] = useState(today);
  const [wakeupResult, setWakeupResult] = useState<{ wakeupTime?: string | null; source?: string; date?: string } | null>(
    null,
  );

  const [eventForm, setEventForm] = useState(defaultEventForm);
  const [eventsDate, setEventsDate] = useState(today);
  const [events, setEvents] = useState<EventItem[]>([]);

  const [commuteDate, setCommuteDate] = useState(today);
  const [commuteData, setCommuteData] = useState<CommutePayload | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherPayload | null>(null);
  const [walkPrediction, setWalkPrediction] = useState<WalkPredictionPayload | null>(null);
  const [mobilityContextLabel, setMobilityContextLabel] = useState<string>("");

  const [passwordResetRequest, setPasswordResetRequest] = useState({ email: "" });
  const [passwordResetConfirm, setPasswordResetConfirm] = useState({ token: "", newPassword: "" });
  const [recommendationDate, setRecommendationDate] = useState(today);
  const [recommendation, setRecommendation] = useState<ReadingRecommendationPayload | null>(null);

  const [adminTargetUserId, setAdminTargetUserId] = useState("");
  const [books, setBooks] = useState<Record<string, unknown>[]>([]);
  const [authors, setAuthors] = useState<Record<string, unknown>[]>([]);
  const [bookForm, setBookForm] = useState({ id: "", title: "", author: "", year: "", genre: "" });
  const [authorForm, setAuthorForm] = useState({ id: "", name: "", birthYear: "", nationality: "" });

  const pickedLat = homeForm.lat ? Number(homeForm.lat) : null;
  const pickedLng = homeForm.lng ? Number(homeForm.lng) : null;

  useEffect(() => {
    const storedToken = window.localStorage.getItem("token");
    const storedUser = window.localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const showError = (error: unknown) => {
    setMessage({
      type: "error",
      text: error instanceof Error ? error.message : "Unexpected error.",
    });
  };

  async function withLoading<T>(fn: () => Promise<T>) {
    setLoading(true);
    setMessage(null);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  }

  async function loadMe(activeToken: string) {
    try {
      const response = await apiRequest<MePayload>("/api/me", {}, activeToken);
      const home = response.user?.home;
      if (home && typeof home.lat === "number" && typeof home.lng === "number") {
        setHomeForm({ lat: String(home.lat), lng: String(home.lng) });
      }
    } catch {
      // ignore
    }
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    await withLoading(async () => {
      try {
        await apiRequest("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(registerForm),
        });
        setMessage({ type: "success", text: "Registration successful. You can now log in." });
        setRegisterForm({ email: "", password: "", name: "" });
        setAuthTab("login");
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    await withLoading(async () => {
      try {
        const response = await apiRequest<{ accessToken: string; user: AppUser }>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(loginForm),
        });
        setToken(response.accessToken);
        setUser(response.user);
        window.localStorage.setItem("token", response.accessToken);
        window.localStorage.setItem("user", JSON.stringify(response.user));
        await loadMe(response.accessToken);
        setMessage({ type: "success", text: "Login successful." });
        setMainTab("home");
      } catch (error) {
        showError(error);
      }
    });
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setEvents([]);
    setMainTab("home");
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
    setMessage({ type: "success", text: "Logged out." });
  }

  async function handleSetHome(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    if (pickedLat === null || pickedLng === null) {
      setMessage({ type: "error", text: "Pick a point on the map first." });
      return;
    }

    await withLoading(async () => {
      try {
        await apiRequest(
          "/api/me/home",
          {
            method: "PATCH",
            body: JSON.stringify({ lat: pickedLat, lng: pickedLng }),
          },
          token,
        );
        setMessage({ type: "success", text: "Home location saved from map pin." });
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleWeeklyWakeup(event: FormEvent) {
    event.preventDefault();
    if (!token) return;

    await withLoading(async () => {
      try {
        await apiRequest(
          "/api/me/wakeup/weekly",
          {
            method: "PATCH",
            body: JSON.stringify(weeklyWakeupForm),
          },
          token,
        );
        setMessage({ type: "success", text: "Weekly wakeup updated." });
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleOverrideWakeup(event: FormEvent) {
    event.preventDefault();
    if (!token) return;

    await withLoading(async () => {
      try {
        await apiRequest(
          "/api/me/wakeup/override",
          {
            method: "PATCH",
            body: JSON.stringify(overrideWakeupForm),
          },
          token,
        );
        setMessage({ type: "success", text: "Date override saved." });
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleWakeupQuery(event: FormEvent) {
    event.preventDefault();
    if (!token || !wakeupQueryDate) return;

    await withLoading(async () => {
      try {
        const response = await apiRequest<{ wakeupTime: string | null; source: string; date: string }>(
          `/api/me/wakeup?date=${wakeupQueryDate}`,
          {},
          token,
        );
        setWakeupResult(response);
      } catch (error) {
        showError(error);
      }
    });
  }

  async function loadEvents() {
    if (!token) return;
    await withLoading(async () => {
      try {
        const query = eventsDate ? `?date=${eventsDate}` : "";
        const response = await apiRequest<{ events: EventItem[] }>(`/api/events${query}`, {}, token);
        setEvents(response.events || []);
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleCreateEvent(event: FormEvent) {
    event.preventDefault();
    if (!token) return;

    await withLoading(async () => {
      try {
        await apiRequest(
          "/api/events",
          {
            method: "POST",
            body: JSON.stringify({
              title: eventForm.title,
              startDateTime: toIso(eventForm.startDateTime),
              endDateTime: toIso(eventForm.endDateTime),
              location: eventForm.location,
              description: eventForm.description,
              recurrence: eventForm.recurrence,
              lat: eventForm.lat ? Number(eventForm.lat) : undefined,
              lng: eventForm.lng ? Number(eventForm.lng) : undefined,
            }),
          },
          token,
        );
        setEventForm(defaultEventForm);
        setMessage({ type: "success", text: "Event created." });
        await loadEvents();
      } catch (error) {
        showError(error);
      }
    });
  }

  async function addRecommendationToCalendar() {
    if (!token) return;

    const activity = recommendation?.recommendation?.suggestedActivity;
    if (!activity) {
      setMessage({ type: "error", text: "No recommendation activity available." });
      return;
    }

    await withLoading(async () => {
      try {
        await apiRequest(
          "/api/events",
          {
            method: "POST",
            body: JSON.stringify({
              title: activity.title,
              startDateTime: activity.startDateTime,
              endDateTime: activity.endDateTime,
              location: activity.location,
              description: activity.description || "Reading recommendation",
              recurrence: activity.recurrence,
              lat: activity.lat,
              lng: activity.lng,
            }),
          },
          token,
        );
        setMessage({ type: "success", text: "Recommended reading event added to calendar." });
        setMainTab("calendar");
        await loadEvents();
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleDeleteEvent(eventId: string) {
    if (!token) return;
    await withLoading(async () => {
      try {
        await apiRequest(`/api/events/${eventId}`, { method: "DELETE" }, token);
        setMessage({ type: "success", text: "Event removed." });
        await loadEvents();
      } catch (error) {
        showError(error);
      }
    });
  }

  async function resolveMobilityContext(date: string, activeToken: string) {
    const response = await apiRequest<{ events: EventItem[] }>(`/api/events?date=${date}`, {}, activeToken);
    const dateEvents = [...(response.events || [])].sort(
      (first, second) => new Date(first.startDateTime).getTime() - new Date(second.startDateTime).getTime(),
    );

    const isToday = date === new Date().toISOString().slice(0, 10);
    const nowTimestamp = Date.now();
    const currentEvent =
      isToday
        ? dateEvents.find((eventItem) => {
            const start = new Date(eventItem.startDateTime).getTime();
            const end = new Date(eventItem.endDateTime).getTime();
            return nowTimestamp >= start && nowTimestamp <= end;
          }) || null
        : null;

    if (currentEvent) {
      const nextEvent =
        dateEvents.find(
          (eventItem) => new Date(eventItem.startDateTime).getTime() > new Date(currentEvent.endDateTime).getTime(),
        ) || null;
      const label = nextEvent
        ? `Using current event: ${currentEvent.title} → next: ${nextEvent.title}`
        : `Using current event: ${currentEvent.title} (no next event found)`;
      return { currentEventId: currentEvent.id, label };
    }

    if (dateEvents.length > 0) {
      return { currentEventId: null, label: `Using home → first event: ${dateEvents[0].title}` };
    }

    return { currentEventId: null, label: "No events found for selected date." };
  }

  async function handleCommute(event: FormEvent) {
    event.preventDefault();
    if (!token || !commuteDate) return;

    await withLoading(async () => {
      try {
        const context = await resolveMobilityContext(commuteDate, token);
        const query = new URLSearchParams({ date: commuteDate });
        if (context.currentEventId) query.set("currentEventId", context.currentEventId);
        const response = await apiRequest<CommutePayload>(`/api/commute-estimates?${query.toString()}`, {}, token);
        setCommuteData(response);
        setMobilityContextLabel(context.label);
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleWeather(event: FormEvent) {
    event.preventDefault();
    if (!token || !commuteDate) return;

    await withLoading(async () => {
      try {
        const response = await apiRequest<WeatherPayload>(`/api/weather?date=${commuteDate}`, {}, token);
        setWeatherData(response);
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleWalkPrediction(event: FormEvent) {
    event.preventDefault();
    if (!token || !commuteDate) return;

    await withLoading(async () => {
      try {
        const context = await resolveMobilityContext(commuteDate, token);
        const query = new URLSearchParams({ date: commuteDate });
        if (context.currentEventId) query.set("currentEventId", context.currentEventId);
        const response = await apiRequest<WalkPredictionPayload>(`/api/walk-prediction?${query.toString()}`, {}, token);
        setWalkPrediction(response);
        setMobilityContextLabel(context.label);
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleResetRequest(event: FormEvent) {
    event.preventDefault();
    await withLoading(async () => {
      try {
        await apiRequest("/api/auth/password-reset/request", {
          method: "POST",
          body: JSON.stringify(passwordResetRequest),
        });
        setMessage({ type: "success", text: "Reset request sent (if account exists)." });
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleResetConfirm(event: FormEvent) {
    event.preventDefault();
    await withLoading(async () => {
      try {
        await apiRequest("/api/auth/password-reset/confirm", {
          method: "POST",
          body: JSON.stringify(passwordResetConfirm),
        });
        setMessage({ type: "success", text: "Password updated." });
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleRecommendation(event: FormEvent) {
    event.preventDefault();
    if (!token) return;

    await withLoading(async () => {
      try {
        const query = recommendationDate ? `?date=${recommendationDate}` : "";
        const response = await apiRequest<ReadingRecommendationPayload>(`/api/recommendations/reading${query}`, {}, token);
        setRecommendation(response);
      } catch (error) {
        showError(error);
      }
    });
  }

  async function loadAdminCollections() {
    if (!token || user?.role !== "admin") return;
    await withLoading(async () => {
      try {
        const [booksResponse, authorsResponse] = await Promise.all([
          apiRequest<{ data: Record<string, unknown>[] }>("/api/admin/books", {}, token),
          apiRequest<{ data: Record<string, unknown>[] }>("/api/admin/authors", {}, token),
        ]);
        setBooks(booksResponse.data || []);
        setAuthors(authorsResponse.data || []);
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleAdminRemoveUser(event: FormEvent) {
    event.preventDefault();
    if (!token || !adminTargetUserId.trim()) return;
    await withLoading(async () => {
      try {
        await apiRequest(`/api/admin/users/${adminTargetUserId.trim()}`, { method: "DELETE" }, token);
        setMessage({ type: "success", text: "User removed." });
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleBookCreate(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    await withLoading(async () => {
      try {
        await apiRequest(
          "/api/admin/books",
          {
            method: "POST",
            body: JSON.stringify({
              title: bookForm.title,
              author: bookForm.author,
              year: bookForm.year ? Number(bookForm.year) : undefined,
              genre: bookForm.genre || undefined,
            }),
          },
          token,
        );
        setMessage({ type: "success", text: "Book added." });
        await loadAdminCollections();
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleBookUpdate(event: FormEvent) {
    event.preventDefault();
    if (!token || !bookForm.id) return;
    await withLoading(async () => {
      try {
        await apiRequest(
          `/api/admin/books/${bookForm.id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              title: bookForm.title || undefined,
              author: bookForm.author || undefined,
              year: bookForm.year ? Number(bookForm.year) : undefined,
              genre: bookForm.genre || undefined,
            }),
          },
          token,
        );
        setMessage({ type: "success", text: "Book updated." });
        await loadAdminCollections();
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleBookDelete(event: FormEvent) {
    event.preventDefault();
    if (!token || !bookForm.id) return;
    await withLoading(async () => {
      try {
        await apiRequest(`/api/admin/books/${bookForm.id}`, { method: "DELETE" }, token);
        setMessage({ type: "success", text: "Book deleted." });
        await loadAdminCollections();
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleAuthorCreate(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    await withLoading(async () => {
      try {
        await apiRequest(
          "/api/admin/authors",
          {
            method: "POST",
            body: JSON.stringify({
              name: authorForm.name,
              birthYear: authorForm.birthYear ? Number(authorForm.birthYear) : undefined,
              nationality: authorForm.nationality || undefined,
            }),
          },
          token,
        );
        setMessage({ type: "success", text: "Author added." });
        await loadAdminCollections();
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleAuthorUpdate(event: FormEvent) {
    event.preventDefault();
    if (!token || !authorForm.id) return;
    await withLoading(async () => {
      try {
        await apiRequest(
          `/api/admin/authors/${authorForm.id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              name: authorForm.name || undefined,
              birthYear: authorForm.birthYear ? Number(authorForm.birthYear) : undefined,
              nationality: authorForm.nationality || undefined,
            }),
          },
          token,
        );
        setMessage({ type: "success", text: "Author updated." });
        await loadAdminCollections();
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleAuthorDelete(event: FormEvent) {
    event.preventDefault();
    if (!token || !authorForm.id) return;
    await withLoading(async () => {
      try {
        await apiRequest(`/api/admin/authors/${authorForm.id}`, { method: "DELETE" }, token);
        setMessage({ type: "success", text: "Author deleted." });
        await loadAdminCollections();
      } catch (error) {
        showError(error);
      }
    });
  }

  useEffect(() => {
    if (token) {
      void loadEvents();
      void loadMe(token);
      if (user?.role === "admin") {
        void loadAdminCollections();
      }
    }
  }, [token, user?.role]);

  const tabButtons: { key: MainTab; label: string; adminOnly?: boolean }[] = [
    { key: "home", label: "Overview" },
    { key: "calendar", label: "Calendar" },
    { key: "mobility", label: "Commute & Weather" },
    { key: "wakeup", label: "Wakeup" },
    { key: "reading", label: "Reading" },
    { key: "admin", label: "Admin", adminOnly: true },
  ];

  return (
    <main className="container-main app-shell">
      <header className="header app-header">
        <div>
          <h1>Schedule & Activity Planner</h1>
          <p>Backend API: {getApiBaseUrl()}</p>
        </div>
        {token && user ? (
          <div className="user-chip">
            <span>{user.email}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : null}
      </header>

      {message ? (
        <div className={message.type === "success" ? "message success" : "message error"}>{message.text}</div>
      ) : null}

      {!token ? (
        <section className="card auth-card">
          <div className="tab-row">
            <button className={authTab === "login" ? "tab active" : "tab"} type="button" onClick={() => setAuthTab("login")}>Login</button>
            <button className={authTab === "register" ? "tab active" : "tab"} type="button" onClick={() => setAuthTab("register")}>Register</button>
            <button className={authTab === "reset" ? "tab active" : "tab"} type="button" onClick={() => setAuthTab("reset")}>Reset password</button>
          </div>

          {authTab === "login" ? (
            <form className="stack" onSubmit={handleLogin}>
              <input placeholder="Email" type="email" value={loginForm.email} onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))} />
              <input placeholder="Password" type="password" value={loginForm.password} onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))} />
              <button disabled={loading}>Sign in</button>
            </form>
          ) : null}

          {authTab === "register" ? (
            <form className="stack" onSubmit={handleRegister}>
              <input placeholder="Name" value={registerForm.name} onChange={(e) => setRegisterForm((prev) => ({ ...prev, name: e.target.value }))} />
              <input placeholder="Email" type="email" value={registerForm.email} onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))} />
              <input placeholder="Password" type="password" value={registerForm.password} onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))} />
              <button disabled={loading}>Create account</button>
            </form>
          ) : null}

          {authTab === "reset" ? (
            <div className="grid-two">
              <form className="stack" onSubmit={handleResetRequest}>
                <h3>Request reset link</h3>
                <input placeholder="Email" type="email" value={passwordResetRequest.email} onChange={(e) => setPasswordResetRequest({ email: e.target.value })} />
                <button disabled={loading}>Send reset link</button>
              </form>
              <form className="stack" onSubmit={handleResetConfirm}>
                <h3>Confirm reset</h3>
                <input placeholder="Reset token" value={passwordResetConfirm.token} onChange={(e) => setPasswordResetConfirm((prev) => ({ ...prev, token: e.target.value }))} />
                <input placeholder="New password" type="password" value={passwordResetConfirm.newPassword} onChange={(e) => setPasswordResetConfirm((prev) => ({ ...prev, newPassword: e.target.value }))} />
                <button disabled={loading}>Update password</button>
              </form>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="app-body">
          <aside className="side-nav card">
            {tabButtons
              .filter((item) => !item.adminOnly || user?.role === "admin")
              .map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={mainTab === item.key ? "tab active" : "tab"}
                  onClick={() => setMainTab(item.key)}
                >
                  {item.label}
                </button>
              ))}
            {loading ? <p className="hint">Loading…</p> : null}
          </aside>

          <div className="content-area">
            {mainTab === "home" ? (
              <section className="grid-two">
                <div className="card">
                  <h2>Today snapshot</h2>
                  <p>Total loaded events: {events.length}</p>
                  <p>Commute source: current running event (if any), otherwise home.</p>
                  <div className="row-two">
                    <button type="button" onClick={() => setMainTab("calendar")}>Manage calendar</button>
                    <button type="button" onClick={() => setMainTab("mobility")}>Check commute</button>
                  </div>
                </div>
                <form className="card" onSubmit={handleSetHome}>
                  <h2>Home location</h2>
                  <p className="hint">Click on the map to place your home pin.</p>
                  <PinMap
                    lat={pickedLat}
                    lng={pickedLng}
                    onPick={(lat, lng) => setHomeForm({ lat: lat.toFixed(6), lng: lng.toFixed(6) })}
                  />
                  <p className="hint">Selected: {homeForm.lat || "-"}, {homeForm.lng || "-"}</p>
                  <button disabled={loading}>Save home pin</button>
                </form>
              </section>
            ) : null}

            {mainTab === "calendar" ? (
              <section className="grid-two">
                <form className="card" onSubmit={handleCreateEvent}>
                  <h2>Add event</h2>
                  <input placeholder="Title" value={eventForm.title} onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))} />
                  <div className="row-two">
                    <input type="datetime-local" value={eventForm.startDateTime} onChange={(e) => setEventForm((prev) => ({ ...prev, startDateTime: e.target.value }))} />
                    <input type="datetime-local" value={eventForm.endDateTime} onChange={(e) => setEventForm((prev) => ({ ...prev, endDateTime: e.target.value }))} />
                  </div>
                  <input placeholder="Location" value={eventForm.location} onChange={(e) => setEventForm((prev) => ({ ...prev, location: e.target.value }))} />
                  <input placeholder="Description" value={eventForm.description} onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))} />
                  <div className="row-two">
                    <select value={eventForm.recurrence} onChange={(e) => setEventForm((prev) => ({ ...prev, recurrence: e.target.value }))}>
                      <option value="once">Once</option>
                      <option value="weekly">Weekly</option>
                    </select>
                    <input placeholder="Lat (optional)" value={eventForm.lat} onChange={(e) => setEventForm((prev) => ({ ...prev, lat: e.target.value }))} />
                  </div>
                  <input placeholder="Lng (optional)" value={eventForm.lng} onChange={(e) => setEventForm((prev) => ({ ...prev, lng: e.target.value }))} />
                  <button disabled={loading}>Create event</button>
                </form>

                <div className="card">
                  <h2>Events</h2>
                  <div className="row-two">
                    <input type="date" value={eventsDate} onChange={(e) => setEventsDate(e.target.value)} />
                    <button onClick={loadEvents} disabled={loading} type="button">Load events</button>
                  </div>
                  <ul className="list">
                    {events.map((eventItem) => (
                      <li key={eventItem.id} className="list-item">
                        <div>
                          <strong>{eventItem.title}</strong> · {eventItem.location}
                          <div className="hint">{formatEventDate(eventItem.startDateTime)} → {formatEventDate(eventItem.endDateTime)}</div>
                          <div className="hint">Type: {eventItem.recurrence}</div>
                        </div>
                        <div className="stack-inline">
                          <button type="button" onClick={() => handleDeleteEvent(eventItem.id)} disabled={loading}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}

            {mainTab === "mobility" ? (
              <section className="grid-two">
                <form className="card" onSubmit={handleCommute}>
                  <h2>Commute estimates</h2>
                  <input type="date" value={commuteDate} onChange={(e) => setCommuteDate(e.target.value)} />
                  <button disabled={loading}>Get commute</button>
                  {mobilityContextLabel ? <p className="hint">{mobilityContextLabel}</p> : null}
                  {commuteData?.firstActivity ? (
                    <div className="result-block">
                      <h3>From home to first activity</h3>
                      <p>By car: {formatDuration(commuteData.firstActivity.car?.durationSeconds)} · {formatDistance(commuteData.firstActivity.car?.distanceMeters)}</p>
                      <p>Walking: {formatDuration(commuteData.firstActivity.walk?.durationSeconds)} · {formatDistance(commuteData.firstActivity.walk?.distanceMeters)}</p>
                    </div>
                  ) : null}
                  {commuteData?.nextFromCurrent ? (
                    <div className="result-block">
                      <h3>Current → next activity</h3>
                      <p>By car: {formatDuration(commuteData.nextFromCurrent.car?.durationSeconds)} · {formatDistance(commuteData.nextFromCurrent.car?.distanceMeters)}</p>
                      <p>Walking: {formatDuration(commuteData.nextFromCurrent.walk?.durationSeconds)} · {formatDistance(commuteData.nextFromCurrent.walk?.distanceMeters)}</p>
                    </div>
                  ) : null}
                </form>

                <form className="card" onSubmit={handleWeather}>
                  <h2>Weather forecast</h2>
                  <input type="date" value={commuteDate} onChange={(e) => setCommuteDate(e.target.value)} />
                  <button disabled={loading}>Get weather</button>
                  {weatherData?.weather ? (
                    <div className="result-block">
                      <p><strong>Summary:</strong> {weatherData.weather.summary || "N/A"}</p>
                      <p><strong>Temperature:</strong> {typeof weatherData.weather.temperatureC === "number" ? `${weatherData.weather.temperatureC}°C` : "N/A"}</p>
                      <p><strong>Rain chance:</strong> {weatherData.weather.precipitationProbability ?? 0}%</p>
                      <p><strong>Severe:</strong> {weatherData.weather.severe ? "Yes" : "No"}</p>
                    </div>
                  ) : null}
                </form>

                <form className="card" onSubmit={handleWalkPrediction}>
                  <h2>Walk prediction</h2>
                  <input type="date" value={commuteDate} onChange={(e) => setCommuteDate(e.target.value)} />
                  <button disabled={loading}>Can I walk?</button>
                  {mobilityContextLabel ? <p className="hint">{mobilityContextLabel}</p> : null}
                  {typeof walkPrediction?.canWalk === "boolean" ? (
                    <div className="result-block">
                      <p><strong>Recommendation:</strong> {walkPrediction.canWalk ? "You can walk" : "Better not walk"}</p>
                      <p><strong>Walk time:</strong> {walkPrediction.factors?.walkMinutes ?? "N/A"} min</p>
                      <p><strong>Rain chance:</strong> {walkPrediction.factors?.precipitationProbability ?? "N/A"}%</p>
                      <p><strong>Severe weather:</strong> {walkPrediction.factors?.severe ? "Yes" : "No"}</p>
                    </div>
                  ) : null}
                </form>
              </section>
            ) : null}

            {mainTab === "wakeup" ? (
              <section className="grid-two">
                <form className="card" onSubmit={handleWeeklyWakeup}>
                  <h2>Weekly wakeup</h2>
                  <select value={weeklyWakeupForm.dayOfWeek} onChange={(e) => setWeeklyWakeupForm((prev) => ({ ...prev, dayOfWeek: e.target.value }))}>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                  <input type="time" value={weeklyWakeupForm.time} onChange={(e) => setWeeklyWakeupForm((prev) => ({ ...prev, time: e.target.value }))} />
                  <button disabled={loading}>Save weekly wakeup</button>
                </form>

                <form className="card" onSubmit={handleOverrideWakeup}>
                  <h2>Single-day override</h2>
                  <input type="date" value={overrideWakeupForm.date} onChange={(e) => setOverrideWakeupForm((prev) => ({ ...prev, date: e.target.value }))} />
                  <input type="time" value={overrideWakeupForm.time} onChange={(e) => setOverrideWakeupForm((prev) => ({ ...prev, time: e.target.value }))} />
                  <button disabled={loading}>Save override</button>
                </form>

                <form className="card" onSubmit={handleWakeupQuery}>
                  <h2>Check wakeup for date</h2>
                  <input type="date" value={wakeupQueryDate} onChange={(e) => setWakeupQueryDate(e.target.value)} />
                  <button disabled={loading}>Fetch wakeup</button>
                  {wakeupResult ? (
                    <div className="result-block">
                      <p><strong>Date:</strong> {wakeupResult.date}</p>
                      <p><strong>Wakeup:</strong> {wakeupResult.wakeupTime || "Not set"}</p>
                      <p><strong>Source:</strong> {wakeupResult.source || "N/A"}</p>
                    </div>
                  ) : null}
                </form>
              </section>
            ) : null}

            {mainTab === "reading" ? (
              <section className="grid-two">
                <form className="card" onSubmit={handleRecommendation}>
                  <h2>Reading recommendation</h2>
                  <input type="date" value={recommendationDate} onChange={(e) => setRecommendationDate(e.target.value)} />
                  <button disabled={loading}>Get recommendation</button>
                </form>

                {recommendation?.recommendation ? (
                  <div className="card">
                    <h2>Suggested reading plan</h2>
                    <div className="result-block">
                      <h3>Suggested activity</h3>
                      <p><strong>Title:</strong> {recommendation.recommendation.suggestedActivity?.title}</p>
                      <p><strong>When:</strong> {formatEventDate(recommendation.recommendation.suggestedActivity?.startDateTime || "")}</p>
                      <p><strong>Location:</strong> {recommendation.recommendation.suggestedActivity?.location}</p>
                      <p><strong>Description:</strong> {recommendation.recommendation.suggestedActivity?.description}</p>
                    </div>
                    <div className="result-block">
                      <h3>Books</h3>
                      <ul className="simple-list">
                        {(recommendation.recommendation.books || []).map((book, index) => (
                          <li key={`${book.id ?? index}-${book.title ?? "book"}`}>{book.title || "Untitled"}{book.author ? ` — ${book.author}` : ""}</li>
                        ))}
                      </ul>
                    </div>
                    <button type="button" onClick={addRecommendationToCalendar} disabled={loading}>Add recommendation to calendar</button>
                  </div>
                ) : null}
              </section>
            ) : null}

            {mainTab === "admin" && user?.role === "admin" ? (
              <section className="grid-two">
                <form className="card" onSubmit={handleAdminRemoveUser}>
                  <h2>Remove user</h2>
                  <input placeholder="User ID" value={adminTargetUserId} onChange={(e) => setAdminTargetUserId(e.target.value)} />
                  <button disabled={loading}>Remove user</button>
                </form>

                <div className="card">
                  <h2>Books</h2>
                  <button onClick={loadAdminCollections} type="button" disabled={loading}>Reload books/authors</button>
                  <form className="inner-form" onSubmit={handleBookCreate}>
                    <input placeholder="Title" value={bookForm.title} onChange={(e) => setBookForm((p) => ({ ...p, title: e.target.value }))} />
                    <input placeholder="Author" value={bookForm.author} onChange={(e) => setBookForm((p) => ({ ...p, author: e.target.value }))} />
                    <input placeholder="Year" value={bookForm.year} onChange={(e) => setBookForm((p) => ({ ...p, year: e.target.value }))} />
                    <input placeholder="Genre" value={bookForm.genre} onChange={(e) => setBookForm((p) => ({ ...p, genre: e.target.value }))} />
                    <button disabled={loading}>Add book</button>
                  </form>
                  <form className="inner-form" onSubmit={handleBookUpdate}>
                    <input placeholder="Book ID" value={bookForm.id} onChange={(e) => setBookForm((p) => ({ ...p, id: e.target.value }))} />
                    <button disabled={loading}>Update using current fields</button>
                  </form>
                  <form className="inner-form" onSubmit={handleBookDelete}>
                    <input placeholder="Book ID" value={bookForm.id} onChange={(e) => setBookForm((p) => ({ ...p, id: e.target.value }))} />
                    <button disabled={loading}>Delete book</button>
                  </form>
                  <ul className="simple-list">
                    {books.map((book, index) => (
                      <li key={`book-${index}`}>{String(book.id ?? "?")}: {String(book.title ?? "Untitled")} — {String(book.author ?? "Unknown")}</li>
                    ))}
                  </ul>
                </div>

                <div className="card">
                  <h2>Authors</h2>
                  <form className="inner-form" onSubmit={handleAuthorCreate}>
                    <input placeholder="Name" value={authorForm.name} onChange={(e) => setAuthorForm((p) => ({ ...p, name: e.target.value }))} />
                    <input placeholder="Birth year" value={authorForm.birthYear} onChange={(e) => setAuthorForm((p) => ({ ...p, birthYear: e.target.value }))} />
                    <input placeholder="Nationality" value={authorForm.nationality} onChange={(e) => setAuthorForm((p) => ({ ...p, nationality: e.target.value }))} />
                    <button disabled={loading}>Add author</button>
                  </form>
                  <form className="inner-form" onSubmit={handleAuthorUpdate}>
                    <input placeholder="Author ID" value={authorForm.id} onChange={(e) => setAuthorForm((p) => ({ ...p, id: e.target.value }))} />
                    <button disabled={loading}>Update using current fields</button>
                  </form>
                  <form className="inner-form" onSubmit={handleAuthorDelete}>
                    <input placeholder="Author ID" value={authorForm.id} onChange={(e) => setAuthorForm((p) => ({ ...p, id: e.target.value }))} />
                    <button disabled={loading}>Delete author</button>
                  </form>
                  <ul className="simple-list">
                    {authors.map((author, index) => (
                      <li key={`author-${index}`}>{String(author.id ?? "?")}: {String(author.name ?? "Unknown")}</li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}
          </div>
        </section>
      )}
    </main>
  );
}
