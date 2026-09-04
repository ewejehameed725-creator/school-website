const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");
const crypto = require("crypto");

dotenv.config();

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
// STAFF / TEACHER ACCOUNTS
// ==================================================


// ==============================
// PASSWORD HASHING
// ==============================

function hashPassword(password) {

    return new Promise((resolve, reject) => {

        const salt = crypto.randomBytes(16).toString("hex");

        crypto.scrypt(
            password,
            salt,
            64,
            (error, derivedKey) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(
                    `${salt}:${derivedKey.toString("hex")}`
                );

            }
        );

    });

}


function verifyPassword(password, storedHash) {

    return new Promise((resolve, reject) => {

        try {

            const parts =
                storedHash.split(":");

            if (parts.length !== 2) {
                resolve(false);
                return;
            }

            const salt = parts[0];
            const storedKey =
                Buffer.from(parts[1], "hex");

            crypto.scrypt(
                password,
                salt,
                64,
                (error, derivedKey) => {

                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(
                        crypto.timingSafeEqual(
                            storedKey,
                            derivedKey
                        )
                    );

                }
            );

        } catch (error) {

            reject(error);

        }

    });

}


// ==============================
// CREATE TEACHER ACCOUNT
// ==============================

app.post(
    "/api/teachers/create",
    async (req, res) => {

        try {

            const {
                fullName,
                username,
                assignedClass,
                phone,
                password
            } = req.body;


            if (
                !fullName ||
                !username ||
                !assignedClass ||
                !phone ||
                !password
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please provide all teacher information."
                });

            }


            const existing =
                await pool.query(
                    `SELECT id
                     FROM staff
                     WHERE LOWER(username)
                     = LOWER($1)
                     LIMIT 1`,
                    [username.trim()]
                );


            if (existing.rows.length > 0) {

                return res.status(409).json({
                    success: false,
                    message:
                        "This username already exists."
                });

            }


            const passwordHash =
                await hashPassword(password);


            const result =
                await pool.query(
                    `INSERT INTO staff
                     (
                         full_name,
                         username,
                         assigned_class,
                         phone,
                         password_hash,
                         role
                     )
                     VALUES
                     ($1, $2, $3, $4, $5, 'teacher')
                     RETURNING
                         id,
                         full_name,
                         username,
                         assigned_class,
                         phone,
                         role,
                         created_at`,
                    [
                        fullName.trim(),
                        username.trim(),
                        assignedClass.trim(),
                        phone.trim(),
                        passwordHash
                    ]
                );


            res.status(201).json({
                success: true,
                message:
                    "Teacher account created successfully!",
                teacher:
                    result.rows[0]
            });


        } catch (error) {

            console.error(
                "Create teacher error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to create teacher account."
            });

        }

    }
);


// ==============================
// STAFF LOGIN
// ==============================

app.post(
    "/api/staff/login",
    async (req, res) => {

        try {

            const {
                username,
                password
            } = req.body;


            if (!username || !password) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Username and password are required."
                });

            }


            const result =
                await pool.query(
                    `SELECT *
                     FROM staff
                     WHERE LOWER(username)
                     = LOWER($1)
                     LIMIT 1`,
                    [username.trim()]
                );


            if (result.rows.length === 0) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid username or password."
                });

            }


            const staff =
                result.rows[0];


            const passwordCorrect =
                await verifyPassword(
                    password,
                    staff.password_hash
                );


            if (!passwordCorrect) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid username or password."
                });

            }


            // Update last login time

            await pool.query(
                `UPDATE staff
                 SET last_login_at = NOW()
                 WHERE id = $1`,
                [staff.id]
            );


            res.json({
                success: true,
                message:
                    "Login successful!",
                user: {
                    id: staff.id,
                    name: staff.full_name,
                    username: staff.username,
                    role: staff.role,
                    class: staff.assigned_class,
                    phone: staff.phone
                }
            });


        } catch (error) {

            console.error(
                "Staff login error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to process staff login."
            });

        }

    }
);
// ==================================================
// STUDENTS
// ==================================================


// ==============================
// CREATE STUDENTS TABLE
// ==============================

async function ensureStudentsTable() {

    try {

        await pool.query(`
            CREATE TABLE IF NOT EXISTS students (
                id BIGSERIAL PRIMARY KEY,

                student_name TEXT NOT NULL,

                registration_number TEXT NOT NULL,

                serial_number TEXT,

                student_class TEXT NOT NULL,

                address TEXT,

                guardian TEXT,

                phone TEXT,

                sex TEXT,

                date_of_birth DATE,

                teacher_name TEXT,

                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        console.log("Students table is ready.");

    } catch (error) {

        console.error(
            "Students table error:",
            error.message
        );

    }

}


// ==============================
// GET STUDENTS
// ==============================

app.get(
    "/api/students",
    async (req, res) => {

        try {

            const {
                studentClass
            } = req.query;


            let result;


            if (studentClass) {

                result =
                    await pool.query(
                        `SELECT *
                         FROM students
                         WHERE LOWER(student_class)
                         = LOWER($1)
                         ORDER BY
                         CASE
                             WHEN serial_number ~ '^[0-9]+$'
                             THEN serial_number::INTEGER
                             ELSE 999999
                         END,
                         student_name ASC`,
                        [studentClass]
                    );

            } else {

                result =
                    await pool.query(
                        `SELECT *
                         FROM students
                         ORDER BY student_name ASC`
                    );

            }


            // The teacher dashboard expects
            // the response itself to be an array.

            res.json(result.rows);


        } catch (error) {

            console.error(
                "Get students error:",
                error.message
            );

            res.status(500).json({
                success: false,
                error:
                    "Unable to load students."
            });

        }

    }
);


// ==============================
// ADD STUDENT
// ==============================

app.post(
    "/api/students",
    async (req, res) => {

        try {

            const {
                studentName,
                registrationNumber,
                serialNumber,
                studentClass,
                address,
                guardian,
                phone,
                sex,
                dob,
                teacherName
            } = req.body;


            if (
                !studentName ||
                !registrationNumber ||
                !studentClass
            ) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Student name, registration number and class are required."
                });

            }


            // Check for an existing registration number

            const existing =
                await pool.query(
                    `SELECT id
                     FROM students
                     WHERE LOWER(registration_number)
                     = LOWER($1)
                     LIMIT 1`,
                    [
                        registrationNumber.trim()
                    ]
                );


            if (existing.rows.length > 0) {

                return res.status(409).json({
                    success: false,
                    error:
                        "A student with this registration number already exists."
                });

            }


            const result =
                await pool.query(
                    `INSERT INTO students
                    (
                        student_name,
                        registration_number,
                        serial_number,
                        student_class,
                        address,
                        guardian,
                        phone,
                        sex,
                        date_of_birth,
                        teacher_name
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        $8,
                        $9,
                        $10
                    )
                    RETURNING *`,
                    [
                        studentName.trim(),
                        registrationNumber.trim(),
                        serialNumber || null,
                        studentClass.trim(),
                        address || null,
                        guardian || null,
                        phone || null,
                        sex || null,
                        dob || null,
                        teacherName || null
                    ]
                );


            res.status(201).json({
                success: true,
                message:
                    "Student added successfully!",
                student:
                    result.rows[0]
            });


        } catch (error) {

            console.error(
                "Add student error:",
                error.message
            );

            res.status(500).json({
                success: false,
                error:
                    "Unable to add student."
            });

        }

    }
);


// ==============================
// UPDATE STUDENT
// ==============================

app.put(
    "/api/students/:id",
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            const {
                studentName,
                registrationNumber,
                serialNumber,
                studentClass,
                address,
                guardian,
                phone,
                sex,
                dob,
                teacherName
            } = req.body;


            if (
                !studentName ||
                !registrationNumber ||
                !studentClass
            ) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Student name, registration number and class are required."
                });

            }


            const result =
                await pool.query(
                    `UPDATE students
                     SET
                         student_name = $1,
                         registration_number = $2,
                         serial_number = $3,
                         student_class = $4,
                         address = $5,
                         guardian = $6,
                         phone = $7,
                         sex = $8,
                         date_of_birth = $9,
                         teacher_name = $10,
                         updated_at = NOW()
                     WHERE id = $11
                     RETURNING *`,
                    [
                        studentName.trim(),
                        registrationNumber.trim(),
                        serialNumber || null,
                        studentClass.trim(),
                        address || null,
                        guardian || null,
                        phone || null,
                        sex || null,
                        dob || null,
                        teacherName || null,
                        id
                    ]
                );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    success: false,
                    error:
                        "Student not found."
                });

            }


            res.json({
                success: true,
                message:
                    "Student updated successfully!",
                student:
                    result.rows[0]
            });


        } catch (error) {

            console.error(
                "Update student error:",
                error.message
            );

            res.status(500).json({
                success: false,
                error:
                    "Unable to update student."
            });

        }

    }
);


// ==============================
// DELETE STUDENT
// ==============================

app.delete(
    "/api/students/:id",
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            const result =
                await pool.query(
                    `DELETE FROM students
                     WHERE id = $1
                     RETURNING id`,
                    [id]
                );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    success: false,
                    error:
                        "Student not found."
                });

            }


            res.json({
                success: true,
                message:
                    "Student deleted successfully."
            });


        } catch (error) {

            console.error(
                "Delete student error:",
                error.message
            );

            res.status(500).json({
                success: false,
                error:
                    "Unable to delete student."
            });

        }

    }
);


// Make sure the students table exists

ensureStudentsTable();

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


// ==============================
// START SERVER
// ==============================
// =====================================================
// ATTENDANCE
// =====================================================

app.get("/api/attendance", async (req, res) => {
    try {
        const { studentClass, date } = req.query;

        let query = `
            SELECT *
            FROM attendance
        `;

        const values = [];
        const conditions = [];

        if (studentClass) {
            values.push(studentClass);
            conditions.push(`student_class = $${values.length}`);
        }

        if (date) {
            values.push(date);
            conditions.push(`attendance_date = $${values.length}`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += ` ORDER BY student_name ASC`;

        const result = await pool.query(query, values);

        res.json(result.rows);

    } catch (error) {
        console.error("Load attendance error:", error);

        res.status(500).json({
            error: "Unable to load attendance."
        });
    }
});


app.post("/api/attendance", async (req, res) => {
    try {
        const {
            studentId,
            studentName,
            registrationNumber,
            studentClass,
            teacherId,
            teacherName,
            attendanceDate,
            status
        } = req.body;

        if (
            !studentId ||
            !studentName ||
            !registrationNumber ||
            !studentClass ||
            !teacherName ||
            !attendanceDate ||
            !status
        ) {
            return res.status(400).json({
                error: "All attendance information is required."
            });
        }

        const validStatuses = [
            "Present",
            "Absent",
            "Late",
            "Excused"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: "Invalid attendance status."
            });
        }

        const result = await pool.query(
            `
            INSERT INTO attendance (
                student_id,
                student_name,
                registration_number,
                student_class,
                teacher_id,
                teacher_name,
                attendance_date,
                status
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            ON CONFLICT (student_id, attendance_date)
            DO UPDATE SET
                student_name = EXCLUDED.student_name,
                registration_number = EXCLUDED.registration_number,
                student_class = EXCLUDED.student_class,
                teacher_id = EXCLUDED.teacher_id,
                teacher_name = EXCLUDED.teacher_name,
                status = EXCLUDED.status,
                updated_at = NOW()
            RETURNING *;
            `,
            [
                studentId,
                studentName,
                registrationNumber,
                studentClass,
                teacherId || null,
                teacherName,
                attendanceDate,
                status
            ]
        );

        res.json({
            success: true,
            message: "Attendance saved successfully.",
            attendance: result.rows[0]
        });

    } catch (error) {
        console.error("Save attendance error:", error);

        res.status(500).json({
            error: "Unable to save attendance."
        });
    }
});
app.listen(PORT, () => {

    console.log(
        `Backend running on port ${PORT}`
    );

});