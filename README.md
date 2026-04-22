# MIRA – Contact Management Application
### Junior Python Fullstack Developer – Task 1 Submission

---

## Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Backend | Python + Flask | Lightweight REST API framework, easy to set up |
| Database | SQLite (via sqlite3) | Zero-config persistent storage, perfect for this scale |
| Frontend | React 18 | Component-based UI, reactive state management |
| State Management | Redux Toolkit | Centralized async state, clean action/reducer pattern |
| Build Tool | Vite | Fast dev server and hot module reload |
| Styling | Plain CSS (custom) | Full design control, no framework overhead |

---

## Project Structure

```
mira-contacts/
├── backend/
│   ├── app.py              ← Flask API (all endpoints)
│   ├── requirements.txt    ← Python dependencies
│   └── contacts.db         ← SQLite database (auto-created)
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx                    ← Entry point
        ├── store/
        │   ├── index.js                ← Redux store config
        │   └── contactsSlice.js        ← All async thunks + reducers
        ├── components/
        │   ├── App.jsx                 ← Root component (search, layout)
        │   ├── ContactCard.jsx         ← Individual contact display
        │   └── ContactForm.jsx         ← Create/Edit modal form
        └── styles/
            └── app.css                 ← Complete custom styling
```

---

## How to Run

### Step 1 — Backend (Flask)

```bash
cd mira-contacts/backend

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate       # macOS/Linux
venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```
Flask runs at: **http://localhost:5000**

---

### Step 2 — Frontend (React + Vite)

Open a **new terminal**:

```bash
cd mira-contacts/frontend

# Install Node packages
npm install

# Start the dev server
npm run dev
```
App runs at: **http://localhost:3000**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | List all contacts (supports `?search=`) |
| GET | `/api/contacts/:id` | Get single contact |
| POST | `/api/contacts` | Create new contact |
| PUT | `/api/contacts/:id` | Update existing contact |
| DELETE | `/api/contacts/:id` | Delete a contact |
| GET | `/api/contacts/stats` | Get total count |

---

## Features Implemented

### CRUD
- **Create** – Add new contact via modal form
- **Read** – Display all contacts in responsive card grid
- **Update** – Edit any contact with pre-filled form
- **Delete** – Delete with inline confirmation (prevents accidental deletes)

### Data Validation (Backend + Frontend)
- Required field checks on all five fields
- Email format validated with regex
- Phone validated for 7–15 digit format with optional `+`, spaces, dashes
- Duplicate email detection (both on create and update)
- Inline field error messages shown under each input

### Search
- Live search across name, email, and phone as you type
- 300ms debounce to reduce API calls

### UX Details
- Dark theme with clean medical/tech aesthetic
- Responsive grid layout (works on mobile)
- Loading indicators and success/error toasts
- Hover states, smooth transitions, animated empty state
- Modal closes automatically on success

---

## Challenges Faced

1. **Duplicate email on update** — Had to pass the current contact ID into validation to exclude itself from the uniqueness check.
2. **CORS** — Needed `flask-cors` to allow the React dev server (port 3000) to talk to Flask (port 5000).
3. **Optimistic vs server-driven state** — Chose server-driven (re-fetch after mutation) for simplicity and correctness.
4. **Field error mapping** — Returning structured `{errors: {field: message}}` from Flask maps cleanly to Redux state and renders per-field in the form.

---

