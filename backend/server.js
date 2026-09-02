const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY;
const app = express();
const PORT = process.env.PORT || 5000;


// ==============================
// MIDDLEWARE
// ==============================

app.use(cors());

app.use(
    express.json({
        limit: "20mb"
    })
);


// ==============================
// DATABASE
// ==============================

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false
    }
});


// ==============================
// HOME
// ==============================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message:
            "Lagos State Model College Meiran backend is running!"
    });

});


// ==============================
// DATABASE TEST
// ==============================

app.get("/db-test", async (req, res) => {

    try {

        const result =
            await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message:
                "Database connected successfully!",
            time: result.rows[0].now
        });

    } catch (error) {

        console.error(
            "Database error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Database connection failed."
        });

    }

});


// ==================================================
// RESULTS
// ==================================================


// ==============================
// GET ALL RESULTS
// ==============================

app.get("/api/results", async (req, res) => {

    try {

        const result =
            await pool.query(
                `SELECT *
                 FROM results
                 ORDER BY uploaded_at DESC`
            );

        res.json({
            success: true,
            results: result.rows
        });

    } catch (error) {

        console.error(
            "Get results error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to get results."
        });

    }

});


// ==============================
// GET ONE STUDENT RESULT
// ==============================

app.get(
    "/api/results/:admissionNumber/:term",
    async (req, res) => {

        try {

            const {
                admissionNumber,
                term
            } = req.params;


            const result =
                await pool.query(
                    `SELECT *
                     FROM results
                     WHERE LOWER(admission_number)
                     = LOWER($1)
                     AND term = $2
                     LIMIT 1`,
                    [
                        admissionNumber,
                        term
                    ]
                );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Result not found."
                });

            }


            res.json({
                success: true,
                result: result.rows[0]
            });


        } catch (error) {

            console.error(
                "Get student result error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to get student result."
            });

        }

    }
);


// ==============================
// UPLOAD RESULT
// ==============================

app.post("/api/results", async (req, res) => {

    try {

        const {
            studentName,
            admissionNumber,
            studentClass,
            term,
            fileName,
            fileType,
            fileData
        } = req.body;


        if (
            !studentName ||
            !admissionNumber ||
            !studentClass ||
            !term ||
            !fileName ||
            !fileData
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Please provide all result information."
            });

        }


        const existing =
            await pool.query(
                `SELECT id
                 FROM results
                 WHERE LOWER(admission_number)
                 = LOWER($1)
                 AND term = $2`,
                [
                    admissionNumber,
                    term
                ]
            );


        let result;


        if (existing.rows.length > 0) {

            result =
                await pool.query(
                    `UPDATE results
                     SET student_name = $1,
                         student_class = $2,
                         file_name = $3,
                         file_type = $4,
                         file_data = $5,
                         uploaded_at = NOW()
                     WHERE id = $6
                     RETURNING *`,
                    [
                        studentName,
                        studentClass,
                        fileName,
                        fileType || null,
                        fileData,
                        existing.rows[0].id
                    ]
                );

        } else {

            result =
                await pool.query(
                    `INSERT INTO results
                     (
                         student_name,
                         admission_number,
                         student_class,
                         term,
                         file_name,
                         file_type,
                         file_data
                     )
                     VALUES
                     ($1, $2, $3, $4, $5, $6, $7)
                     RETURNING *`,
                    [
                        studentName,
                        admissionNumber,
                        studentClass,
                        term,
                        fileName,
                        fileType || null,
                        fileData
                    ]
                );

        }


        res.status(201).json({
            success: true,
            message:
                "Result uploaded successfully!",
            result: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Upload result error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to upload result."
        });

    }

});


// ==============================
// DELETE RESULT
// ==============================

app.delete(
    "/api/results/:id",
    async (req, res) => {

        try {

            const { id } = req.params;


            const result =
                await pool.query(
                    `DELETE FROM results
                     WHERE id = $1
                     RETURNING id`,
                    [id]
                );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Result not found."
                });

            }


            res.json({
                success: true,
                message:
                    "Result deleted successfully."
            });


        } catch (error) {

            console.error(
                "Delete result error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to delete result."
            });

        }

    }
);


// ==================================================
// NEWS & ANNOUNCEMENTS
// ==================================================


// ==============================
// GET PUBLIC ANNOUNCEMENTS
// ==============================

app.get(
    "/api/announcements",
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `SELECT *
                     FROM announcements
                     WHERE published = TRUE
                     ORDER BY created_at DESC`
                );


            res.json({
                success: true,
                announcements:
                    result.rows
            });


        } catch (error) {

            console.error(
                "Get announcements error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to get announcements."
            });

        }

    }
);


// ==============================
// GET ALL ANNOUNCEMENTS FOR ADMIN
// ==============================

app.get(
    "/api/admin/announcements",
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `SELECT *
                     FROM announcements
                     ORDER BY created_at DESC`
                );


            res.json({
                success: true,
                announcements:
                    result.rows
            });


        } catch (error) {

            console.error(
                "Get admin announcements error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to get announcements."
            });

        }

    }
);


// ==============================
// CREATE ANNOUNCEMENT
// ==============================

app.post(
    "/api/announcements",
    async (req, res) => {

        try {

            const {
                title,
                content,
                imageUrl
            } = req.body;


            if (!title || !content) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Title and content are required."
                });

            }


            const result =
                await pool.query(
                    `INSERT INTO announcements
                     (
                         title,
                         content,
                         image_url,
                         published
                     )
                     VALUES
                     ($1, $2, $3, TRUE)
                     RETURNING *`,
                    [
                        title,
                        content,
                        imageUrl || null
                    ]
                );


            res.status(201).json({
                success: true,
                message:
                    "Announcement published successfully!",
                announcement:
                    result.rows[0]
            });


        } catch (error) {

            console.error(
                "Create announcement error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to create announcement."
            });

        }

    }
);


// ==============================
// UPDATE ANNOUNCEMENT
// ==============================

app.put(
    "/api/announcements/:id",
    async (req, res) => {

        try {

            const { id } = req.params;

            const {
                title,
                content,
                imageUrl,
                published
            } = req.body;


            // If no new image is supplied,
            // keep the existing image.

            const result =
                await pool.query(
                    `UPDATE announcements
                     SET title = $1,
                         content = $2,
                         image_url =
                             COALESCE($3, image_url),
                         published = $4,
                         updated_at = NOW()
                     WHERE id = $5
                     RETURNING *`,
                    [
                        title,
                        content,
                        imageUrl || null,
                        published !== false,
                        id
                    ]
                );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Announcement not found."
                });

            }


            res.json({
                success: true,
                message:
                    "Announcement updated successfully!",
                announcement:
                    result.rows[0]
            });


        } catch (error) {

            console.error(
                "Update announcement error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to update announcement."
            });

        }

    }
);


// ==============================
// DELETE ANNOUNCEMENT
// ==============================

app.delete(
    "/api/announcements/:id",
    async (req, res) => {

        try {

            const { id } = req.params;


            const result =
                await pool.query(
                    `DELETE FROM announcements
                     WHERE id = $1
                     RETURNING id`,
                    [id]
                );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Announcement not found."
                });

            }


            res.json({
                success: true,
                message:
                    "Announcement deleted successfully."
            });


        } catch (error) {

            console.error(
                "Delete announcement error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to delete announcement."
            });

        }

    }
);
// ==================================================
// STUDENT MANAGEMENT
// ==================================================

// ==============================
// GET STUDENTS
// ==============================

app.get("/api/students", async (req, res) => {
    try {
        const { studentClass } = req.query;

        let result;

        if (studentClass) {
            result = await pool.query(
                `SELECT *
                 FROM students
                 WHERE LOWER(student_class) = LOWER($1)
                 ORDER BY serial_number ASC, student_name ASC`,
                [studentClass]
            );
        } else {
            result = await pool.query(
                `SELECT *
                 FROM students
                 ORDER BY student_class ASC,
                          serial_number ASC,
                          student_name ASC`
            );
        }

        res.json({
            success: true,
            students: result.rows
        });

    } catch (error) {
        console.error("Get students error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to get students."
        });
    }
});


// ==============================
// ADD STUDENT
// ==============================

app.post("/api/students", async (req, res) => {
    try {

        const {
            studentName,
            registrationNumber,
            serialNumber,
            homeAddress,
            parentPhone,
            guardianPhone,
            sex,
            dateOfBirth,
            studentClass,
            teacherId,
            teacherName
        } = req.body;

        if (
            !studentName ||
            !registrationNumber ||
            !studentClass
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Student name, registration number and class are required."
            });
        }

        const existing = await pool.query(
            `SELECT id
             FROM students
             WHERE LOWER(registration_number) = LOWER($1)`,
            [registrationNumber]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "A student with this registration number already exists."
            });
        }

        const result = await pool.query(
            `INSERT INTO students
            (
                student_name,
                registration_number,
                serial_number,
                home_address,
                parent_phone,
                guardian_phone,
                sex,
                date_of_birth,
                student_class,
                teacher_id,
                teacher_name
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING *`,
            [
                studentName,
                registrationNumber,
                serialNumber || null,
                homeAddress || null,
                parentPhone || null,
                guardianPhone || null,
                sex || null,
                dateOfBirth || null,
                studentClass,
                teacherId || null,
                teacherName || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Student added successfully!",
            student: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Add student error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to add student."
        });
    }
});


// ==============================
// UPDATE STUDENT
// ==============================

app.put("/api/students/:id", async (req, res) => {
    try {

        const { id } = req.params;

        const {
            studentName,
            registrationNumber,
            serialNumber,
            homeAddress,
            parentPhone,
            guardianPhone,
            sex,
            dateOfBirth,
            studentClass,
            teacherId,
            teacherName
        } = req.body;

        const result = await pool.query(
            `UPDATE students
             SET
                student_name = $1,
                registration_number = $2,
                serial_number = $3,
                home_address = $4,
                parent_phone = $5,
                guardian_phone = $6,
                sex = $7,
                date_of_birth = $8,
                student_class = $9,
                teacher_id = $10,
                teacher_name = $11,
                updated_at = NOW()
             WHERE id = $12
             RETURNING *`,
            [
                studentName,
                registrationNumber,
                serialNumber || null,
                homeAddress || null,
                parentPhone || null,
                guardianPhone || null,
                sex || null,
                dateOfBirth || null,
                studentClass,
                teacherId || null,
                teacherName || null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        res.json({
            success: true,
            message: "Student updated successfully!",
            student: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Update student error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to update student."
        });
    }
});


// ==============================
// DELETE STUDENT
// ==============================

app.delete("/api/students/:id", async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM students
             WHERE id = $1
             RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        res.json({
            success: true,
            message: "Student deleted successfully."
        });

    } catch (error) {

        console.error(
            "Delete student error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to delete student."
        });
    }
});
// ==================================================
// TEACHER ACCOUNT CREATION
// ==================================================

app.post("/api/teachers/create", async (req, res) => {

    try {

        const {
            fullName,
            username,
            assignedClass,
            phone,
            password
        } = req.body;

        // Validate information
        if (
            !fullName ||
            !username ||
            !assignedClass ||
            !phone ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all teacher information."
            });
        }

        // Check username
        const existingTeacher = await pool.query(
            `SELECT id
             FROM staff_profiles
             WHERE LOWER(username) = LOWER($1)
             LIMIT 1`,
            [username]
        );

        if (existingTeacher.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This username is already in use."
            });
        }

        // Supabase requires an email for Auth.
        // We create an internal email from the username.
        const email =
            `${username.toLowerCase().replace(/\s+/g, "")}@lsmcmeiran.local`;

        // Create user in Supabase Auth
        const authResponse = await fetch(
            `${SUPABASE_URL}/auth/v1/admin/users`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization":
                        `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    email_confirm: true,
                    user_metadata: {
                        full_name: fullName,
                        username: username,
                        role: "teacher"
                    }
                })
            }
        );

        const authData = await authResponse.json();

        if (!authResponse.ok) {

            console.error(
                "Supabase teacher creation error:",
                authData
            );

            return res.status(400).json({
                success: false,
                message:
                    authData.message ||
                    authData.error_description ||
                    "Unable to create teacher account."
            });
        }

        const authUserId = authData.id;

        // Save teacher profile
        const profile = await pool.query(
            `INSERT INTO staff_profiles
            (
                auth_user_id,
                full_name,
                username,
                role,
                assigned_class,
                phone
            )
            VALUES ($1, $2, $3, 'teacher', $4, $5)
            RETURNING
                id,
                full_name,
                username,
                role,
                assigned_class,
                phone,
                created_at`,
            [
                authUserId,
                fullName,
                username,
                assignedClass,
                phone
            ]
        );

        res.status(201).json({
            success: true,
            message: "Teacher account created successfully.",
            teacher: profile.rows[0]
        });

    } catch (error) {

        console.error(
            "Create teacher error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to create teacher account."
        });
    }

});

// ========================================
// STAFF LOGIN
// ========================================

const adminloginform =
    document.getElementById("adminLoginForm");

if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const username =
                document
                    .getElementById("admin-username")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("admin-password")
                    .value;


            if (!username || !password) {

                alert(
                    "Please enter your username and password."
                );

                return;
            }


            const loginButton =
                adminLoginForm.querySelector(
                    "button[type='submit']"
                );


            loginButton.disabled = true;
            loginButton.textContent =
                "Logging in...";


            try {

                const response =
                    await fetch(
                        "https://lagos-state-model-college-backend.onrender.com/api/staff/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                username: username,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok || !data.success) {

                    alert(
                        data.message ||
                        "Invalid username or password."
                    );

                    return;
                }


                // ==============================
                // BACKEND RETURNS "staff"
                // ==============================

                const staff =
                    data.staff;


                localStorage.setItem(
                    "staffUser",
                    JSON.stringify(staff)
                );


                // ==============================
                // PRINCIPAL
                // ==============================

                if (staff.role === "principal") {

                    window.location.href =
                        "admindashboard.html";

                    return;
                }


                // ==============================
                // CLASS TEACHER
                // ==============================

                if (staff.role === "teacher") {

                    localStorage.setItem(
                        "teacherName",
                        staff.fullName
                    );


                    localStorage.setItem(
                        "teacherUsername",
                        staff.username
                    );


                    localStorage.setItem(
                        "teacherClass",
                        staff.assignedClass
                    );


                    localStorage.setItem(
                        "teacherId",
                        staff.id
                    );


                    window.location.href =
                        "teacher-dashboard.html";

                    return;
                }


                alert(
                    "Your account role is not recognized."
                );

            }

            catch (error) {

                console.error(
                    "Staff login error:",
                    error
                );


                alert(
                    "Unable to connect to the school server."
                );

            }

            finally {

                loginButton.disabled = false;

                loginButton.textContent =
                    "Login";

            }

        }
    );

}

// ==============================
// START SERVER
// ==============================

app.listen(PORT, () => {

    console.log(
        `Backend running on port ${PORT}`
    );

});