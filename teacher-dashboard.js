// =====================================================
// TEACHER DASHBOARD
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // BACKEND URL
    // =====================================================

    const API_URL =
        "https://lagos-state-model-college-backend.onrender.com";


    // =====================================================
    // ELEMENTS
    // =====================================================

    const menuButton =
        document.getElementById("teacherMenuButton");

    const sidebar =
        document.getElementById("teacherSidebar");

    const overlay =
        document.getElementById("teacherOverlay");

    const navLinks =
        document.querySelectorAll(".teacher-nav-link");

    const sections =
        document.querySelectorAll(".teacher-section");


    // =====================================================
    // TEACHER INFORMATION
    // =====================================================

    const teacherName =
        localStorage.getItem("teacherName") || "Class Teacher";

    const teacherClass =
        localStorage.getItem("teacherClass") || "";


    // Display teacher name
    const teacherDisplayName =
        document.getElementById("teacherDisplayName");

    if (teacherDisplayName) {
        teacherDisplayName.textContent = teacherName;
    }


    const profileTeacherName =
        document.getElementById("profileTeacherName");

    if (profileTeacherName) {
        profileTeacherName.textContent = teacherName;
    }


    // Display teacher class
    const teacherDisplayClass =
        document.getElementById("teacherDisplayClass");

    if (teacherDisplayClass) {
        teacherDisplayClass.textContent =
            teacherClass || "Class";
    }


    const teacherClassElement =
        document.getElementById("teacherClass");

    if (teacherClassElement) {
        teacherClassElement.textContent =
            teacherClass || "—";
    }


    const profileTeacherClass =
        document.getElementById("profileTeacherClass");

    if (profileTeacherClass) {
        profileTeacherClass.textContent =
            teacherClass || "Class";
    }


    // =====================================================
    // MOBILE SIDEBAR
    // =====================================================

    if (menuButton) {

        menuButton.addEventListener("click", function () {

            sidebar.classList.add("open");
            overlay.classList.add("active");

        });

    }


    if (overlay) {

        overlay.addEventListener("click", function () {

            sidebar.classList.remove("open");
            overlay.classList.remove("active");

        });

    }


    // =====================================================
    // NAVIGATION
    // =====================================================

    navLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const target =
                link.getAttribute("data-section");

            // Upload Results is a normal page link
            if (!target) {
                return;
            }

            event.preventDefault();


            navLinks.forEach(function (item) {
                item.classList.remove("active");
            });

            link.classList.add("active");


            sections.forEach(function (section) {
                section.classList.remove("active");
            });


            const selectedSection =
                document.getElementById(target);

            if (selectedSection) {
                selectedSection.classList.add("active");
            }


            sidebar.classList.remove("open");
            overlay.classList.remove("active");


            // Load students when opening Student Management
            if (target === "studentManagement") {
                loadStudents();
            }

        });

    });


    // =====================================================
    // QUICK ACTIONS
    // =====================================================

    const quickButtons =
        document.querySelectorAll(
            ".teacher-quick-actions [data-section]"
        );


    quickButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const target =
                button.getAttribute("data-section");


            navLinks.forEach(function (link) {
                link.classList.remove("active");
            });


            const matchingLink =
                document.querySelector(
                    `.teacher-nav-link[data-section="${target}"]`
                );


            if (matchingLink) {
                matchingLink.classList.add("active");
            }


            sections.forEach(function (section) {
                section.classList.remove("active");
            });


            const selectedSection =
                document.getElementById(target);


            if (selectedSection) {
                selectedSection.classList.add("active");
            }


            if (target === "studentManagement") {
                loadStudents();
            }

        });

    });


    // =====================================================
    // STUDENT MANAGEMENT ELEMENTS
    // =====================================================

    const addStudentButton =
        document.getElementById("addStudentButton");

    const studentFormContainer =
        document.getElementById("studentFormContainer");

    const studentForm =
        document.getElementById("studentForm");

    const cancelStudentButton =
        document.getElementById("cancelStudentButton");

    const studentTableBody =
        document.getElementById("studentTableBody");


    // =====================================================
    // SHOW ADD STUDENT FORM
    // =====================================================

    if (addStudentButton) {

        addStudentButton.addEventListener(
            "click",
            function () {

                studentForm.reset();

                document.getElementById(
                    "studentId"
                ).value = "";


                document.getElementById(
                    "studentClass"
                ).value = teacherClass;


                studentFormContainer.style.display =
                    "block";

            }
        );

    }


    // =====================================================
    // CANCEL FORM
    // =====================================================

    if (cancelStudentButton) {

        cancelStudentButton.addEventListener(
            "click",
            function () {

                studentForm.reset();

                studentFormContainer.style.display =
                    "none";

            }
        );

    }


    // =====================================================
    // LOAD STUDENTS FROM DATABASE
    // =====================================================

    async function loadStudents() {

        if (!studentTableBody) return;


        studentTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    Loading students...
                </td>
            </tr>
        `;


        try {

            if (!teacherClass) {

                studentTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align:center;">
                            No class has been assigned to this teacher.
                        </td>
                    </tr>
                `;

                updateStudentCount(0);

                return;
            }


            const response =
                await fetch(
                    `${API_URL}/api/students?studentClass=${encodeURIComponent(teacherClass)}`
                );


            const data =
                await response.json();


            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to load students."
                );
            }


            displayStudents(data);

        }

        catch (error) {

            console.error(
                "Load students error:",
                error
            );


            studentTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        Unable to load students.
                    </td>
                </tr>
            `;

            updateStudentCount(0);

        }

    }


    // =====================================================
    // DISPLAY STUDENTS
    // =====================================================

    function displayStudents(students) {

        if (!students || students.length === 0) {

            studentTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        No students added yet.
                    </td>
                </tr>
            `;

            updateStudentCount(0);

            return;
        }


        updateStudentCount(students.length);


        studentTableBody.innerHTML = "";


        students.forEach(function (student, index) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${student.serial_number || index + 1}
                </td>

                <td>
                    ${escapeHTML(
                        student.student_name || ""
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        student.registration_number || ""
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        student.sex || ""
                    )}
                </td>

                <td>
                    ${formatDate(
                        student.date_of_birth
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn"
                        onclick="editStudent(${student.id})">

                        Edit

                    </button>


                    <button
                        type="button"
                        class="btn"
                        onclick="deleteStudent(${student.id})">

                        Delete

                    </button>

                </td>

            `;


            studentTableBody.appendChild(row);

        });

    }


    // =====================================================
    // SAVE STUDENT
    // =====================================================

    if (studentForm) {

        studentForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const studentId =
                    document.getElementById(
                        "studentId"
                    ).value;


                const studentData = {

                    studentName:
                        document.getElementById(
                            "studentName"
                        ).value.trim(),

                    registrationNumber:
                        document.getElementById(
                            "registrationNumber"
                        ).value.trim(),

                    serialNumber:
                        document.getElementById(
                            "serialNumber"
                        ).value || null,

                    studentClass:
                        teacherClass,

                    address:
                        document.getElementById(
                            "studentAddress"
                        ).value.trim(),

                    guardian:
                        document.getElementById(
                            "guardianName"
                        ).value.trim(),

                    phone:
                        document.getElementById(
                            "parentPhone"
                        ).value.trim(),

                    sex:
                        document.getElementById(
                            "studentSex"
                        ).value,

                    dob:
                        document.getElementById(
                            "studentDob"
                        ).value || null,

                    teacherName:
                        teacherName

                };


                if (
                    !studentData.studentName ||
                    !studentData.registrationNumber ||
                    !studentData.studentClass
                ) {

                    alert(
                        "Please enter the student name, registration number and class."
                    );

                    return;

                }


                const saveButton =
                    document.getElementById(
                        "saveStudentButton"
                    );


                saveButton.disabled = true;
                saveButton.textContent = "Saving...";


                try {

                    let response;


                    if (studentId) {

                        // EDIT STUDENT

                        response =
                            await fetch(
                                `${API_URL}/api/students/${studentId}`,
                                {
                                    method: "PUT",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify(
                                            studentData
                                        )
                                }
                            );

                    }

                    else {

                        // ADD STUDENT

                        response =
                            await fetch(
                                `${API_URL}/api/students`,
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify(
                                            studentData
                                        )
                                }
                            );

                    }


                    const result =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            result.error ||
                            "Unable to save student."
                        );

                    }


                    alert(
                        studentId
                            ? "Student updated successfully!"
                            : "Student added successfully!"
                    );


                    studentForm.reset();

                    studentFormContainer.style.display =
                        "none";


                    loadStudents();

                }

                catch (error) {

                    console.error(
                        "Save student error:",
                        error
                    );


                    alert(
                        error.message ||
                        "Unable to save student."
                    );

                }

                finally {

                    saveButton.disabled = false;
                    saveButton.textContent =
                        "Save Student";

                }

            }
        );

    }


    // =====================================================
    // EDIT STUDENT
    // =====================================================

    window.editStudent = async function (id) {

        try {

            const response =
                await fetch(
                    `${API_URL}/api/students?studentClass=${encodeURIComponent(teacherClass)}`
                );


            const students =
                await response.json();


            const student =
                students.find(
                    item =>
                        Number(item.id) === Number(id)
                );


            if (!student) {

                alert(
                    "Student could not be found."
                );

                return;

            }


            document.getElementById(
                "studentId"
            ).value = student.id;


            document.getElementById(
                "studentName"
            ).value =
                student.student_name || "";


            document.getElementById(
                "registrationNumber"
            ).value =
                student.registration_number || "";


            document.getElementById(
                "serialNumber"
            ).value =
                student.serial_number || "";


            document.getElementById(
                "studentSex"
            ).value =
                student.sex || "";


            document.getElementById(
                "studentDob"
            ).value =
                student.date_of_birth
                    ? student.date_of_birth.substring(0, 10)
                    : "";


            document.getElementById(
                "studentAddress"
            ).value =
                student.address || "";


            document.getElementById(
                "guardianName"
            ).value =
                student.guardian || "";


            document.getElementById(
                "parentPhone"
            ).value =
                student.phone || "";


            document.getElementById(
                "studentClass"
            ).value =
                teacherClass;


            studentFormContainer.style.display =
                "block";


            studentFormContainer.scrollIntoView({
                behavior: "smooth"
            });

        }

        catch (error) {

            console.error(
                "Edit student error:",
                error
            );

            alert(
                "Unable to load student information."
            );

        }

    };


    // =====================================================
    // DELETE STUDENT
    // =====================================================

    window.deleteStudent = async function (id) {

        if (
            !confirm(
                "Are you sure you want to delete this student?"
            )
        ) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/students/${id}`,
                    {
                        method: "DELETE"
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Unable to delete student."
                );

            }


            alert(
                "Student deleted successfully."
            );


            loadStudents();

        }

        catch (error) {

            console.error(
                "Delete student error:",
                error
            );


            alert(
                error.message ||
                "Unable to delete student."
            );

        }

    };


    // =====================================================
    // STUDENT COUNT
    // =====================================================

    function updateStudentCount(count) {

        const totalStudents =
            document.getElementById(
                "totalStudents"
            );

        if (totalStudents) {
            totalStudents.textContent = count;
        }

    }


    // =====================================================
    // FORMAT DATE
    // =====================================================

    function formatDate(date) {

        if (!date) {
            return "—";
        }

        const parts =
            String(date).split("T")[0].split("-");


        if (parts.length === 3) {

            return `${parts[2]}/${parts[1]}/${parts[0]}`;

        }


        return date;

    }


    // =====================================================
    // SECURITY: ESCAPE HTML
    // =====================================================

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    loadStudents();

});