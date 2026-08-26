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

        // Save the student's information temporarily
        sessionStorage.setItem("admissionNumber", admissionNumber);
        sessionStorage.setItem("studentName", studentName);

        // Go to the result page
        window.location.href = "result.html";

    });

}

const resultStudentName =
    document.getElementById("result-student-name");

const resultAdmissionNumber =
    document.getElementById("result-admission-number");

if (resultStudentName && resultAdmissionNumber) {

    const studentName =
        sessionStorage.getItem("studentName");

    const admissionNumber =
        sessionStorage.getItem("admissionNumber");

    if (studentName && admissionNumber) {

        resultStudentName.textContent = studentName;

        resultAdmissionNumber.textContent = admissionNumber;

    }

}
const adminLoginForm = document.getElementById("adminLoginForm");

if (adminLoginForm) {

    adminLoginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const username =
            document.getElementById("admin-username").value.trim();

        const password =
            document.getElementById("admin-password").value;

        if (username === "" || password === "") {

            alert("Please enter your username and password.");

            return;
        }

        /*
         * DEMO ONLY:
         * This does not authenticate a real administrator yet.
         */

        window.location.href = "admindashboard.html";

    });

}
const togglePassword =
    document.getElementById("togglePassword");

const adminPassword =
    document.getElementById("admin-password");

if (togglePassword && adminPassword) {

    togglePassword.addEventListener("click", function () {

        if (adminPassword.type === "password") {

            adminPassword.type = "text";

            togglePassword.textContent = "🙈";

            togglePassword.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            adminPassword.type = "password";

            togglePassword.textContent = "👁️";

            togglePassword.setAttribute(
                "aria-label",
                "Show password"
            );

        }

    });

}
const uploadResultForm = document.getElementById("uploadResultForm");

if (uploadResultForm) {

    uploadResultForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const studentName =
            document.getElementById("student-name").value.trim();

        const admissionNumber =
            document.getElementById("admission-number").value.trim();

        const studentClass =
            document.getElementById("student-class").value;

        const term =
            document.getElementById("term").value;

        const resultFile =
            document.getElementById("result-file").files[0];


        // Check that a file was selected
        if (!resultFile) {
            alert("Please select the student's result file.");
            return;
        }


        // Convert the file into a format the browser can store
        const reader = new FileReader();

        reader.onload = function () {

            const resultData = {

                studentName: studentName,

                admissionNumber: admissionNumber,

                studentClass: studentClass,

                term: term,

                fileName: resultFile.name,

                fileType: resultFile.type,

                fileData: reader.result,

                uploadedAt: new Date().toLocaleString()

            };


            // Get existing results
            let results =
                JSON.parse(
                    localStorage.getItem("schoolResults")
                ) || [];


            // Check if this student already has
            // a result for the selected term
            const existingResult = results.findIndex(
                result =>
                    result.admissionNumber.toLowerCase() ===
                    admissionNumber.toLowerCase()
                    &&
                    result.term === term
            );


            if (existingResult !== -1) {

                const replaceResult =
                    confirm(
                        "A result already exists for this student and term. Replace it?"
                    );

                if (!replaceResult) {
                    return;
                }

                results[existingResult] = resultData;

            } else {

                results.push(resultData);

            }


            // Save results
            localStorage.setItem(
                "schoolResults",
                JSON.stringify(results)
            );


            alert(
                "Result uploaded and published successfully!"
            );


            // Clear form
            uploadResultForm.reset();

        };


        reader.readAsDataURL(resultFile);

    });

}