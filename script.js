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
// ADMIN LOGIN
// ========================================

const adminLoginForm =
    document.getElementById("adminLoginForm");


if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        function (event) {

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


            if (
                username === "" ||
                password === ""
            ) {

                alert(
                    "Please enter your username and password."
                );

                return;
            }


            // Demo login
            window.location.href =
                "admindashboard.html";

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

