const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");

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

app.listen(PORT, () => {

    console.log(
        `Backend running on port ${PORT}`
    );

});