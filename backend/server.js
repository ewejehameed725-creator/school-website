const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");
const { Pool } = require("pg");


// =====================================================
// ENVIRONMENT
// =====================================================

dotenv.config();


// =====================================================
// APP
// =====================================================

const app = express();

const PORT =
    process.env.PORT || 5000;


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(
    express.json({
        limit: "20mb"
    })
);


// =====================================================
// DATABASE
// =====================================================

const pool = new Pool({

    connectionString:
        process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false
    }

});


// =====================================================
// DATABASE CONNECTION TEST
// =====================================================

pool.on("error", function (error) {

    console.error(
        "Unexpected database error:",
        error.message
    );

});


// =====================================================
// HOME
// =====================================================

app.get("/", function (req, res) {

    res.json({

        success: true,

        message:
            "Lagos State Model College Meiran backend is running!"

    });

});


// =====================================================
// DATABASE TEST
// =====================================================

app.get("/db-test", async function (req, res) {

    try {

        const result =
            await pool.query(
                "SELECT NOW()"
            );


        res.json({

            success: true,

            message:
                "Database connected successfully!",

            time:
                result.rows[0].now

        });

    }

    catch (error) {

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


// =====================================================
// HELPER: HASH PASSWORD
// =====================================================

function hashPassword(password) {

    return new Promise(
        function (resolve, reject) {

            const salt =
                crypto.randomBytes(16)
                    .toString("hex");


            crypto.scrypt(
                password,
                salt,
                64,
                function (error, derivedKey) {

                    if (error) {

                        reject(error);

                        return;

                    }


                    resolve(
                        `${salt}:${derivedKey.toString("hex")}`
                    );

                }
            );

        }
    );

}


// =====================================================
// HELPER: VERIFY PASSWORD
// =====================================================

function verifyPassword(
    password,
    storedPassword
) {

    return new Promise(
        function (resolve, reject) {

            try {

                const parts =
                    storedPassword.split(":");


                if (parts.length !== 2) {

                    resolve(false);

                    return;

                }


                const salt =
                    parts[0];

                const storedHash =
                    Buffer.from(
                        parts[1],
                        "hex"
                    );


                crypto.scrypt(
                    password,
                    salt,
                    64,
                    function (error, derivedKey) {

                        if (error) {

                            reject(error);

                            return;

                        }


                        if (
                            storedHash.length !==
                            derivedKey.length
                        ) {

                            resolve(false);

                            return;

                        }


                        resolve(
                            crypto.timingSafeEqual(
                                storedHash,
                                derivedKey
                            )
                        );

                    }
                );

            }

            catch (error) {

                reject(error);

            }

        }
    );

}


// =====================================================
// STAFF / TEACHERS
// =====================================================


// =====================================================
// CREATE TEACHER ACCOUNT
// =====================================================

app.post(
    "/api/teachers/create",
    async function (req, res) {

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
                !password
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please provide teacher name, username, class and password."

                });

            }


            const cleanUsername =
                username.trim().toLowerCase();


            const existing =
                await pool.query(
                    `SELECT id
                     FROM staff
                     WHERE LOWER(username) = LOWER($1)
                     LIMIT 1`,
                    [
                        cleanUsername
                    ]
                );


            if (
                existing.rows.length > 0
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "That username already exists."

                });

            }


            const passwordHash =
                await hashPassword(
                    password
                );


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
                        cleanUsername,
                        assignedClass.trim(),
                        phone
                            ? phone.trim()
                            : null,
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

        }

        catch (error) {

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
// =====================================================
// STAFF LOGIN
// PRINCIPAL + TEACHER
// =====================================================

app.post("/api/staff/login", async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;


        // ---------------------------------------------
        // VALIDATE INPUT
        // ---------------------------------------------

        if (!username || !password) {

            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });

        }


        // ---------------------------------------------
        // FIND STAFF ACCOUNT
        // ---------------------------------------------

        const result = await pool.query(
            `
            SELECT *
            FROM staff
            WHERE LOWER(username) = LOWER($1)
            LIMIT 1
            `,
            [username.trim()]
        );


        // ---------------------------------------------
        // ACCOUNT NOT FOUND
        // ---------------------------------------------

        if (result.rows.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });

        }


        const staff = result.rows[0];


        // ---------------------------------------------
        // VERIFY PASSWORD
        // ---------------------------------------------

        const passwordCorrect =
            await verifyPassword(
                password,
                staff.password_hash
            );


        if (!passwordCorrect) {

            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });

        }


        // ---------------------------------------------
        // UPDATE LAST LOGIN
        // ---------------------------------------------

        try {

            await pool.query(
                `
                UPDATE staff
                SET last_login_at = NOW()
                WHERE id = $1
                `,
                [staff.id]
            );

        } catch (loginUpdateError) {

            console.error(
                "Could not update last login:",
                loginUpdateError.message
            );

            // Do NOT stop login.
        }


        // ---------------------------------------------
        // SAVE LOGIN HISTORY
        // ---------------------------------------------

        try {

            await pool.query(
                `
                INSERT INTO staff_login_history
                (
                    staff_id,
                    teacher_name,
                    username,
                    role,
                    assigned_class,
                    login_at
                )
                VALUES ($1, $2, $3, $4, $5, NOW())
                `,
                [
                    String(staff.id),
                    staff.full_name,
                    staff.username,
                    staff.role,
                    staff.assigned_class || null
                ]
            );

        } catch (historyError) {

            console.error(
                "Login history could not be saved:",
                historyError.message
            );

            // IMPORTANT:
            // A history error must NOT
            // prevent the user from logging in.
        }


        // ---------------------------------------------
        // LOG ACTIVITY
        // ---------------------------------------------

        try {

            await logTeacherActivity({
                teacherId: staff.id,
                teacherName: staff.full_name,
                username: staff.username,
                activityType: "LOGIN",
                description:
                    `${staff.full_name} logged into the staff portal.`
            });

        } catch (activityError) {

            console.error(
                "Activity log error:",
                activityError.message
            );

        }


        // ---------------------------------------------
        // SUCCESS
        // ---------------------------------------------

        return res.status(200).json({

            success: true,

            message: "Login successful.",

            user: {
                id: staff.id,

                fullName:
                    staff.full_name,

                username:
                    staff.username,

                role:
                    staff.role,

                assignedClass:
                    staff.assigned_class,

                phone:
                    staff.phone
            }

        });

    } catch (error) {

        console.error(
            "================================="
        );

        console.error(
            "STAFF LOGIN ERROR"
        );

        console.error(
            error
        );

        console.error(
            "================================="
        );


        return res.status(500).json({
            success: false,
            message: "Unable to login."
        });

    }

});


// =====================================================
// ENSURE STUDENTS TABLE COLUMNS
// =====================================================

async function ensureStudentColumns() {

    try {

        await pool.query(`
            ALTER TABLE students
            ADD COLUMN IF NOT EXISTS student_name TEXT
        `);


        await pool.query(`
            ALTER TABLE students
            ADD COLUMN IF NOT EXISTS registration_number TEXT
        `);


        await pool.query(`
            ALTER TABLE students
            ADD COLUMN IF NOT EXISTS serial_number TEXT
        `);


        await pool.query(`
            ALTER TABLE students
            ADD COLUMN IF NOT EXISTS student_class TEXT
        `);


        await pool.query(`
            ALTER TABLE students
            ADD COLUMN IF NOT EXISTS address TEXT
        `);


        await pool.query(`
            ALTER TABLE students
            ADD COLUMN IF NOT EXISTS guardian TEXT
        `);


        await pool.query(`
            ALTER TABLE students
            ADD COLUMN IF NOT EXISTS phone TEXT
        `);


        await pool.query(`
            ALTER TABLE students
            ADD COLUMN IF NOT EXISTS sex TEXT
        `);


        await pool.query(`
            ALTER TABLE students
            ADD COLUMN IF NOT EXISTS date_of_birth DATE
        `);


        await pool.query(`
            ALTER TABLE students
            ADD COLUMN IF NOT EXISTS teacher_name TEXT
        `);


        await pool.query(`
            ALTER TABLE students
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ
            DEFAULT NOW()
        `);


        await pool.query(`
            ALTER TABLE students
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ
            DEFAULT NOW()
        `);


        console.log(
            "Student table checked successfully."
        );

    }

    catch (error) {

        console.error(
            "Student table setup error:",
            error.message
        );

    }

}


// =====================================================
// STUDENTS
// =====================================================


// =====================================================
// GET STUDENTS
// =====================================================

app.get(
    "/api/students",
    async function (req, res) {

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
                         WHERE student_class = $1
                         ORDER BY
                             CASE
                                 WHEN serial_number ~ '^[0-9]+$'
                                 THEN serial_number::INTEGER
                                 ELSE 999999
                             END,
                             student_name ASC`,
                        [
                            studentClass
                        ]
                    );

            }

            else {

                result =
                    await pool.query(
                        `SELECT *
                         FROM students
                         ORDER BY student_name ASC`
                    );

            }


            res.json(
                result.rows
            );

        }

        catch (error) {

            console.error(
                "Get students error:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load students."

            });

        }

    }
);


// =====================================================
// ADD STUDENT
// =====================================================

app.post(
    "/api/students",
    async function (req, res) {

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

                    message:
                        "Student name, registration number and class are required."

                });

            }


            const duplicate =
                await pool.query(
                    `SELECT id
                     FROM students
                     WHERE LOWER(registration_number) =
                           LOWER($1)
                     LIMIT 1`,
                    [
                        registrationNumber.trim()
                    ]
                );


            if (
                duplicate.rows.length > 0
            ) {

                return res.status(409).json({

                    success: false,

                    message:
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
                        teacher_name,
                        created_at,
                        updated_at
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
                        $10,
                        NOW(),
                        NOW()
                    )
                    RETURNING *`,
                    [
                        studentName.trim(),
                        registrationNumber.trim(),
                        serialNumber
                            ? String(serialNumber)
                            : null,
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

        }

        catch (error) {

            console.error(
                "Add student error:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to add student."

            });

        }

    }
);


// =====================================================
// UPDATE STUDENT
// =====================================================

app.put(
    "/api/students/:id",
    async function (req, res) {

        try {

            const {
                id
            } = req.params;


            const {
                studentName,
                registrationNumber,
                studentClass,
                serialNumber,
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

                    message:
                        "Student name, registration number and class are required."

                });

            }


            const duplicate =
                await pool.query(
                    `SELECT id
                     FROM students
                     WHERE LOWER(registration_number) =
                           LOWER($1)
                     AND id <> $2
                     LIMIT 1`,
                    [
                        registrationNumber.trim(),
                        id
                    ]
                );


            if (
                duplicate.rows.length > 0
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Another student already uses this registration number."

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
                        serialNumber
                            ? String(serialNumber)
                            : null,
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


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
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

        }

        catch (error) {

            console.error(
                "Update student error:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to update student."

            });

        }

    }
);


// =====================================================
// DELETE STUDENT
// =====================================================

app.delete(
    "/api/students/:id",
    async function (req, res) {

        try {

            const {
                id
            } = req.params;


            const result =
                await pool.query(
                    `DELETE FROM students
                     WHERE id = $1
                     RETURNING id`,
                    [
                        id
                    ]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Student not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Student deleted successfully."

            });

        }

        catch (error) {

            console.error(
                "Delete student error:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to delete student."

            });

        }

    }
);


// =====================================================
// ATTENDANCE TABLE
// =====================================================

async function ensureAttendanceTable() {

    try {

        await pool.query(`

            CREATE TABLE IF NOT EXISTS attendance (

                id BIGSERIAL PRIMARY KEY,

                student_id UUID NOT NULL
                    REFERENCES students(id)
                    ON DELETE CASCADE,

                student_name TEXT NOT NULL,

                registration_number TEXT NOT NULL,

                student_class TEXT NOT NULL,

                teacher_id BIGINT,

                teacher_name TEXT NOT NULL,

                attendance_date DATE NOT NULL,

                status TEXT NOT NULL
                    CHECK (
                        status IN (
                            'Present',
                            'Absent',
                            'Late',
                            'Excused'
                        )
                    ),

                created_at TIMESTAMPTZ
                    NOT NULL DEFAULT NOW(),

                updated_at TIMESTAMPTZ
                    NOT NULL DEFAULT NOW(),

                UNIQUE(
                    student_id,
                    attendance_date
                )

            );

        `);


        console.log(
            "Attendance table checked successfully."
        );

    }

    catch (error) {

        console.error(
            "Attendance table error:",
            error.message
        );

    }

}


// =====================================================
// GET ATTENDANCE
// =====================================================

app.get(
    "/api/attendance",
    async function (req, res) {

        try {

            const {
                studentClass,
                weekStart
            } = req.query;


            if (
                !studentClass ||
                !weekStart
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Student class and week start are required."

                });

            }


            const result =
                await pool.query(
                    `SELECT *
                     FROM attendance
                     WHERE student_class = $1
                     AND attendance_date >= $2::DATE
                     AND attendance_date < (
                         $2::DATE + INTERVAL '5 days'
                     )
                     ORDER BY
                         student_name ASC,
                         attendance_date ASC`,
                    [
                        studentClass,
                        weekStart
                    ]
                );


            res.json({

                success: true,

                attendance:
                    result.rows

            });

        }

        catch (error) {

            console.error(
                "Get attendance error:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load attendance."

            });

        }

    }
);


// =====================================================
// SAVE / UPDATE ATTENDANCE
// =====================================================

app.post(
    "/api/attendance",
    async function (req, res) {

        try {

            const { records } = req.body;

            if (
                !Array.isArray(records) ||
                records.length === 0
            ) {

                return res.status(400).json({
                    success: false,
                    message: "No attendance records were provided."
                });

            }


            let savedCount = 0;
            const errors = [];


            for (const record of records) {

                const {
                    studentId,
                    studentName,
                    registrationNumber,
                    studentClass,
                    teacherId,
                    teacherName,
                    attendanceDate,
                    status
                } = record;


                // -----------------------------------------
                // VALIDATE REQUIRED FIELDS
                // -----------------------------------------

                if (
                    !studentId ||
                    !studentName ||
                    !registrationNumber ||
                    !studentClass ||
                    !teacherName ||
                    !attendanceDate ||
                    !status
                ) {

                    errors.push({
                        studentId: studentId || null,
                        message: "Missing required attendance information."
                    });

                    continue;

                }


                // -----------------------------------------
                // VALIDATE ATTENDANCE STATUS
                // -----------------------------------------

                if (
                    ![
                        "Present",
                        "Absent",
                        "Late",
                        "Excused"
                    ].includes(status)
                ) {

                    errors.push({
                        studentId,
                        message: `Invalid attendance status: ${status}`
                    });

                    continue;

                }


                // -----------------------------------------
                // CHECK STUDENT
                // -----------------------------------------

                const studentCheck =
                    await pool.query(
                        `SELECT
                            id,
                            student_name,
                            registration_number,
                            student_class
                         FROM students
                         WHERE id = $1
                         AND LOWER(student_class) = LOWER($2)
                         LIMIT 1`,
                        [
                            studentId,
                            studentClass
                        ]
                    );


                if (
                    studentCheck.rows.length === 0
                ) {

                    errors.push({
                        studentId,
                        studentName,
                        message:
                            "Student was not found in the selected class."
                    });

                    continue;

                }


                // -----------------------------------------
                // NORMALIZE TEACHER ID
                // -----------------------------------------

                let validTeacherId = null;

                if (
                    teacherId !== null &&
                    teacherId !== undefined &&
                    teacherId !== ""
                ) {

                    const parsedTeacherId =
                        Number(teacherId);

                    if (
                        Number.isInteger(parsedTeacherId) &&
                        parsedTeacherId > 0
                    ) {

                        validTeacherId =
                            parsedTeacherId;

                    }

                }


                // -----------------------------------------
                // SAVE / UPDATE ATTENDANCE
                // -----------------------------------------

                await pool.query(
                    `INSERT INTO attendance
                    (
                        student_id,
                        student_name,
                        registration_number,
                        student_class,
                        teacher_id,
                        teacher_name,
                        attendance_date,
                        status,
                        created_at,
                        updated_at
                    )
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7::DATE,
                        $8,
                        NOW(),
                        NOW()
                    )
                    ON CONFLICT
                    (
                        student_id,
                        attendance_date
                    )
                    DO UPDATE SET

                        student_name =
                            EXCLUDED.student_name,

                        registration_number =
                            EXCLUDED.registration_number,

                        student_class =
                            EXCLUDED.student_class,

                        teacher_id =
                            EXCLUDED.teacher_id,

                        teacher_name =
                            EXCLUDED.teacher_name,

                        status =
                            EXCLUDED.status,

                        updated_at =
                            NOW()
                    `,
                    [
                        studentId,
                        studentName,
                        registrationNumber,
                        studentClass,
                        validTeacherId,
                        teacherName,
                        attendanceDate,
                        status
                    ]
                );


                savedCount++;

            }


            // -----------------------------------------
            // NOTHING WAS SAVED
            // -----------------------------------------

            if (savedCount === 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No attendance records were saved.",

                    savedCount: 0,

                    errors: errors

                });

            }


            // -----------------------------------------
            // RESPONSE
            // -----------------------------------------

            res.json({

                success: true,

                message:
                    "Attendance saved successfully.",

                savedCount: savedCount,

                errors: errors

            });

        }

        catch (error) {

            console.error(
                "Save attendance error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to save attendance.",

                error:
                    error.message

            });

        }

    }
);
// =====================================================
// PRINCIPAL ATTENDANCE REPORT
// =====================================================

app.get(
    "/api/principal/attendance",
    async function (req, res) {

        try {

            const {
                studentClass,
                weekStart
            } = req.query;


            if (!weekStart) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Week start date is required."

                });

            }


            let query = `
                SELECT
                    student_id,
                    student_name,
                    registration_number,
                    student_class,
                    teacher_id,
                    teacher_name,
                    attendance_date,
                    status
                FROM attendance
                WHERE
                    attendance_date >= $1::DATE
                    AND attendance_date < (
                        $1::DATE + INTERVAL '5 days'
                    )
            `;


            const values = [
                weekStart
            ];


            if (
                studentClass &&
                studentClass !== "ALL"
            ) {

                query += `
                    AND LOWER(student_class)
                    = LOWER($2)
                `;

                values.push(studentClass);

            }


            query += `
                ORDER BY
                    student_class ASC,
                    student_name ASC,
                    attendance_date ASC
            `;


            const result =
                await pool.query(
                    query,
                    values
                );


            res.json({

                success: true,

                weekStart:
                    weekStart,

                attendance:
                    result.rows

            });

        }

        catch (error) {

            console.error(
                "Principal attendance report error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load principal attendance report.",

                error:
                    error.message

            });

        }

    }
);
// =====================================================
// ACTIVITY TABLE
// =====================================================

async function ensureActivityTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS teacher_activities (
                id BIGSERIAL PRIMARY KEY,
                teacher_id TEXT,
                teacher_name TEXT,
                username TEXT,
                activity_type TEXT,
                description TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        console.log("Teacher activities table ready.");
    } catch (error) {
        console.error(
            "Teacher activities table error:",
            error.message
        );
    }
}


// =====================================================
// STAFF LOGIN HISTORY TABLE
// =====================================================

async function ensureLoginHistoryTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS staff_login_history (
                id BIGSERIAL PRIMARY KEY,
                staff_id TEXT,
                teacher_name TEXT,
                username TEXT,
                role TEXT,
                assigned_class TEXT,
                login_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        console.log("Staff login history table ready.");
    } catch (error) {
        console.error(
            "Staff login history table error:",
            error.message
        );
    }
}


// =====================================================
// STAFF LAST LOGIN COLUMN
// =====================================================

async function ensureStaffLoginColumn() {
    try {
        await pool.query(`
            ALTER TABLE staff
            ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ
        `);

        console.log("Staff last_login_at column ready.");
    } catch (error) {
        console.error(
            "Staff last_login_at column error:",
            error.message
        );
    }
}
// =====================================================
// LOG TEACHER ACTIVITY
// =====================================================

async function logTeacherActivity(data) {

    try {

        await pool.query(
            `
            INSERT INTO teacher_activities
            (
                teacher_id,
                teacher_name,
                username,
                activity_type,
                description
            )
            VALUES ($1, $2, $3, $4, $5)
            `,
            [
                data.teacherId
                    ? String(data.teacherId)
                    : null,

                data.teacherName || null,

                data.username || null,

                data.activityType || null,

                data.description || null
            ]
        );

    } catch (error) {

        console.error(
            "Activity logging failed:",
            error.message
        );

        // Activity logging must NEVER stop
        // the main operation.
    }
}

// =====================================================
// TEACHER LOGIN HISTORY
// =====================================================

app.get(
    "/api/teacher-login-history",
    async function (req, res) {

        try {

            // Make sure the table exists
            await ensureLoginHistoryTable();


            const result = await pool.query(`
                SELECT
                    id,
                    staff_id,
                    teacher_name,
                    username,
                    role,
                    assigned_class,
                    login_at
                FROM staff_login_history
                WHERE LOWER(role) = 'teacher'
                ORDER BY login_at DESC
                LIMIT 200
            `);


            res.json({

                success: true,

                history: result.rows

            });

        }

        catch (error) {

            console.error(
                "Teacher login history error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load teacher login history.",

                error:
                    error.message

            });

        }

    }
);

// =====================================================
// GET TEACHER ACTIVITIES
// =====================================================

app.get(
    "/api/teacher-activities",
    async function (req, res) {

        try {

            const result =
                await pool.query(
                    `SELECT *
                     FROM teacher_activities
                     ORDER BY created_at DESC`
                );


            res.json({

                success: true,

                activities:
                    result.rows

            });

        }

        catch (error) {

            console.error(
                "Get teacher activities error:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load teacher activities."

            });

        }

    }
);


// =====================================================
// RESULTS
// =====================================================


// =====================================================
// GET ALL RESULTS
// =====================================================

app.get(
    "/api/results",
    async function (req, res) {

        try {

            const result =
                await pool.query(
                    `SELECT *
                     FROM results
                     ORDER BY uploaded_at DESC`
                );


            res.json({

                success: true,

                results:
                    result.rows

            });

        }

        catch (error) {

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

    }
);


// =====================================================
// GET ONE STUDENT RESULT
// =====================================================

app.get(
    "/api/results/:admissionNumber/:term",
    async function (req, res) {

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


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Result not found."

                });

            }


            res.json({

                success: true,

                result:
                    result.rows[0]

            });

        }

        catch (error) {

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


// =====================================================
// UPLOAD RESULT
// =====================================================

app.post(
    "/api/results",
    async function (req, res) {

        try {

            const {
                studentName,
                admissionNumber,
                studentClass,
                term,
                fileName,
                fileType,
                fileData,

                teacherId,
                teacherName
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


            if (
                existing.rows.length > 0
            ) {

                result =
                    await pool.query(
                        `UPDATE results
                         SET
                             student_name = $1,
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

            }

            else {

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


            // Record teacher activity if teacher
            // information was supplied.

            if (
                teacherName ||
                teacherId
            ) {

                await logTeacherActivity({

                    teacherId:
                        teacherId,

                    teacherName:
                        teacherName ||
                        "Teacher",

                    teacherClass:
                        studentClass,

                    activityType:
                        "Result Upload",

                    description:
                        `Uploaded ${term} result for ${studentName}.`,

                    studentName:
                        studentName,

                    studentAdmissionNumber:
                        admissionNumber

                });

            }


            res.status(201).json({

                success: true,

                message:
                    "Result uploaded successfully!",

                result:
                    result.rows[0]

            });

        }

        catch (error) {

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

    }
);


// =====================================================
// DELETE RESULT
// =====================================================

app.delete(
    "/api/results/:id",
    async function (req, res) {

        try {

            const {
                id
            } = req.params;


            const result =
                await pool.query(
                    `DELETE FROM results
                     WHERE id = $1
                     RETURNING id`,
                    [
                        id
                    ]
                );


            if (
                result.rows.length === 0
            ) {

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

        }

        catch (error) {

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


// =====================================================
// NEWS & ANNOUNCEMENTS
// =====================================================


// =====================================================
// GET PUBLIC ANNOUNCEMENTS
// =====================================================

app.get(
    "/api/announcements",
    async function (req, res) {

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

        }

        catch (error) {

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


// =====================================================
// GET ALL ANNOUNCEMENTS FOR ADMIN
// =====================================================

app.get(
    "/api/admin/announcements",
    async function (req, res) {

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

        }

        catch (error) {

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


// =====================================================
// CREATE ANNOUNCEMENT
// =====================================================

app.post(
    "/api/announcements",
    async function (req, res) {

        try {

            const {
                title,
                content,
                imageUrl
            } = req.body;


            if (
                !title ||
                !content
            ) {

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

        }

        catch (error) {

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


// =====================================================
// UPDATE ANNOUNCEMENT
// =====================================================

app.put(
    "/api/announcements/:id",
    async function (req, res) {

        try {

            const {
                id
            } = req.params;


            const {
                title,
                content,
                imageUrl,
                published
            } = req.body;


            const result =
                await pool.query(
                    `UPDATE announcements
                     SET
                         title = $1,
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


            if (
                result.rows.length === 0
            ) {

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

        }

        catch (error) {

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


// =====================================================
// DELETE ANNOUNCEMENT
// =====================================================

app.delete(
    "/api/announcements/:id",
    async function (req, res) {

        try {

            const {
                id
            } = req.params;


            const result =
                await pool.query(
                    `DELETE FROM announcements
                     WHERE id = $1
                     RETURNING id`,
                    [
                        id
                    ]
                );


            if (
                result.rows.length === 0
            ) {

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

        }

        catch (error) {

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
// =====================================================
// DATABASE INITIALIZATION
// =====================================================

async function initializeDatabase() {

    try {

        console.log(
            "Starting database initialization..."
        );


        // ---------------------------------------------
        // EXISTING TABLE SETUP
        // ---------------------------------------------

        await ensureStudentColumns();

        await ensureAttendanceTable();


        // ---------------------------------------------
        // STAFF LOGIN SETUP
        // ---------------------------------------------

        await ensureStaffLoginColumn();

        await ensureActivityTable();

        await ensureLoginHistoryTable();


        console.log(
            "Database initialization completed."
        );

    } catch (error) {

        console.error(
            "Database initialization error:"
        );

        console.error(error);

    }

}

// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    function () {

        console.log(
            `Backend running on port ${PORT}`
        );

    }
);