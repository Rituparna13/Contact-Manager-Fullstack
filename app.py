from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import re
import os

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), "contacts.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            address TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def validate_contact(data, contact_id=None):
    errors = {}

    if not data.get("first_name", "").strip():
        errors["first_name"] = "First name is required."
    elif len(data["first_name"].strip()) < 2:
        errors["first_name"] = "First name must be at least 2 characters."

    if not data.get("last_name", "").strip():
        errors["last_name"] = "Last name is required."
    elif len(data["last_name"].strip()) < 2:
        errors["last_name"] = "Last name must be at least 2 characters."

    if not data.get("address", "").strip():
        errors["address"] = "Address is required."

    email = data.get("email", "").strip()
    if not email:
        errors["email"] = "Email is required."
    elif not re.match(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$", email):
        errors["email"] = "Enter a valid email address."
    else:
        conn = get_db()
        if contact_id:
            row = conn.execute(
                "SELECT id FROM contacts WHERE email = ? AND id != ?", (email, contact_id)
            ).fetchone()
        else:
            row = conn.execute(
                "SELECT id FROM contacts WHERE email = ?", (email,)
            ).fetchone()
        conn.close()
        if row:
            errors["email"] = "This email is already registered."

    phone = data.get("phone", "").strip()
    if not phone:
        errors["phone"] = "Phone number is required."
    elif not re.match(r"^\+?[0-9\s\-\(\)]{7,15}$", phone):
        errors["phone"] = "Enter a valid phone number (7–15 digits)."

    return errors


@app.route("/api/contacts", methods=["GET"])
def get_contacts():
    search = request.args.get("search", "").strip()
    conn = get_db()
    if search:
        like = f"%{search}%"
        rows = conn.execute(
            """SELECT * FROM contacts
               WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?
               ORDER BY created_at DESC""",
            (like, like, like, like)
        ).fetchall()
    else:
        rows = conn.execute("SELECT * FROM contacts ORDER BY created_at DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/contacts/<int:contact_id>", methods=["GET"])
def get_contact(contact_id):
    conn = get_db()
    row = conn.execute("SELECT * FROM contacts WHERE id = ?", (contact_id,)).fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Contact not found."}), 404
    return jsonify(dict(row))


@app.route("/api/contacts", methods=["POST"])
def create_contact():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided."}), 400

    errors = validate_contact(data)
    if errors:
        return jsonify({"errors": errors}), 422

    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO contacts (first_name, last_name, address, email, phone) VALUES (?, ?, ?, ?, ?)",
        (
            data["first_name"].strip(),
            data["last_name"].strip(),
            data["address"].strip(),
            data["email"].strip().lower(),
            data["phone"].strip(),
        )
    )
    conn.commit()
    new_id = cursor.lastrowid
    row = conn.execute("SELECT * FROM contacts WHERE id = ?", (new_id,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201


@app.route("/api/contacts/<int:contact_id>", methods=["PUT"])
def update_contact(contact_id):
    conn = get_db()
    existing = conn.execute("SELECT * FROM contacts WHERE id = ?", (contact_id,)).fetchone()
    conn.close()
    if not existing:
        return jsonify({"error": "Contact not found."}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided."}), 400

    errors = validate_contact(data, contact_id=contact_id)
    if errors:
        return jsonify({"errors": errors}), 422

    conn = get_db()
    conn.execute(
        "UPDATE contacts SET first_name=?, last_name=?, address=?, email=?, phone=? WHERE id=?",
        (
            data["first_name"].strip(),
            data["last_name"].strip(),
            data["address"].strip(),
            data["email"].strip().lower(),
            data["phone"].strip(),
            contact_id,
        )
    )
    conn.commit()
    row = conn.execute("SELECT * FROM contacts WHERE id = ?", (contact_id,)).fetchone()
    conn.close()
    return jsonify(dict(row))


@app.route("/api/contacts/<int:contact_id>", methods=["DELETE"])
def delete_contact(contact_id):
    conn = get_db()
    existing = conn.execute("SELECT * FROM contacts WHERE id = ?", (contact_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Contact not found."}), 404
    conn.execute("DELETE FROM contacts WHERE id = ?", (contact_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Contact deleted successfully."})


@app.route("/api/contacts/stats", methods=["GET"])
def get_stats():
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) as c FROM contacts").fetchone()["c"]
    conn.close()
    return jsonify({"total": total})

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
