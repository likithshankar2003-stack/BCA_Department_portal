const API_BASE = "http://127.0.0.1:5000";
const studentNavbar = document.getElementById("studentNavbar");
const dropdown = document.getElementById("dropdown");
let currentStudent = JSON.parse(localStorage.getItem("currentStudent") || "null");
let currentRole = localStorage.getItem("currentRole") || (currentStudent ? "student" : "guest");
let selectedSubject = "";
let selectedSemesterByArea = { attendance: "", ia: "", assignment: "" };
let selectedSubjectByArea = { attendance: "", ia: "", assignment: "" };

const semesterSubjects = {
    1: ["Computer Fundamentals", "C Programming", "Digital Electronics"],
    2: ["Data Structures", "DBMS", "Web Basics"],
    3: ["Java", "Operating System", "Computer Networks"],
    4: ["Python", "Software Engineering", "Web Technology"],
    5: ["Cloud Computing", "Data Analytics", "Cyber Security"],
    6: ["Project Work", "AI Basics", "Mobile Application Development","Machine Learning"]
};

const notesCategories = {
    notes: "Notes",
    assignment: "Assignment",
    questionPaper: "Question Paper",
    labPrograms: "Lab Programs"
};

function restoreStudentSession() {
    if (currentStudent && currentStudent.uucms_id) return true;

    try {
        currentStudent = JSON.parse(localStorage.getItem("currentStudent") || "null");
    } catch {
        currentStudent = null;
    }

    if (currentStudent && currentStudent.uucms_id) {
        currentRole = "student";
        localStorage.setItem("currentRole", currentRole);
        studentNavbar.style.display = "flex";
        renderDropdown();
        return true;
    }

    return false;
}
function hideAllSections() {
    document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
}

function showPage(page) {
    hideAllSections();
    document.getElementById(page).classList.add("active");
    dropdown.style.display = "none";

    const studentPage = ["studentDetails", "studentIaMarks", "studentAssignments", "studentAttendance"].includes(page);
    if (studentPage && !restoreStudentSession()) {
        if (page === "studentAssignments") studentAssignmentsBox.innerHTML = "Please login again to view your assignments.";
        if (page === "studentIaMarks") studentIaMarksBox.innerHTML = "Please login again to view your IA marks.";
        if (page === "studentAttendance") attendanceBox.innerHTML = "Please login again to view attendance.";
        if (page === "studentDetails") studentAdmissionBox.innerHTML = "Please login again to view admission details.";
        return;
    }

    if (currentStudent) {
        if (page === "studentDetails") loadStudentDetails();
        if (page === "studentIaMarks") loadStudentIaMarks();
        if (page === "studentAssignments") loadStudentAssignments();
        if (page === "studentAttendance") loadAttendance();
    }
}
function renderDropdown() {
    const menus = {
        guest: [
            ["Student Login", "showPage('login')"],
            ["Faculty Login", "showPage('facultyLogin')"]
        ],
        student: [
            ["My Assignments", "showPage('studentAssignments')"],
            ["My IA Marks", "showPage('studentIaMarks')"],
            ["My Attendance", "showPage('studentAttendance')"],
            ["Logout", "logout()"]
        ],
        faculty: [
            ["Logout", "logout()"]
        ]
    };

    dropdown.innerHTML = menus[currentRole].map(item =>
        `<a onclick="${item[1]}">${item[0]}</a>`
    ).join("");
}

function toggleMenu() {
    renderDropdown();
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

function api(path, options = {}) {
    return fetch(`${API_BASE}${path}`, options).then(res => {
        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
        }
        return res.json();
    });
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));
}

function formatMessage(value) {
    return escapeHTML(value).replace(/\r?\n/g, "<br>");
}

function registerUser() {
    api("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            uucms_id: regUUCMS.value,
            name: regName.value,
            email: regEmail.value,
            password: regPassword.value,
            semester: regSemester.value
        })
    }).then(data => {
        alert(data.message);
        showPage("login");
    });
    return false;
}

function loginUser() {
    api("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uucms_id: loginUUCMS.value, password: loginPassword.value })
    }).then(data => {
        if (data.status === "success") {
            currentStudent = data.user;
            currentRole = "student";
            localStorage.setItem("currentStudent", JSON.stringify(currentStudent));
            localStorage.setItem("currentRole", currentRole);
            renderDropdown();
            alert("Login success");
            studentNavbar.style.display = "flex";
            loadStudentDetails();
            loadStudentIaMarks();
            loadStudentAssignments();
            loadAttendance();
            showPage("about");
        } else {
            alert("Invalid login");
        }
    });
    return false;
}

function facultyLogin() {
    const username = document.getElementById("facUser").value;
    const password = document.getElementById("facPass").value;

    if (username === "admin" && password === "1234") {
        alert("Faculty Login Success");
        currentRole = "faculty";
        localStorage.removeItem("currentStudent");
        localStorage.setItem("currentRole", currentRole);
        renderDropdown();
        studentNavbar.style.display = "none";
        showPage("facultyDashboard");
    } else {
        alert("Invalid Faculty Login");
    }
    return false;
}

function logout() {
    currentStudent = null;
    currentRole = "guest";
    localStorage.removeItem("currentStudent");
    localStorage.removeItem("currentRole");
    renderDropdown();
    studentNavbar.style.display = "none";
    showPage("about");
}

function submitForm() {
    api("/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: contactName.value,
            email: contactEmail.value,
            message: contactMessage.value
        })
    }).then(() => alert("Message sent successfully"));
    return false;
}

function loadStudentDetails() {
    api(`/student/${currentStudent.uucms_id}`).then(user => {
        studentAdmissionBox.innerHTML = `
            <p><b>Name:</b> ${user.name}</p>
            <p><b>Email:</b> ${user.email || "Not provided"}</p>
            <p><b>Semester:</b> ${user.semester}</p>`;
    });
}

function loadStudentIaMarks() {
    api(`/get-ia/${currentStudent.uucms_id}`).then(data => {
        const marks = Array.isArray(data) ? data : (data ? [data] : []);

        if (!marks.length) {
            studentIaMarksBox.innerHTML = "No IA Marks";
            return;
        }

        studentIaMarksBox.innerHTML = marks.map(item => `
            <div class="assignment-card">
                <p><b>Semester:</b> ${item.semester || "-"}</p>
                <p><b>Subject:</b> ${item.subject || "General"}</p>
                <p><b>Total Marks:</b> ${item.total_marks}</p>
                <p><b>Obtained Marks:</b> ${item.obtained_marks}</p>
            </div>`).join("");
    });
}
function loadStudentAssignments() {
    if (!restoreStudentSession()) {
        studentAssignmentsBox.innerHTML = "Please login again to view your assignments.";
        return;
    }

    studentAssignmentsBox.innerHTML = "Loading assignments...";

    api(`/get-assignment/${currentStudent.uucms_id}`)
        .then(data => {
            const assignments = Array.isArray(data) ? data : (data ? [data] : []);

            if (!assignments.length) {
                studentAssignmentsBox.innerHTML = "No Assignment";
                return;
            }

            studentAssignmentsBox.innerHTML = assignments.map(item => {
                const fileLink = item.file && item.file.download_url
                    ? `<a class="pdf-link assignment-download" href="${API_BASE}${item.file.download_url}" target="_blank" rel="noopener">Download ${escapeHTML(item.file.name || "File")}</a>`
                    : "";

                return `
                    <div class="assignment-card">
                        <p><b>Semester:</b> ${escapeHTML(item.semester || "-")}</p>
                        <p><b>Subject:</b> ${escapeHTML(item.subject || "General")}</p>
                        ${item.assignment ? `<p>${formatMessage(item.assignment)}</p>` : ""}
                        ${fileLink}
                    </div>`;
            }).join("");
        })
        .catch(() => {
            studentAssignmentsBox.innerHTML = "Could not load assignments. Check that Flask is running.";
        });
}
function showFacultyPanel(panelId) {
    document.querySelectorAll(".faculty-panel").forEach(panel => panel.classList.remove("active"));
    document.getElementById(panelId).classList.add("active");
}

function runSlides(containerId) {
    const slides = document.querySelectorAll(`#${containerId} .slide`);
    if (!slides.length) return;
    let index = 0;
    setInterval(() => {
        slides[index].classList.remove("active");
        index = (index + 1) % slides.length;
        slides[index].classList.add("active");
    }, 3000);
}

function renderSemesterButtons() {
    document.querySelectorAll(".semester-tools").forEach(container => {
        const target = container.dataset.target;
        container.innerHTML = [1, 2, 3, 4, 5, 6].map(sem =>
            `<button type="button" onclick="selectSemester('${target}', '${sem}')">Sem ${sem}</button>`
        ).join("");
    });
}

function selectSemester(area, semester) {
    selectedSemesterByArea[area] = semester;
    selectedSubjectByArea[area] = "";

    document.querySelectorAll(`.semester-tools[data-target="${area}"] button`).forEach(button => {
        button.classList.toggle("active", button.textContent.trim() === `Sem ${semester}`);
    });

    const list = document.getElementById(`${area}SubjectList`);
    const text = document.getElementById(`${area}SubjectText`);
    list.innerHTML = semesterSubjects[semester].map(subject =>
        `<button type="button" onclick="selectSubjectForArea('${area}', '${subject}')">${subject}</button>`
    ).join("");
    text.innerText = `Semester ${semester} subjects loaded. Select a subject.`;

    if (area === "ia") loadStudentsForIA();
    if (area === "attendance") loadStudentsForAttendance();
}

function selectSubjectForArea(area, subject) {
    selectedSubjectByArea[area] = subject;
    selectedSubject = subject;
    document.querySelectorAll(`#${area}SubjectList button`).forEach(button => {
        button.classList.toggle("active", button.textContent.trim() === subject);
    });
    document.getElementById(`${area}SubjectText`).innerText = `Selected: ${subject}`;

    if (area === "attendance") loadStudentsForAttendance();
    if (area === "ia") loadStudentsForIA();
}

function loadAllStudents() {
    api("/all-students").then(data => {
        studentsBody.innerHTML = data.map(s => `
            <tr><td>${s.name}</td><td>${s.uucms_id}</td><td>${s.email || ""}</td><td>${s.semester}</td></tr>
        `).join("");
    });
}

function semesterMatches(studentSemester, area) {
    const selected = selectedSemesterByArea[area];
    return !selected || String(studentSemester).replace(/[^0-9]/g, "") === selected;
}

function loadStudentsForAttendance() {
    api("/all-students").then(data => {
        attendanceTableBody.innerHTML = data.filter(s => semesterMatches(s.semester, "attendance")).map(s => `
            <tr>
                <td>${s.uucms_id}</td>
                <td>${s.name}</td>
                <td><input type="number" id="total_${s.uucms_id}"></td>
                <td><input type="number" id="attended_${s.uucms_id}" oninput="calculatePercentage('${s.uucms_id}')"></td>
                <td id="percent_${s.uucms_id}">0%</td>
            </tr>`).join("");
    });
}

function calculatePercentage(uucms) {
    const total = document.getElementById(`total_${uucms}`).value;
    const attended = document.getElementById(`attended_${uucms}`).value;
    if (total && attended) {
        const percent = (attended / total) * 100;
        document.getElementById(`percent_${uucms}`).innerText = `${percent.toFixed(2)}%`;
    }
}

function saveAllAttendance() {
    const rows = document.querySelectorAll("#attendanceTableBody tr");
    const subject = selectedSubjectByArea.attendance || selectedSubject || "General";
    const data = Array.from(rows).map(row => {
        const uucms_id = row.children[0].innerText;
        return {
            uucms_id,
            name: row.children[1].innerText,
            subject,
            total: document.getElementById(`total_${uucms_id}`).value,
            attended: document.getElementById(`attended_${uucms_id}`).value
        };
    });

    api("/save-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(data => alert(data.message));
}

function loadAttendance() {
    api(`/get-attendance/${currentStudent.uucms_id}`).then(data => {
        attendanceBox.innerHTML = data.length ? data.map(a => `
            <p><b>Subject:</b> ${a.subject}<br><b>Total:</b> ${a.total_classes}<br><b>Attended:</b> ${a.attended_classes}<br><b>Percentage:</b> ${Number(a.percentage).toFixed(2)}%</p><hr>
        `).join("") : "No attendance found";
    });
}

function loadStudentsForIA() {
    api("/all-students").then(data => {
        iaTableBody.innerHTML = data.filter(s => semesterMatches(s.semester, "ia")).map(s => `
            <tr>
                <td>${s.name}</td>
                <td>${s.uucms_id}</td>
                <td><input type="number" id="total_marks_${s.uucms_id}" min="0"></td>
                <td><input type="number" id="obtained_marks_${s.uucms_id}" min="0"></td>
            </tr>`).join("");
    });
}
function saveAllIAMarks() {
    const rows = document.querySelectorAll("#iaTableBody tr");
    const semester = selectedSemesterByArea.ia;
    const subject = selectedSubjectByArea.ia || "General";
    const data = Array.from(rows).map(row => {
        const name = row.children[0].innerText;
        const uucms_id = row.children[1].innerText;
        return {
            uucms_id,
            name,
            semester,
            subject,
            total_marks: document.getElementById(`total_marks_${uucms_id}`).value,
            obtained_marks: document.getElementById(`obtained_marks_${uucms_id}`).value
        };
    });

    api("/save-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).then(data => alert(data.message));
}
function saveAssignment() {
    const audience = assignmentAudience.value.trim();
    const file = assignmentPdf.files[0];
    const subject = selectedSubjectByArea.assignment || "General";
    const semester = selectedSemesterByArea.assignment;
    const assignment = facultyAssignmentData.value.trim();

    if (!audience) {
        alert("Enter a student UUCMS ID, @all, or @everyone.");
        return;
    }
    if (["@all", "@everyone"].includes(audience.toLowerCase()) && !semester) {
        alert("Select a semester before using @all.");
        return;
    }
    if (!assignment && !file) {
        alert("Enter assignment details or choose a file.");
        return;
    }

    const formData = new FormData();
    formData.append("audience", audience);
    formData.append("uucms_id", audience);
    formData.append("semester", semester);
    formData.append("subject", subject);
    formData.append("assignment", assignment);
    if (file) formData.append("assignment_file", file);

    fetch(`${API_BASE}/save-assignment`, {
        method: "POST",
        body: formData
    })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
            alert(data.message || (ok ? "Assignment shared" : "Assignment failed"));
            if (ok) {
                assignmentPdf.value = "";
                facultyAssignmentData.value = "";
            }
        })
        .catch(() => alert("Could not share assignment. Check that Flask and MySQL are running."));
}

function showNotesCategories() {
    notesCategoryList.hidden = false;
    notesBrowser.hidden = true;
    notesBrowserBody.innerHTML = "";
}

function openNotesCategory(category) {
    notesCategoryList.hidden = true;
    notesBrowser.hidden = false;
    notesBrowserTitle.innerText = `${notesCategories[category]} - Select Semester`;
    notesBrowserBody.innerHTML = `
        <div class="notes-step-grid">
            ${[1, 2, 3, 4, 5, 6].map(sem =>
                `<button type="button" onclick="openNotesSemester('${category}', '${sem}')">Sem ${sem}</button>`
            ).join("")}
        </div>`;
}

function openNotesSemester(category, semester) {
    notesBrowserTitle.innerText = `${notesCategories[category]} - Semester ${semester}`;
    notesBrowserBody.innerHTML = `
        <div class="notes-step-grid">
            ${semesterSubjects[semester].map(subject =>
                `<button type="button" onclick="openNotesSubject('${category}', '${semester}', '${subject}')">${subject}</button>`
            ).join("")}
        </div>`;
}

function slugText(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function openNotesSubject(category, semester, subject) {
    const fileName = `${category}-sem${semester}-${slugText(subject)}.pdf`;
    const pdfUrl = `static/pdfs/${fileName}`;

    notesBrowserTitle.innerText = `${subject} - ${notesCategories[category]}`;
    notesBrowserBody.innerHTML = `
        <div class="pdf-panel">
            <p><b>Semester:</b> ${semester}</p>
            <p><b>Subject:</b> ${subject}</p>
            <a class="pdf-link" href="${pdfUrl}" target="_blank" rel="noopener">Open PDF</a>
        </div>`;
}

function initializeSessionUI() {
    restoreStudentSession();
    if (currentStudent) {
        studentNavbar.style.display = "flex";
        renderDropdown();
    } else {
        studentNavbar.style.display = "none";
        renderDropdown();
    }
}
initializeSessionUI();
renderSemesterButtons();
runSlides("aboutSlideshow1");
runSlides("topperSlideshow2");

