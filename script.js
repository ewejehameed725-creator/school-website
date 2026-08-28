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
        function (event) {

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
                    .value;

            const term =
                document
                    .getElementById("term")
                    .value;

            const resultFile =
                document
                    .getElementById("result-file")
                    .files[0];


            if (!resultFile) {

                alert(
                    "Please select the student's result file."
                );

                return;
            }


            const reader =
                new FileReader();


            reader.onload = function () {

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
                        reader.result,

                    uploadedAt:
                        new Date().toLocaleString()

                };


                let results =
                    JSON.parse(
                        localStorage.getItem(
                            "schoolResults"
                        )
                    ) || [];


                const existingResult =
                    results.findIndex(
                        result =>
                            result.admissionNumber
                                .toLowerCase() ===
                            admissionNumber
                                .toLowerCase()
                            &&
                            result.term === term
                    );


                if (
                    existingResult !== -1
                ) {

                    const replaceResult =
                        confirm(
                            "A result already exists for this student and term. Replace it?"
                        );


                    if (!replaceResult) {

                        return;

                    }


                    results[existingResult] =
                        resultData;

                } else {

                    results.push(
                        resultData
                    );

                }


                localStorage.setItem(
                    "schoolResults",
                    JSON.stringify(results)
                );


                alert(
                    "Result uploaded and published successfully!"
                );


                uploadResultForm.reset();

            };


            reader.readAsDataURL(
                resultFile
            );

        }
    );

}

