// ========================================
// STUDENT LOGIN
// ========================================

const loginForm = document.getElementById("studentLoginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const admissionNumber =
            document.getElementById("admission-number").value.trim();

        const studentName =
            document.getElementById("student-name").value.trim();


        if (admissionNumber === "" || studentName === "") {

            alert("Please enter your admission number and name.");

            return;
        }


        // Save student information
        sessionStorage.setItem(
            "admissionNumber",
            admissionNumber
        );

        sessionStorage.setItem(
            "studentName",
            studentName
        );


        // Also save it for the result system
        localStorage.setItem(
            "loggedInStudent",
            JSON.stringify({
                name: studentName,
                admissionNumber: admissionNumber
            })
        );


        // Go to the result page
        window.location.href = "results.html";

    });

}


// ========================================
// DISPLAY STUDENT INFORMATION ON RESULT
// ========================================

const resultStudentName =
    document.getElementById("studentName");

const resultAdmissionNumber =
    document.getElementById("admissionNumber");

const resultStudentClass =
    document.getElementById("studentClass");

const resultStudentTerm =
    document.getElementById("studentTerm");


if (
    resultStudentName &&
    resultAdmissionNumber
) {

    const loggedInStudent =
        JSON.parse(
            localStorage.getItem("loggedInStudent")
        );


    if (loggedInStudent) {

        resultStudentName.textContent =
            loggedInStudent.name;

        resultAdmissionNumber.textContent =
            loggedInStudent.admissionNumber;

    }

}

// ========================================
// STAFF LOGIN
// ========================================

const adminLoginForm =
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
            loginButton.textContent = "Logging in...";

            try {

                /*
                 * Staff authentication will be connected
                 * to the backend/Supabase.
                 *
                 * DO NOT put the principal password
                 * or teacher passwords here.
                 */

                const response =
                    await fetch(
                        "https://YOUR-RENDER-BACKEND-URL/api/staff/login",
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


                // Save logged-in staff information

                localStorage.setItem(
                    "staffUser",
                    JSON.stringify(data.user)
                );


                // =================================
                // PRINCIPAL
                // =================================

                if (
                    data.user.role === "principal"
                ) {

                    window.location.href =
                        "admindashboard.html";

                    return;
                }


                // =================================
                // CLASS TEACHER
                // =================================

                if (
                    data.user.role === "teacher"
                ) {

                    localStorage.setItem(
                        "teacherName",
                        data.user.name
                    );

                    localStorage.setItem(
                        "teacherClass",
                        data.user.class
                    );

                    window.location.href =
                        "teacher-dashboard.html";

                    return;
                }


                alert(
                    "Your account role is not recognized."
                );

            } catch (error) {

                console.error(
                    "Staff login error:",
                    error
                );

                alert(
                    "Unable to connect to the school server."
                );

            } finally {

                loginButton.disabled = false;
                loginButton.textContent = "Login";

            }

        }
    );

}
// ========================================
// SHOW / HIDE ADMIN PASSWORD
// ========================================

const togglePassword =
    document.getElementById("togglePassword");

const adminPassword =
    document.getElementById("admin-password");


if (
    togglePassword &&
    adminPassword
) {

    togglePassword.addEventListener(
        "click",
        function () {

            if (
                adminPassword.type === "password"
            ) {

                adminPassword.type = "text";

                togglePassword.textContent =
                    "🙈";

            } else {

                adminPassword.type =
                    "password";

                togglePassword.textContent =
                    "👁️";

            }

        }
    );

}


// ========================================
// ADMIN RESULT UPLOAD
// ========================================

const uploadResultForm =
    document.getElementById("uploadResultForm");

if (uploadResultForm) {

    uploadResultForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const studentName =
                document
                    .getElementById("student-name")
                    .value
                    .trim();


            const admissionNumber =
                document
                    .getElementById("admission-number")
                    .value
                    .trim();


            const studentClass =
                document
                    .getElementById("student-class")
                    .value
                    .trim();


            const term =
                document
                    .getElementById("term")
                    .value;


            const resultFile =
                document
                    .getElementById("result-file")
                    .files[0];


            // ==============================
            // VALIDATION
            // ==============================

            if (
                !studentName ||
                !admissionNumber ||
                !studentClass ||
                !term ||
                !resultFile
            ) {

                alert(
                    "Please complete all result information."
                );

                return;
            }


            // ==============================
            // FILE SIZE CHECK
            // ==============================

            if (
                resultFile.size >
                10 * 1024 * 1024
            ) {

                alert(
                    "Please select a result file smaller than 10MB."
                );

                return;
            }


            // ==============================
            // READ FILE
            // ==============================

            const reader =
                new FileReader();


            reader.onload = async function () {

                const fileData =
                    reader.result;


                const resultData = {

                    studentName:
                        studentName,

                    admissionNumber:
                        admissionNumber,

                    studentClass:
                        studentClass,

                    term:
                        term,

                    fileName:
                        resultFile.name,

                    fileType:
                        resultFile.type,

                    fileData:
                        fileData

                };


                // ==============================
                // DISABLE BUTTON
                // ==============================

                const uploadButton =
                    uploadResultForm.querySelector(
                        "button[type='submit']"
                    );


                uploadButton.disabled =
                    true;

                uploadButton.textContent =
                    "Uploading...";


                try {

                    // ==============================
                    // SEND TO BACKEND
                    // ==============================

                    const response =
                        await fetch(
                            "http://localhost:5000/api/results",
                            {

                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        resultData
                                    )

                            }
                        );


                    const data =
                        await response.json();


                    // ==============================
                    // ERROR
                    // ==============================

                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        alert(
                            data.message ||
                            "Unable to upload result."
                        );

                        return;
                    }


                    // ==============================
                    // SUCCESS
                    // ==============================

                    alert(
                        "Result uploaded and published successfully!"
                    );


                    uploadResultForm.reset();


                } catch (error) {

                    console.error(
                        "Result upload error:",
                        error
                    );


                    alert(
                        "Unable to connect to the school server. Make sure the backend is running."
                    );


                } finally {

                    uploadButton.disabled =
                        false;

                    uploadButton.textContent =
                        "Upload & Publish Result";

                }

            };


            reader.onerror = function () {

                alert(
                    "Unable to read the selected result file."
                );

            };


            reader.readAsDataURL(
                resultFile
            );

        }
    );

}
// ========================================
// CREATE TEACHER ACCOUNT
// ========================================

const teacherCreateAccountForm =
    document.getElementById("teacherCreateAccountForm");

if (teacherCreateAccountForm) {

    teacherCreateAccountForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const teacherName =
                document
                    .getElementById("teacher-name")
                    .value
                    .trim();

            const username =
                document
                    .getElementById("teacher-username")
                    .value
                    .trim();

            const teacherClass =
                document
                    .getElementById("teacher-class")
                    .value
                    .trim();

            const phone =
                document
                    .getElementById("teacher-phone")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("teacher-password")
                    .value;

            const confirmPassword =
                document
                    .getElementById("teacher-confirm-password")
                    .value;


            // ==============================
            // VALIDATION
            // ==============================

            if (
                !teacherName ||
                !username ||
                !teacherClass ||
                !phone ||
                !password ||
                !confirmPassword
            ) {

                alert(
                    "Please complete all required fields."
                );

                return;
            }


            if (password !== confirmPassword) {

                alert(
                    "Passwords do not match."
                );

                return;
            }


            const button =
                teacherCreateAccountForm.querySelector(
                    "button[type='submit']"
                );


            button.disabled = true;
            button.textContent =
                "Creating Account...";


            try {

                // ==============================
                // SEND TO RENDER BACKEND
                // ==============================

                const response =
                    await fetch(
                        "https://lagos-state-model-college-backend.onrender.com/api/teachers/create",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                fullName:
                                    teacherName,

                                username:
                                    username,

                                assignedClass:
                                    teacherClass,

                                phone:
                                    phone,

                                password:
                                    password

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok || !data.success) {

                    alert(
                        data.message ||
                        "Unable to create teacher account."
                    );

                    return;
                }


                // ==============================
                // SAVE TEACHER INFORMATION
                // ==============================

                localStorage.setItem(
                    "teacherName",
                    data.teacher.full_name
                );


                localStorage.setItem(
                    "teacherUsername",
                    data.teacher.username
                );


                localStorage.setItem(
                    "teacherClass",
                    data.teacher.assigned_class
                );


                localStorage.setItem(
                    "teacherId",
                    data.teacher.id
                );


                // ==============================
                // SAVE STAFF INFORMATION
                // ==============================

                localStorage.setItem(
                    "staffUser",
                    JSON.stringify({
                        id: data.teacher.id,
                        name: data.teacher.full_name,
                        username: data.teacher.username,
                        role: data.teacher.role,
                        class: data.teacher.assigned_class,
                        phone: data.teacher.phone
                    })
                );


                // ==============================
                // GO TO TEACHER DASHBOARD
                // ==============================

                window.location.href =
                    "teacher-dashboard.html";

            }

            catch (error) {

                console.error(
                    "Teacher account error:",
                    error
                );

                alert(
                    "Unable to connect to the school server."
                );

            }

            finally {

                button.disabled = false;

                button.textContent =
                    "Create Account";

            }

        }
    );

}
