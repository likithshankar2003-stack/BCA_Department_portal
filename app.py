from flask import Flask, request, jsonify, session, send_from_directory, Response
from flask_cors import CORS
from werkzeug.utils import secure_filename
import mysql.connector

app = Flask(__name__)
app.secret_key = "secretkey"
CORS(app)

# ---------------- DATABASE CONNECTION ----------------
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="692004",
    database="bca_department"
)

cursor = db.cursor(dictionary=True, buffered=True)

# ---------------- REGISTER ----------------
@app.route("/register", methods=["POST"])
def register():
    data = request.json

    uucms_id = data["uucms_id"]
    name = data["name"]
    email = data["email"]
    password = data["password"]
    semester = data["semester"]

    query = """INSERT INTO students 
               (uucms_id, name, email, password, semester)
               VALUES (%s,%s,%s,%s,%s)"""

    cursor.execute(query, (uucms_id, name, email, password, semester))
    db.commit()

    return jsonify({"message": "Registered successfully"})


# ---------------- STUDENT LOGIN ----------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json

    uucms_id = data["uucms_id"]
    password = data["password"]

    query = "SELECT * FROM students WHERE uucms_id=%s AND password=%s"
    cursor.execute(query, (uucms_id, password))
    user = cursor.fetchone()

    if user:
        session["student"] = user["uucms_id"]
        return jsonify({"status": "success", "user": user})
    else:
        return jsonify({"status": "error"})


# ---------------- FACULTY LOGIN ----------------
@app.route("/faculty-login", methods=["POST"])
def faculty_login():
    data = request.json

    username = data["username"]
    password = data["password"]

    query = "SELECT * FROM faculty WHERE username=%s AND password=%s"
    cursor.execute(query, (username, password))
    user = cursor.fetchone()

    if user:
        session["faculty"] = username
        return jsonify({"status": "success"})
    else:
        return jsonify({"status": "error"})


@app.route("/save-ia", methods=["POST"])
def save_ia():
    data = request.json

    for student in data:
        uucms_id = student["uucms_id"]
        name = student["name"]
        semester = str(student.get("semester") or "").strip()
        subject = (student.get("subject") or "General").strip()
        total_marks = student["total_marks"]
        obtained_marks = student["obtained_marks"]

        cursor.execute(
            "SELECT * FROM ia_marks WHERE uucms_id=%s AND semester=%s AND subject=%s",
            (uucms_id, semester, subject)
        )
        existing = cursor.fetchone()

        if existing:
            query = """UPDATE ia_marks 
                       SET student_name=%s, total_marks=%s, obtained_marks=%s 
                       WHERE uucms_id=%s AND semester=%s AND subject=%s"""
            cursor.execute(query, (name, total_marks, obtained_marks, uucms_id, semester, subject))
        else:
            query = """INSERT INTO ia_marks 
                       (uucms_id, student_name, semester, subject, total_marks, obtained_marks)
                       VALUES (%s,%s,%s,%s,%s,%s)"""
            cursor.execute(query, (uucms_id, name, semester, subject, total_marks, obtained_marks))

    db.commit()
    return jsonify({"message": "IA Marks Saved Successfully"})

# ---------------- GET IA MARKS ----------------
@app.route("/get-ia/<uucms_id>")
def get_ia(uucms_id):
    cursor.execute(
        "SELECT semester, subject, total_marks, obtained_marks FROM ia_marks WHERE uucms_id=%s ORDER BY semester, subject",
        (uucms_id,)
    )
    data = cursor.fetchall()
    return jsonify(data)


# ---------------- SAVE ASSIGNMENT ----------------
@app.route("/save-assignment", methods=["POST"])
def save_assignment():
    if request.content_type and request.content_type.startswith("multipart/form-data"):
        data = request.form
    else:
        data = request.json or {}

    audience = (data.get("audience") or data.get("uucms_id") or "").strip()
    assignment = data.get("assignment", "")
    semester = str(data.get("semester") or "").strip()
    subject = (data.get("subject") or "General").strip()
    uploaded_file = request.files.get("assignment_file")

    if not audience:
        return jsonify({"message": "Please provide a student UUCMS ID, @all, or @everyone"}), 400
    if audience.lower() in ("@all", "@everyone") and not semester:
        return jsonify({"message": "Please select a semester before using @all"}), 400

    file_name = None
    file_type = None
    file_data = None
    if uploaded_file and uploaded_file.filename:
        file_name = secure_filename(uploaded_file.filename)
        file_type = uploaded_file.mimetype or "application/octet-stream"
        file_data = uploaded_file.read()

    if not assignment and not file_data:
        return jsonify({"message": "Enter assignment details or choose a file"}), 400

    if audience.lower() in ("@all", "@everyone"):
        cursor.execute("SELECT uucms_id, semester FROM students")
        students = cursor.fetchall()
        recipients = [
            row["uucms_id"] for row in students
            if "".join(ch for ch in str(row.get("semester") or "") if ch.isdigit()) == semester
        ]
    else:
        recipients = [audience]

    if not recipients:
        return jsonify({"message": f"No students found for semester {semester}"}), 404

    query = """
    INSERT INTO assignments (uucms_id, semester, subject, assignment, file_name, file_type, file_data)
    VALUES (%s,%s,%s,%s,%s,%s,%s)
    """
    for uucms_id in recipients:
        cursor.execute(query, (uucms_id, semester, subject, assignment, file_name, file_type, file_data))

    db.commit()

    return jsonify({"message": f"Assignment shared with {len(recipients)} student(s)"})


# ---------------- GET ASSIGNMENT ----------------
@app.route("/get-assignment/<uucms_id>")
def get_assignment(uucms_id):
    query = """
    SELECT id, semester, subject, assignment, file_name
    FROM assignments
    WHERE uucms_id=%s
    ORDER BY id DESC
    """
    cursor.execute(query, (uucms_id,))
    rows = cursor.fetchall()

    assignments = []
    for row in rows:
        file_name = row.get("file_name")
        assignments.append({
            "id": row.get("id"),
            "semester": row.get("semester") or "",
            "subject": row.get("subject") or "General",
            "assignment": row.get("assignment") or "",
            "file": {
                "name": file_name,
                "download_url": f"/download-assignment/{row.get('id')}"
            } if file_name else None
        })

    return jsonify(assignments)


@app.route("/download-assignment/<int:assignment_id>")
def download_assignment(assignment_id):
    cursor.execute(
        "SELECT file_name, file_type, file_data FROM assignments WHERE id=%s",
        (assignment_id,)
    )
    row = cursor.fetchone()

    if not row or not row.get("file_data"):
        return jsonify({"message": "File not found"}), 404

    response = Response(row["file_data"], mimetype=row.get("file_type") or "application/octet-stream")
    response.headers["Content-Disposition"] = f'attachment; filename="{row.get("file_name") or "assignment-file"}"'
    return response

# ---------------- CONTACT FORM ----------------
@app.route("/contact", methods=["POST"])
def contact():
    data = request.json

    name = data["name"]
    email = data["email"]
    message = data["message"]

    query = "INSERT INTO contact (name,email,message) VALUES (%s,%s,%s)"
    cursor.execute(query, (name, email, message))
    db.commit()

    return jsonify({"message": "Message saved"})


# ---------------- GET STUDENT ----------------
@app.route("/student/<uucms_id>")
def get_student(uucms_id):
    query = "SELECT * FROM students WHERE uucms_id=%s"
    cursor.execute(query, (uucms_id,))
    user = cursor.fetchone()

    return jsonify(user)


# ---------------- SAVE ATTENDANCE ----------------
@app.route("/save-attendance", methods=["POST"])
def save_attendance():
    data = request.json

    for row in data:
        uucms_id = row["uucms_id"]
        subject = row["subject"]   
        total = int(row["total"])
        attended = int(row["attended"])

        percentage = (attended / total) * 100 if total > 0 else 0

        query = """
        INSERT INTO attendance (uucms_id, subject, total_classes, attended_classes, percentage)
        VALUES (%s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
        total_classes=%s,
        attended_classes=%s,
        percentage=%s
        """

        cursor.execute(query, (
            uucms_id, subject, total, attended, percentage,
            total, attended, percentage
        ))

    db.commit()

    return jsonify({"message": "Attendance saved/updated successfully"})
# ---------------- GET ATTENDANCE ----------------
@app.route("/get-attendance/<uucms_id>")
def get_attendance(uucms_id):
    query = "SELECT * FROM attendance WHERE uucms_id=%s"
    cursor.execute(query, (uucms_id,))
    data = cursor.fetchall()

    return jsonify(data)


# ---------------- GET ALL STUDENTS ----------------
@app.route("/all-students")
def all_students():
    query = "SELECT * FROM students"
    cursor.execute(query)
    data = cursor.fetchall()

    return jsonify(data)


# ---------------- FRONTEND PAGE ----------------
@app.route("/")
@app.route("/u.html")
def frontend_page():
    return send_from_directory(app.root_path, "u.html")

# ---------------- RUN APP ----------------
if __name__ == "__main__":
    app.run(debug=True)


