# 🎓 BCA Department Portal

A web-based **BCA Department Portal** designed to provide students and faculty with a centralized platform for managing academic information, student records, internal assessment marks, and department-related activities.

The project is developed using **Python Flask, MySQL, HTML, CSS, and JavaScript** and is intended to simplify academic data management within a college department.

## 📌 Project Overview

The **BCA Department Portal** provides separate functionality for students and faculty members.

Students can register and log in using their academic credentials, while faculty members can access academic management features such as entering and managing Internal Assessment (IA) marks.

The system uses a **Flask REST-style backend** connected to a **MySQL database** for storing and retrieving academic information.

## ✨ Features

### 👨‍🎓 Student Module

* Student registration
* Student login
* Student profile information
* Semester information
* View academic information
* View Internal Assessment marks

### 👨‍🏫 Faculty Module

* Faculty login
* Student academic data management
* Enter Internal Assessment marks
* Update existing IA marks
* Manage marks based on semester and subject

### 🗄️ Database

* MySQL database integration
* Student records
* Faculty records
* Internal Assessment marks
* Semester and subject-wise academic data

## 🛠️ Technologies Used

| Technology                 | Purpose                   |
| -------------------------- | ------------------------- |
| **Python**                 | Backend programming       |
| **Flask**                  | Web framework / API       |
| **MySQL**                  | Database                  |
| **mysql-connector-python** | Python–MySQL connectivity |
| **HTML5**                  | Frontend structure        |
| **CSS3**                   | Styling                   |
| **JavaScript**             | Frontend functionality    |
| **Flask-CORS**             | Cross-origin API requests |

## 📂 Project Structure

```text
BCA_Department_portal/
│
├── app.py
├── app.js
├── styles.css
├── u.html
│
├── bhs-logo.png
├── vijaya-college-logo.png
│
├── README.md
└── requirements.txt
```

> The exact file structure may change as the project is developed further.

## ⚙️ Requirements

Before running the project, install:

* Python 3.x
* MySQL Server
* MySQL Workbench or phpMyAdmin
* A modern web browser
* Git

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/UDAYKUMAR692004/BCA_Department_portal.git
```

Navigate to the project directory:

```bash
cd BCA_Department_portal
```

### 2. Create a Python virtual environment

```bash
python -m venv venv
```

Activate the environment.

**Windows:**

```bash
venv\Scripts\activate
```

**Linux / macOS:**

```bash
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install flask flask-cors mysql-connector-python werkzeug
```

If a `requirements.txt` file is available:

```bash
pip install -r requirements.txt
```

### 4. Configure MySQL

Create a MySQL database for the project:

```sql
CREATE DATABASE bca_department;
```

Import your database tables/data if an SQL database file is provided with the project.

### 5. Configure database connection

Update the MySQL connection settings in `app.py` according to your local MySQL configuration.

Example:

```python
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="YOUR_PASSWORD",
    database="bca_department"
)
```

**Important:** Do not upload real database passwords or other credentials to GitHub. Use environment variables for production projects.

### 6. Start the Flask server

```bash
python app.py
```

The Flask application will normally be available at:

```text
http://127.0.0.1:5000
```

Open the application in your browser.

## 🔐 Application Modules

### Student Registration

Students can register using information such as:

* UUCMS ID
* Name
* Email
* Password
* Semester

### Student Login

Registered students can log in using their UUCMS ID and password.

### Faculty Login

Faculty members can access the faculty section using their username and password.

### Internal Assessment Management

Faculty members can enter and update IA marks based on:

* Student
* UUCMS ID
* Semester
* Subject
* Total marks
* Obtained marks

The backend supports both inserting new IA records and updating existing records.

## 🔗 API Endpoints

Some of the backend endpoints implemented in the Flask application include:

| Method | Endpoint             | Purpose              |
| ------ | -------------------- | -------------------- |
| `POST` | `/register`          | Register a student   |
| `POST` | `/login`             | Student login        |
| `POST` | `/faculty-login`     | Faculty login        |
| `POST` | `/save-ia`           | Save/update IA marks |
| `GET`  | `/get-ia/<uucms_id>` | Retrieve IA marks    |

Additional endpoints can be added as the project evolves.

## 🔄 System Workflow

```text
                ┌─────────────────────┐
                │   BCA Department    │
                │       Portal        │
                └──────────┬──────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
        ┌─────▼─────┐             ┌─────▼─────┐
        │  Student  │             │  Faculty  │
        └─────┬─────┘             └─────┬─────┘
              │                         │
        ┌─────▼─────┐             ┌─────▼─────┐
        │ Register /│             │   Login   │
        │   Login   │             │           │
        └─────┬─────┘             └─────┬─────┘
              │                         │
        ┌─────▼─────┐             ┌─────▼─────┐
        │ Academic  │             │ IA Marks  │
        │   Data    │             │ Management│
        └─────┬─────┘             └─────┬─────┘
              │                         │
              └────────────┬────────────┘
                           │
                    ┌──────▼──────┐
                    │    MySQL    │
                    │   Database  │
                    └─────────────┘
```

## 🎯 Project Objectives

* Digitize BCA department academic management.
* Reduce manual handling of student academic records.
* Provide easy access to student information.
* Simplify Internal Assessment mark management.
* Maintain centralized academic data.
* Improve communication between students and faculty.

## 🔮 Future Enhancements

The following features can be added in future versions:

* 🔐 Password hashing and improved authentication
* 👤 Student profile management
* 📊 Attendance management
* 📝 Assignment management
* 📅 Timetable management
* 📢 Department announcements
* 📚 Study materials and notes
* 📈 Academic performance dashboard
* 📄 Downloadable marksheets
* 📱 Responsive mobile interface
* 🔑 Role-based access control
* ☁️ Cloud deployment
* 🔒 Environment-based configuration for database credentials

## 🛡️ Security Note

For production deployment, sensitive information such as database passwords and Flask secret keys should **not** be hard-coded in the source code.

Use environment variables instead:

```text
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
SECRET_KEY
```

Also ensure that passwords are securely hashed before storing them in the database.

## 👨‍💻 Developer

**Uday Kumar B.K**

BCA Student | Aspiring Data Analyst / Software Developer

GitHub:
https://github.com/UDAYKUMAR692004

## 📄 License

This project is developed for **educational and academic purposes**.

If you would like to use or modify this project, please provide appropriate attribution to the original developer.

---

⭐ If you find this project useful, consider giving the repository a star!
# BCA_Department_portal
