document.addEventListener("DOMContentLoaded", function () {

    const API_URL =
        "https://lagos-state-model-college-backend.onrender.com";


    /* =========================================================
       TEACHER IDENTITY
       ========================================================= */

    let savedStaffUser = null;

    try {
        savedStaffUser =
            JSON.parse(
                localStorage.getItem("staffUser") || "null"
            );
    } catch (error) {
        savedStaffUser = null;
    }


    const teacherName =
        localStorage.getItem("teacherName") ||
        savedStaffUser?.name ||
        savedStaffUser?.full_name ||
        "Class Teacher";


    const teacherClass =
        localStorage.getItem("teacherClass") ||
        savedStaffUser?.class ||
        savedStaffUser?.assigned_class ||
        "";


    const teacherId =
        localStorage.getItem("teacherId") ||
        savedStaffUser?.id ||
        "";


    /* =========================================================
       ELEMENTS
       ========================================================= */

    const sidebar =
        document.getElementById("teacherSidebar");

    const overlay =
        document.getElementById("teacherOverlay");

    const menuButton =
        document.getElementById("teacherMenuButton");

    const logoutButton =
        document.getElementById("teacherLogoutButton");


    const teacherDisplayName =
        document.getElementById("teacherDisplayName");

    const teacherDisplayClass =
        document.getElementById("teacherDisplayClass");

    const teacherWelcomeName =
        document.getElementById("teacherWelcomeName");

    const teacherClassElement =
        document.getElementById("teacherClass");


    const profileTeacherName =
        document.getElementById("profileTeacherName");

    const profileTeacherClass =
        document.getElementById("profileTeacherClass");

    const profileTeacherUsername =
        document.getElementById("profileTeacherUsername");


    /* =========================================================
       DISPLAY TEACHER INFORMATION
       ========================================================= */

    if (teacherDisplayName) {
        teacherDisplayName.textContent =
            teacherName;
    }


    if (teacherDisplayClass) {
        teacherDisplayClass.textContent =
            teacherClass || "Not assigned";
    }


    if (teacherWelcomeName) {
        teacherWelcomeName.textContent =
            teacherName;
    }


    if (teacherClassElement) {
        teacherClassElement.textContent =
            teacherClass || "Your Class";
    }


    if (profileTeacherName) {
        profileTeacherName.textContent =
            teacherName;
    }


    if (profileTeacherClass) {
        profileTeacherClass.textContent =
            teacherClass || "Not assigned";
    }


    if (profileTeacherUsername) {
        profileTeacherUsername.textContent =
            savedStaffUser?.username ||
            localStorage.getItem("teacherUsername") ||
            "—";
    }


    /* =========================================================
       MOBILE SIDEBAR
       ========================================================= */

    function openSidebar() {

        if (sidebar) {
            sidebar.classList.add("open");
        }

        if (overlay) {
            overlay.classList.add("active");
        }
    }


    function closeSidebar() {

        if (sidebar) {
            sidebar.classList.remove("open");
        }

        if (overlay) {
            overlay.classList.remove("active");
        }
    }


    if (menuButton) {

        menuButton.addEventListener(
            "click",
            function () {

                if (
                    sidebar &&
                    sidebar.classList.contains("open")
                ) {
                    closeSidebar();
                } else {
                    openSidebar();
                }

            }
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    /* =========================================================
       SECTION NAVIGATION
       ========================================================= */

    const navLinks =
        document.querySelectorAll(
            ".teacher-nav-link"
        );


    const sections =
        document.querySelectorAll(
            ".teacher-section"
        );


    function showSection(sectionId) {

        sections.forEach(
            function (section) {

                section.classList.remove(
                    "active"
                );

            }
        );


        navLinks.forEach(
            function (link) {

                link.classList.remove(
                    "active"
                );

            }
        );


        const section =
            document.getElementById(
                sectionId
            );


        if (section) {

            section.classList.add(
                "active"
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }


        const activeLink =
            document.querySelector(
                `.teacher-nav-link[data-section="${sectionId}"]`
            );


        if (activeLink) {

            activeLink.classList.add(
                "active"
            );

        }


        closeSidebar();


        if (sectionId === "studentManagement") {
            loadStudents();
        }


        if (sectionId === "resultManagement") {
            loadTeacherResults();
        }


        if (sectionId === "attendance") {
            setDefaultAttendanceWeek();

            loadWeeklyAttendance();
        }

    }


    navLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    const sectionId =
                        link.dataset.section;

                    if (sectionId) {
                        showSection(
                            sectionId
                        );
                    }

                }
            );

        }
    );


    document
        .querySelectorAll(
            "[data-section]"
        )
        .forEach(
            function (element) {

                if (
                    element.classList.contains(
                        "teacher-nav-link"
                    )
                ) {
                    return;
                }


                element.addEventListener(
                    "click",
                    function (event) {

                        if (
                            element.tagName ===
                            "A"
                        ) {
                            event.preventDefault();
                        }


                        const sectionId =
                            element.dataset.section;

                        if (sectionId) {

                            showSection(
                                sectionId
                            );

                        }

                    }
                );

            }
        );


    /* =========================================================
       LOGOUT
       ========================================================= */

    function logoutTeacher() {

        const confirmed =
            confirm(
                "Are you sure you want to logout?"
            );


        if (!confirmed) {
            return;
        }


        localStorage.removeItem(
            "staffUser"
        );

        localStorage.removeItem(
            "teacherId"
        );

        localStorage.removeItem(
            "teacherName"
        );

        localStorage.removeItem(
            "teacherClass"
        );

        localStorage.removeItem(
            "teacherUsername"
        );


        sessionStorage.clear();


        window.location.href =
            "admin-login.html";

    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logoutTeacher
        );

    }


    /* =========================================================
       STUDENT MANAGEMENT
       ========================================================= */

    const addStudentButton =
        document.getElementById(
            "addStudentButton"
        );


    const studentFormContainer =
        document.getElementById(
            "studentFormContainer"
        );


    const studentForm =
        document.getElementById(
            "studentForm"
        );


    const cancelStudentButton =
        document.getElementById(
            "cancelStudentButton"
        );


    const studentTableBody =
        document.getElementById(
            "studentTableBody"
        );


    const studentIdInput =
        document.getElementById(
            "studentId"
        );


    const studentNameInput =
        document.getElementById(
            "studentName"
        );


    const registrationNumberInput =
        document.getElementById(
            "registrationNumber"
        );


    const serialNumberInput =
        document.getElementById(
            "serialNumber"
        );


    const studentClassInput =
        document.getElementById(
            "studentClass"
        );


    const studentSexInput =
        document.getElementById(
            "studentSex"
        );


    const studentDobInput =
        document.getElementById(
            "studentDob"
        );


    const guardianNameInput =
        document.getElementById(
            "guardianName"
        );


    const parentPhoneInput =
        document.getElementById(
            "parentPhone"
        );


    const studentAddressInput =
        document.getElementById(
            "studentAddress"
        );


    const saveStudentButton =
        document.getElementById(
            "saveStudentButton"
        );


    function openStudentForm(student = null) {

        if (!studentFormContainer) {
            return;
        }


        studentFormContainer.style.display =
            "block";


        if (studentClassInput) {
            studentClassInput.value =
                teacherClass;
        }


        if (!student) {

            studentForm?.reset();

            if (studentClassInput) {
                studentClassInput.value =
                    teacherClass;
            }

            if (studentIdInput) {
                studentIdInput.value = "";
            }

            if (saveStudentButton) {
                saveStudentButton.textContent =
                    "Save Student";
            }

        } else {

            if (studentIdInput) {
                studentIdInput.value =
                    student.id || "";
            }


            if (studentNameInput) {
                studentNameInput.value =
                    student.student_name ||
                    student.full_name ||
                    student.name ||
                    "";
            }


            if (registrationNumberInput) {
                registrationNumberInput.value =
                    student.registration_number ||
                    student.admission_number ||
                    student.registrationNumber ||
                    "";
            }


            if (serialNumberInput) {
                serialNumberInput.value =
                    student.serial_number ||
                    student.serialNumber ||
                    "";
            }


            if (studentClassInput) {
                studentClassInput.value =
                    student.student_class ||
                    student.class ||
                    teacherClass;
            }


            if (studentSexInput) {
                studentSexInput.value =
                    student.sex ||
                    "";
            }


            if (studentDobInput) {
                studentDobInput.value =
                    student.date_of_birth ||
                    student.dob ||
                    "";
            }


            if (guardianNameInput) {
                guardianNameInput.value =
                    student.guardian_name ||
                    student.guardianName ||
                    "";
            }


            if (parentPhoneInput) {
                parentPhoneInput.value =
                    student.parent_phone ||
                    student.parentPhone ||
                    "";
            }


            if (studentAddressInput) {
                studentAddressInput.value =
                    student.address ||
                    "";
            }


            if (saveStudentButton) {
                saveStudentButton.textContent =
                    "Update Student";
            }

        }


        studentFormContainer.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    function closeStudentForm() {

        if (studentFormContainer) {
            studentFormContainer.style.display =
                "none";
        }


        if (studentForm) {
            studentForm.reset();
        }


        if (studentIdInput) {
            studentIdInput.value = "";
        }


        if (studentClassInput) {
            studentClassInput.value =
                teacherClass;
        }


        if (saveStudentButton) {
            saveStudentButton.textContent =
                "Save Student";
        }

    }


    if (addStudentButton) {

        addStudentButton.addEventListener(
            "click",
            function () {
                openStudentForm();
            }
        );

    }


    if (cancelStudentButton) {

        cancelStudentButton.addEventListener(
            "click",
            closeStudentForm
        );

    }


    function normalizeStudent(student) {

        return {
            ...student,

            id:
                student.id ??
                student.student_id ??
                student.registration_number ??
                student.admission_number,

            student_name:
                student.student_name ||
                student.full_name ||
                student.name ||
                "",

            registration_number:
                student.registration_number ||
                student.admission_number ||
                student.registrationNumber ||
                "",

            student_class:
                student.student_class ||
                student.class ||
                "",

            sex:
                student.sex ||
                "",

            date_of_birth:
                student.date_of_birth ||
                student.dob ||
                "",

            guardian_name:
                student.guardian_name ||
                student.guardianName ||
                "",

            parent_phone:
                student.parent_phone ||
                student.parentPhone ||
                "",

            address:
                student.address ||
                ""
        };

    }


    let cachedStudents = [];


    async function loadStudents() {

        if (!studentTableBody) {
            return;
        }


        studentTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;"
                >
                    Loading students...
                </td>
            </tr>
        `;


        try {

            let url =
                `${API_URL}/api/students`;


            if (teacherClass) {

                url +=
                    `?studentClass=${encodeURIComponent(
                        teacherClass
                    )}`;

            }


            const response =
                await fetch(url);


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to load students."
                );

            }


            let students =
                data.students ||
                data.data ||
                [];


            students =
                students.map(
                    normalizeStudent
                );


            if (teacherClass) {

                students =
                    students.filter(
                        function (student) {

                            return (
                                String(
                                    student.student_class ||
                                    ""
                                ).toLowerCase()
                                ===
                                String(
                                    teacherClass
                                ).toLowerCase()
                            );

                        }
                    );

            }


            cachedStudents =
                students;


            displayStudents(
                students
            );


            updateStudentCount(
                students.length
            );


        } catch (error) {

            console.error(
                "Load students error:",
                error
            );


            studentTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        style="
                            text-align:center;
                            color:#b91c1c;
                            padding:20px;
                        "
                    >
                        Unable to load students.
                        Please refresh and try again.
                    </td>
                </tr>
            `;

        }

    }


    function updateStudentCount(count) {

        const totalStudents =
            document.getElementById(
                "totalStudents"
            );


        if (totalStudents) {
            totalStudents.textContent =
                count;
        }

    }


    function displayStudents(students) {

        if (!studentTableBody) {
            return;
        }


        if (!students.length) {

            studentTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        style="
                            text-align:center;
                            padding:25px;
                            color:#6b7280;
                        "
                    >
                        No students found in
                        ${escapeHtml(
                            teacherClass ||
                            "your class"
                        )}.
                    </td>
                </tr>
            `;

            return;
        }


        studentTableBody.innerHTML =
            students
                .map(
                    function (student, index) {

                        const studentId =
                            student.id ?? "";


                        return `
                            <tr
                                data-student-id="${escapeHtml(
                                    String(studentId)
                                )}"
                            >

                                <td>
                                    ${index + 1}
                                </td>

                                <td>
                                    <strong>
                                        ${escapeHtml(
                                            student.student_name
                                        )}
                                    </strong>
                                </td>

                                <td>
                                    ${escapeHtml(
                                        student.registration_number
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        student.sex ||
                                        "—"
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        formatDate(
                                            student.date_of_birth
                                        )
                                    )}
                                </td>

                                <td>

                                    <div
                                        class="table-actions"
                                    >

                                        <button
                                            type="button"
                                            class="btn btn-secondary"
                                            data-action="edit"
                                        >
                                            ✏️ Edit
                                        </button>

                                        <button
                                            type="button"
                                            class="btn btn-danger"
                                            data-action="delete"
                                        >
                                            🗑 Delete
                                        </button>

                                        <button
                                            type="button"
                                            class="btn btn-primary"
                                            data-action="upload-result"
                                        >
                                            📤 Upload Result
                                        </button>

                                    </div>

                                </td>

                            </tr>
                        `;

                    }
                )
                .join("");

    }


    if (studentTableBody) {

        studentTableBody.addEventListener(
            "click",
            async function (event) {

                const button =
                    event.target.closest(
                        "button[data-action]"
                    );


                if (!button) {
                    return;
                }


                const row =
                    button.closest("tr");


                if (!row) {
                    return;
                }


                const studentId =
                    row.dataset.studentId;


                const student =
                    cachedStudents.find(
                        function (item) {

                            return String(
                                item.id
                            ) ===
                            String(
                                studentId
                            );

                        }
                    );


                if (!student) {

                    alert(
                        "Unable to find this student."
                    );

                    return;
                }


                const action =
                    button.dataset.action;


                if (action === "edit") {

                    openStudentForm(
                        student
                    );

                }


                if (
                    action === "delete"
                ) {

                    await deleteStudent(
                        student
                    );

                }


                if (
                    action === "upload-result"
                ) {

                    uploadResultForStudent(
                        student
                    );

                }

            }
        );

    }


    if (studentForm) {

        studentForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const payload = {

                    studentName:
                        studentNameInput?.value.trim() ||
                        "",

                    registrationNumber:
                        registrationNumberInput?.value.trim() ||
                        "",

                    serialNumber:
                        serialNumberInput?.value ||
                        null,

                    studentClass:
                        teacherClass,

                    sex:
                        studentSexInput?.value ||
                        "",

                    dateOfBirth:
                        studentDobInput?.value ||
                        null,

                    guardianName:
                        guardianNameInput?.value.trim() ||
                        "",

                    parentPhone:
                        parentPhoneInput?.value.trim() ||
                        "",

                    address:
                        studentAddressInput?.value.trim() ||
                        "",

                    teacherId:
                        teacherId || null,

                    teacherName:
                        teacherName || null

                };


                if (
                    !payload.studentName ||
                    !payload.registrationNumber
                ) {

                    alert(
                        "Please enter the student name and registration number."
                    );

                    return;
                }


                const id =
                    studentIdInput?.value;


                const isEditing =
                    Boolean(id);


                if (saveStudentButton) {

                    saveStudentButton.disabled =
                        true;

                    saveStudentButton.textContent =
                        isEditing
                            ? "Updating..."
                            : "Saving...";

                }


                try {

                    let url =
                        `${API_URL}/api/students`;


                    let method =
                        "POST";


                    if (isEditing) {

                        url +=
                            `/${encodeURIComponent(
                                id
                            )}`;

                        method =
                            "PUT";

                    }


                    const response =
                        await fetch(
                            url,
                            {
                                method,
                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },
                                body:
                                    JSON.stringify(
                                        payload
                                    )
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            data.error ||
                            "Unable to save student."
                        );

                    }


                    alert(
                        isEditing
                            ? "Student updated successfully!"
                            : "Student added successfully!"
                    );


                    closeStudentForm();

                    await loadStudents();

                } catch (error) {

                    console.error(
                        "Save student error:",
                        error
                    );


                    alert(
                        error.message ||
                        "Unable to save student."
                    );

                } finally {

                    if (saveStudentButton) {

                        saveStudentButton.disabled =
                            false;

                        saveStudentButton.textContent =
                            isEditing
                                ? "Update Student"
                                : "Save Student";

                    }

                }

            }
        );

    }


    async function deleteStudent(student) {

        const confirmed =
            confirm(
                `Delete ${student.student_name}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/students/${encodeURIComponent(
                        student.id
                    )}`,
                    {
                        method:
                            "DELETE"
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to delete student."
                );

            }


            alert(
                "Student deleted successfully."
            );


            await loadStudents();

        } catch (error) {

            console.error(
                "Delete student error:",
                error
            );


            alert(
                error.message ||
                "Unable to delete student."
            );

        }

    }


    /* =========================================================
       RESULT MANAGEMENT
       ========================================================= */

    const teacherResultForm =
        document.getElementById(
            "teacherResultForm"
        );


    const teacherResultStudentId =
        document.getElementById(
            "teacherResultStudentId"
        );


    const teacherResultStudentName =
        document.getElementById(
            "teacherResultStudentName"
        );


    const teacherResultRegistrationNumber =
        document.getElementById(
            "teacherResultRegistrationNumber"
        );


    const teacherResultClass =
        document.getElementById(
            "teacherResultClass"
        );


    const teacherResultTerm =
        document.getElementById(
            "teacherResultTerm"
        );


    const teacherResultFile =
        document.getElementById(
            "teacherResultFile"
        );


    const teacherUploadResultButton =
        document.getElementById(
            "teacherUploadResultButton"
        );


    const cancelTeacherResultButton =
        document.getElementById(
            "cancelTeacherResultButton"
        );


    const refreshTeacherResultsButton =
        document.getElementById(
            "refreshTeacherResultsButton"
        );


    const teacherResultsTableBody =
        document.getElementById(
            "teacherResultsTableBody"
        );


    const deletedTeacherResultsTableBody =
        document.getElementById(
            "deletedTeacherResultsTableBody"
        );


    let editingResultId = null;


    function openResultManagement() {

        showSection(
            "resultManagement"
        );

    }


    function uploadResultForStudent(student) {

        if (!student) {
            return;
        }


        editingResultId =
            null;


        if (teacherResultStudentId) {

            teacherResultStudentId.value =
                student.id || "";

        }


        if (teacherResultStudentName) {

            teacherResultStudentName.value =
                student.student_name ||
                "";

        }


        if (
            teacherResultRegistrationNumber
        ) {

            teacherResultRegistrationNumber.value =
                student.registration_number ||
                "";

        }


        if (teacherResultClass) {

            teacherResultClass.value =
                student.student_class ||
                teacherClass ||
                "";

        }


        if (teacherResultTerm) {

            teacherResultTerm.value =
                "";

        }


        if (teacherResultFile) {

            teacherResultFile.value =
                "";

        }


        if (teacherUploadResultButton) {

            teacherUploadResultButton.textContent =
                "📤 Upload Result";

        }


        openResultManagement();


        setTimeout(
            function () {

                const form =
                    document.getElementById(
                        "teacherResultForm"
                    );


                if (form) {

                    form.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "start"
                    });

                }

            },
            100
        );

    }


    function cancelResultUpload() {

        editingResultId =
            null;


        if (teacherResultForm) {
            teacherResultForm.reset();
        }


        if (teacherResultStudentId) {
            teacherResultStudentId.value = "";
        }


        if (teacherResultStudentName) {
            teacherResultStudentName.value = "";
        }


        if (
            teacherResultRegistrationNumber
        ) {
            teacherResultRegistrationNumber.value =
                "";
        }


        if (teacherResultClass) {
            teacherResultClass.value =
                "";
        }


        if (teacherUploadResultButton) {

            teacherUploadResultButton.textContent =
                "📤 Upload Result";

        }

    }


    if (cancelTeacherResultButton) {

        cancelTeacherResultButton.addEventListener(
            "click",
            cancelResultUpload
        );

    }


    if (refreshTeacherResultsButton) {

        refreshTeacherResultsButton.addEventListener(
            "click",
            loadTeacherResults
        );

    }


    if (teacherResultForm) {

        teacherResultForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const studentName =
                    teacherResultStudentName?.value.trim() ||
                    "";


                const admissionNumber =
                    teacherResultRegistrationNumber?.value.trim() ||
                    "";


                const studentClassValue =
                    teacherResultClass?.value.trim() ||
                    teacherClass ||
                    "";


                const term =
                    teacherResultTerm?.value ||
                    "";


                const file =
                    teacherResultFile?.files?.[0];


                if (
                    !studentName ||
                    !admissionNumber ||
                    !studentClassValue
                ) {

                    alert(
                        "Please select a student from Student Management first."
                    );

                    return;
                }


                if (!term) {

                    alert(
                        "Please select the term."
                    );

                    return;
                }


                if (!file) {

                    alert(
                        "Please select the student's result file."
                    );

                    return;
                }


                const maximumSize =
                    10 * 1024 * 1024;


                if (
                    file.size >
                    maximumSize
                ) {

                    alert(
                        "The result file is too large. Maximum size is 10MB."
                    );

                    return;
                }


                if (teacherUploadResultButton) {

                    teacherUploadResultButton.disabled =
                        true;

                    teacherUploadResultButton.textContent =
                        editingResultId
                            ? "Replacing Result..."
                            : "Uploading Result...";

                }


                try {

                    const fileData =
                        await readFileAsDataURL(
                            file
                        );


                    const payload = {

                        studentName:
                            studentName,

                        admissionNumber:
                            admissionNumber,

                        studentClass:
                            studentClassValue,

                        term:
                            term,

                        fileName:
                            file.name,

                        fileType:
                            file.type,

                        fileData:
                            fileData,

                        teacherId:
                            teacherId || null,

                        teacherName:
                            teacherName || "Teacher"

                    };


                    const response =
                        await fetch(
                            `${API_URL}/api/results`,
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        payload
                                    )
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            data.error ||
                            "Unable to upload result."
                        );

                    }


                    alert(
                        editingResultId
                            ? "Result replaced successfully!"
                            : "Result uploaded successfully!"
                    );


                    cancelResultUpload();


                    await loadTeacherResults();


                    updateResultCount();

                } catch (error) {

                    console.error(
                        "Upload result error:",
                        error
                    );


                    alert(
                        error.message ||
                        "Unable to upload result."
                    );

                } finally {

                    if (teacherUploadResultButton) {

                        teacherUploadResultButton.disabled =
                            false;

                        teacherUploadResultButton.textContent =
                            "📤 Upload Result";

                    }

                }

            }
        );

    }


    function readFileAsDataURL(file) {

        return new Promise(
            function (resolve, reject) {

                const reader =
                    new FileReader();


                reader.onload =
                    function () {

                        resolve(
                            reader.result
                        );

                    };


                reader.onerror =
                    function () {

                        reject(
                            new Error(
                                "Unable to read the selected file."
                            )
                        );

                    };


                reader.readAsDataURL(
                    file
                );

            }
        );

    }


    async function loadTeacherResults() {

        if (!teacherResultsTableBody) {
            return;
        }
    
        teacherResultsTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    Loading results...
                </td>
            </tr>
        `;
    
        if (deletedTeacherResultsTableBody) {
            deletedTeacherResultsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        Loading deleted results...
                    </td>
                </tr>
            `;
        }
    
        try {
    
            // =============================================
            // LOAD ALL RESULTS FROM BACKEND
            // =============================================
    
            const response = await fetch(
                `${API_URL}/api/results/manage`
            );
    
            const data = await response.json();
    
            if (!response.ok) {
    
                throw new Error(
                    data.error ||
                    data.message ||
                    "Unable to load results."
                );
    
            }
    
            let results = Array.isArray(data.results)
                ? data.results
                : [];
    
            // =============================================
            // SHOW ONLY THIS TEACHER'S CLASS
            // =============================================
    
            if (teacherClass) {
    
                const currentClass =
                    teacherClass
                        .trim()
                        .toLowerCase();
    
                results = results.filter(function (result) {
    
                    const resultClass =
                        String(
                            result.student_class || ""
                        )
                        .trim()
                        .toLowerCase();
    
                    return resultClass === currentClass;
    
                });
    
            }
    
            // =============================================
            // ACTIVE / DELETED RESULTS
            // =============================================
    
            const activeResults =
                results.filter(function (result) {
    
                    return !result.deleted_at;
    
                });
    
            const deletedResults =
                results.filter(function (result) {
    
                    return !!result.deleted_at;
    
                });
    
            // =============================================
            // DISPLAY
            // =============================================
    
            displayTeacherResults(
                activeResults
            );
    
            displayDeletedTeacherResults(
                deletedResults
            );
    
        }
    
        catch (error) {
    
            console.error(
                "Load teacher results error:",
                error
            );
    
            teacherResultsTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        style="
                            text-align:center;
                            color:#dc2626;
                            padding:20px;
                        "
                    >
                        Unable to load results.
                        Please try again.
                    </td>
                </tr>
            `;
    
            if (deletedTeacherResultsTableBody) {
    
                deletedTeacherResultsTableBody.innerHTML = `
                    <tr>
                        <td
                            colspan="8"
                            style="
                                text-align:center;
                                color:#dc2626;
                                padding:20px;
                            "
                        >
                            Unable to load deleted results.
                        </td>
                    </tr>
                `;
    
            }
    
        }
    
    }

    function displayTeacherResults(results) {

        if (!teacherResultsTableBody) {
            return;
        }


        if (!results.length) {

            teacherResultsTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        style="text-align:center;padding:25px;color:#6b7280;"
                    >
                        No uploaded results found.
                    </td>
                </tr>
            `;

            return;
        }


        teacherResultsTableBody.innerHTML =
            results
                .map(
                    function (result, index) {

                        return `
                            <tr>

                                <td>
                                    ${index + 1}
                                </td>

                                <td>
                                    <strong>
                                        ${escapeHtml(
                                            result.student_name ||
                                            result.studentName ||
                                            ""
                                        )}
                                    </strong>
                                </td>

                                <td>
                                    ${escapeHtml(
                                        result.admission_number ||
                                        result.registration_number ||
                                        ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        result.student_class ||
                                        ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        result.term ||
                                        ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        result.file_name ||
                                        result.fileName ||
                                        "Result"
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        formatResultDate(
                                            result.created_at
                                        )
                                    )}
                                </td>

                                <td>

                                    <div
                                        class="table-actions"
                                    >

                                        <button
                                            type="button"
                                            class="btn btn-primary"
                                            data-result-action="view"
                                            data-result-id="${escapeHtml(
                                                String(
                                                    result.id
                                                )
                                            )}"
                                        >
                                            👁 View
                                        </button>

                                        <button
                                            type="button"
                                            class="btn btn-warning"
                                            data-result-action="replace"
                                            data-result-id="${escapeHtml(
                                                String(
                                                    result.id
                                                )
                                            )}"
                                        >
                                            🔄 Replace
                                        </button>

                                        <button
                                            type="button"
                                            class="btn btn-danger"
                                            data-result-action="delete"
                                            data-result-id="${escapeHtml(
                                                String(
                                                    result.id
                                                )
                                            )}"
                                        >
                                            🗑 Delete
                                        </button>

                                    </div>

                                </td>

                            </tr>
                        `;

                    }
                )
                .join("");

    }


    function displayDeletedTeacherResults(
        results
    ) {

        if (!deletedTeacherResultsTableBody) {
            return;
        }


        if (!results.length) {

            deletedTeacherResultsTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        style="text-align:center;padding:25px;color:#6b7280;"
                    >
                        No deleted results.
                    </td>
                </tr>
            `;

            return;
        }


        deletedTeacherResultsTableBody.innerHTML =
            results
                .map(
                    function (result, index) {

                        return `
                            <tr>

                                <td>
                                    ${index + 1}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        result.student_name ||
                                        ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        result.admission_number ||
                                        ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        result.student_class ||
                                        ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        result.term ||
                                        ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        formatResultDate(
                                            result.deleted_at
                                        )
                                    )}
                                </td>

                                <td>

                                    <button
                                        type="button"
                                        class="btn btn-success"
                                        data-result-action="restore"
                                        data-result-id="${escapeHtml(
                                            String(
                                                result.id
                                            )
                                        )}"
                                    >
                                        ♻️ Restore
                                    </button>

                                </td>

                            </tr>
                        `;

                    }
                )
                .join("");

    }


    function findResultById(id) {

        const rows =
            document.querySelectorAll(
                "[data-result-id]"
            );


        return Array.from(
            rows
        ).find(
            function (row) {

                return String(
                    row.dataset.resultId
                ) ===
                String(id);

            }
        );

    }


    async function getResultById(id) {

        try {

            const response =
                await fetch(
                    `${API_URL}/api/results`
                );


            const data =
                await response.json();


            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load result."
                );
            }


            const results =
                data.results ||
                [];


            return results.find(
                function (result) {

                    return String(
                        result.id
                    ) ===
                    String(id);

                }
            );

        } catch (error) {

            console.error(
                "Get result error:",
                error
            );

            return null;

        }

    }


    async function viewTeacherResult(
        result
    ) {

        if (!result) {
            return;
        }


        const fileData =
            result.file_data ||
            result.fileData ||
            "";


        if (!fileData) {

            alert(
                "This result file is unavailable."
            );

            return;
        }


        const fileType =
            result.file_type ||
            result.fileType ||
            "";


        const fileName =
            result.file_name ||
            result.fileName ||
            "Student Result";


        const newWindow =
            window.open(
                "",
                "_blank"
            );


        if (!newWindow) {

            alert(
                "Please allow pop-ups in your browser to view the result."
            );

            return;
        }


        if (
            fileType ===
            "application/pdf" ||
            fileName.toLowerCase().endsWith(
                ".pdf"
            )
        ) {

            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${escapeHtml(
                        fileName
                    )}</title>
                    <style>
                        html,body{
                            margin:0;
                            width:100%;
                            height:100%;
                            overflow:hidden;
                        }
                        iframe{
                            width:100%;
                            height:100%;
                            border:0;
                        }
                    </style>
                </head>
                <body>
                    <iframe
                        src="${fileData}"
                        title="Student Result"
                    ></iframe>
                </body>
                </html>
            `);

        } else {

            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${escapeHtml(
                        fileName
                    )}</title>
                    <style>
                        body{
                            margin:0;
                            padding:20px;
                            background:#f4f7f5;
                            display:flex;
                            justify-content:center;
                            align-items:flex-start;
                        }
                        img{
                            max-width:100%;
                            height:auto;
                            box-shadow:0 5px 25px rgba(0,0,0,.15);
                            background:white;
                        }
                    </style>
                </head>
                <body>
                    <img
                        src="${fileData}"
                        alt="Student Result"
                    >
                </body>
                </html>
            `);

        }


        newWindow.document.close();

    }


    async function replaceTeacherResult(
        result
    ) {

        if (!result) {
            return;
        }


        editingResultId =
            result.id;


        if (
            teacherResultStudentId
        ) {

            teacherResultStudentId.value =
                result.student_id ||
                "";

        }


        if (
            teacherResultStudentName
        ) {

            teacherResultStudentName.value =
                result.student_name ||
                "";

        }


        if (
            teacherResultRegistrationNumber
        ) {

            teacherResultRegistrationNumber.value =
                result.admission_number ||
                "";

        }


        if (teacherResultClass) {

            teacherResultClass.value =
                result.student_class ||
                teacherClass ||
                "";

        }


        if (teacherResultTerm) {

            teacherResultTerm.value =
                result.term ||
                "";

        }


        if (teacherResultFile) {

            teacherResultFile.value =
                "";

        }


        if (
            teacherUploadResultButton
        ) {

            teacherUploadResultButton.textContent =
                "🔄 Replace Result";

        }


        showSection(
            "resultManagement"
        );


        setTimeout(
            function () {

                if (teacherResultFile) {

                    teacherResultFile.focus();

                    teacherResultFile.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "center"
                    });

                }

            },
            150
        );


        alert(
            "Select the corrected result file, then click Replace Result."
        );

    }


    async function deleteTeacherResult(
        id
    ) {

        const confirmed =
            confirm(
                "Delete this result? You can restore it later from Deleted Results."
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/results/${encodeURIComponent(
                        id
                    )}`,
                    {
                        method:
                            "DELETE"
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to delete result."
                );

            }


            alert(
                "Result moved to Deleted Results."
            );


            await loadTeacherResults();

        } catch (error) {

            console.error(
                "Delete result error:",
                error
            );


            alert(
                error.message ||
                "Unable to delete result."
            );

        }

    }


    async function restoreTeacherResult(
        id
    ) {

        const confirmed =
            confirm(
                "Restore this result?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/results/${encodeURIComponent(
                        id
                    )}/restore`,
                    {
                        method:
                            "PATCH"
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to restore result."
                );

            }


            alert(
                "Result restored successfully."
            );


            await loadTeacherResults();

        } catch (error) {

            console.error(
                "Restore result error:",
                error
            );


            alert(
                error.message ||
                "Unable to restore result."
            );

        }

    }


    if (teacherResultsTableBody) {

        teacherResultsTableBody.addEventListener(
            "click",
            async function (event) {

                const button =
                    event.target.closest(
                        "button[data-result-action]"
                    );


                if (!button) {
                    return;
                }


                const action =
                    button.dataset.resultAction;


                const id =
                    button.dataset.resultId;


                if (!id) {
                    return;
                }


                const result =
                    await getResultById(
                        id
                    );


                if (!result) {

                    alert(
                        "Unable to find this result."
                    );

                    return;
                }


                if (
                    action === "view"
                ) {

                    await viewTeacherResult(
                        result
                    );

                }


                if (
                    action === "replace"
                ) {

                    await replaceTeacherResult(
                        result
                    );

                }


                if (
                    action === "delete"
                ) {

                    await deleteTeacherResult(
                        id
                    );

                }

            }
        );

    }


    if (
        deletedTeacherResultsTableBody
    ) {

        deletedTeacherResultsTableBody.addEventListener(
            "click",
            async function (event) {

                const button =
                    event.target.closest(
                        "button[data-result-action]"
                    );


                if (!button) {
                    return;
                }


                const action =
                    button.dataset.resultAction;


                const id =
                    button.dataset.resultId;


                if (
                    action === "restore" &&
                    id
                ) {

                    await restoreTeacherResult(
                        id
                    );

                }

            }
        );

    }


    function updateResultCount(
        count = null
    ) {

        const counter =
            document.getElementById(
                "totalTeacherResults"
            );


        if (!counter) {
            return;
        }


        if (count !== null) {

            counter.textContent =
                count;

            return;
        }


        fetchTeacherResultCount();

    }


    async function fetchTeacherResultCount() {

        try {

            const params =
                new URLSearchParams();


            if (teacherClass) {

                params.set(
                    "studentClass",
                    teacherClass
                );

            }


            if (teacherId) {

                params.set(
                    "teacherId",
                    teacherId
                );

            }


            const response =
                await fetch(
                    `${API_URL}/api/results?${params.toString()}`
                );


            if (!response.ok) {
                return;
            }


            const data =
                await response.json();


            const results =
                data.results ||
                [];


            const counter =
                document.getElementById(
                    "totalTeacherResults"
                );


            if (counter) {

                counter.textContent =
                    results.filter(
                        function (result) {

                            return !result.deleted_at;

                        }
                    ).length;

            }

        } catch (error) {

            console.error(
                "Result count error:",
                error
            );

        }

    }


    /* =========================================================
       ATTENDANCE
       ========================================================= */

    const attendanceWeek =
        document.getElementById(
            "attendanceWeek"
        );


    const loadAttendanceButton =
        document.getElementById(
            "loadAttendanceButton"
        );


    const saveAttendanceButton =
        document.getElementById(
            "saveAttendanceButton"
        );


    const attendanceTableBody =
        document.getElementById(
            "attendanceTableBody"
        );


    const attendanceWeekLabel =
        document.getElementById(
            "attendanceWeekLabel"
        );


    function getMonday(
        date
    ) {

        const result =
            new Date(date);


        const day =
            result.getDay();


        const difference =
            day === 0
                ? -6
                : 1 - day;


        result.setDate(
            result.getDate() +
            difference
        );


        result.setHours(
            0,
            0,
            0,
            0
        );


        return result;

    }


    function formatInputDate(
        date
    ) {

        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );


        return `${year}-${month}-${day}`;

    }


    function setDefaultAttendanceWeek() {

        if (!attendanceWeek) {
            return;
        }


        if (!attendanceWeek.value) {

            attendanceWeek.value =
                formatInputDate(
                    getMonday(
                        new Date()
                    )
                );

        }

    }


    function getAttendanceDates(
        mondayString
    ) {

        const monday =
            new Date(
                `${mondayString}T00:00:00`
            );


        const dates = [];


        for (
            let index = 0;
            index < 5;
            index++
        ) {

            const date =
                new Date(
                    monday
                );


            date.setDate(
                monday.getDate() +
                index
            );


            dates.push(
                formatInputDate(
                    date
                )
            );

        }


        return dates;

    }


    async function loadWeeklyAttendance() {

        if (
            !attendanceTableBody ||
            !attendanceWeek
        ) {
            return;
        }


        setDefaultAttendanceWeek();


        const weekStart =
            attendanceWeek.value;


        if (!weekStart) {

            alert(
                "Please select a week."
            );

            return;
        }


        attendanceTableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    style="text-align:center;"
                >
                    Loading attendance...
                </td>
            </tr>
        `;


        if (attendanceWeekLabel) {

            attendanceWeekLabel.textContent =
                `Week starting ${formatDate(
                    weekStart
                )}`;

        }


        try {

            const students =
                cachedStudents.length
                    ? cachedStudents
                    : await getStudentsForAttendance();


            let attendanceRecords =
                [];


            const params =
                new URLSearchParams();


            if (teacherClass) {

                params.set(
                    "studentClass",
                    teacherClass
                );

            }


            params.set(
                "weekStart",
                weekStart
            );


            const response =
                await fetch(
                    `${API_URL}/api/attendance?${params.toString()}`
                );


            if (response.ok) {

                const data =
                    await response.json();


                attendanceRecords =
                    data.attendance ||
                    data.records ||
                    [];

            }


            renderWeeklyAttendance(
                students,
                attendanceRecords,
                weekStart
            );


        } catch (error) {

            console.error(
                "Load attendance error:",
                error
            );


            attendanceTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        style="
                            text-align:center;
                            color:#b91c1c;
                            padding:20px;
                        "
                    >
                        Unable to load attendance.
                    </td>
                </tr>
            `;

        }

    }


    async function getStudentsForAttendance() {

        try {

            const params =
                new URLSearchParams();


            if (teacherClass) {

                params.set(
                    "studentClass",
                    teacherClass
                );

            }


            const response =
                await fetch(
                    `${API_URL}/api/students?${params.toString()}`
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load students."
                );

            }


            const students =
                (
                    data.students ||
                    []
                ).map(
                    normalizeStudent
                );


            return students;

        } catch (error) {

            console.error(
                "Attendance students error:",
                error
            );


            return [];

        }

    }


    function normalizeAttendanceDate(
        value
    ) {

        if (!value) {
            return "";
        }


        return String(
            value
        ).substring(
            0,
            10
        );

    }


    function renderWeeklyAttendance(
        students,
        records,
        weekStart
    ) {

        if (!attendanceTableBody) {
            return;
        }


        if (!students.length) {

            attendanceTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        style="text-align:center;padding:25px;color:#6b7280;"
                    >
                        No students found.
                    </td>
                </tr>
            `;

            return;
        }


        const dates =
            getAttendanceDates(
                weekStart
            );


        const attendanceMap =
            {};


        records.forEach(
            function (record) {

                const studentId =
                    String(
                        record.student_id ||
                        record.studentId ||
                        ""
                    );


                const date =
                    normalizeAttendanceDate(
                        record.attendance_date ||
                        record.attendanceDate
                    );


                if (!studentId || !date) {
                    return;
                }


                if (
                    !attendanceMap[
                        studentId
                    ]
                )
                {

                    attendanceMap[
                        studentId
                    ] = {};

                }


                attendanceMap[
                    studentId
                ][
                    date
                ] =
                    record.status || "";

            }
        );


        attendanceTableBody.innerHTML =
            students
                .map(
                    function (student, index) {

                        const studentId =
                            String(
                                student.id
                            );


                        return `
                            <tr>

                                <td>
                                    ${index + 1}
                                </td>

                                <td>
                                    <strong>
                                        ${escapeHtml(
                                            student.student_name
                                        )}
                                    </strong>
                                </td>

                                <td>
                                    ${escapeHtml(
                                        student.registration_number
                                    )}
                                </td>

                                ${dates
                                    .map(
                                        function (
                                            date
                                        ) {

                                            const savedStatus =
                                                attendanceMap[
                                                    studentId
                                                ]?.[
                                                    date
                                                ] ||
                                                "";


                                            return `
                                                <td>

                                                    <select
                                                        class="attendance-status"
                                                        data-student-id="${escapeHtml(
                                                            studentId
                                                        )}"
                                                        data-student-name="${escapeHtml(
                                                            student.student_name
                                                        )}"
                                                        data-registration-number="${escapeHtml(
                                                            student.registration_number
                                                        )}"
                                                        data-date="${escapeHtml(
                                                            date
                                                        )}"
                                                    >

                                                        <option value="">
                                                            —
                                                        </option>

                                                        <option
                                                            value="Present"
                                                            ${
                                                                savedStatus ===
                                                                "Present"
                                                                    ? "selected"
                                                                    : ""
                                                            }
                                                        >
                                                            Present
                                                        </option>

                                                        <option
                                                            value="Absent"
                                                            ${
                                                                savedStatus ===
                                                                "Absent"
                                                                    ? "selected"
                                                                    : ""
                                                            }
                                                        >
                                                            Absent
                                                        </option>

                                                        <option
                                                            value="Late"
                                                            ${
                                                                savedStatus ===
                                                                "Late"
                                                                    ? "selected"
                                                                    : ""
                                                            }
                                                        >
                                                            Late
                                                        </option>

                                                        <option
                                                            value="Excused"
                                                            ${
                                                                savedStatus ===
                                                                "Excused"
                                                                    ? "selected"
                                                                    : ""
                                                            }
                                                        >
                                                            Excused
                                                        </option>

                                                    </select>

                                                </td>
                                            `;

                                        }
                                    )
                                    .join("")}

                            </tr>
                        `;

                    }
                )
                .join("");

    }


    if (loadAttendanceButton) {

        loadAttendanceButton.addEventListener(
            "click",
            loadWeeklyAttendance
        );

    }


    if (attendanceWeek) {

        attendanceWeek.addEventListener(
            "change",
            loadWeeklyAttendance
        );

    }


    if (saveAttendanceButton) {

        saveAttendanceButton.addEventListener(
            "click",
            async function () {

                const selects =
                    document.querySelectorAll(
                        ".attendance-status"
                    );


                if (!selects.length) {

                    alert(
                        "Please load the attendance students first."
                    );

                    return;
                }


                const records =
                    [];


                selects.forEach(
                    function (select) {

                        const status =
                            select.value;


                        if (!status) {
                            return;
                        }


                        records.push({

                            studentId:
                                select.dataset.studentId,

                            studentName:
                                select.dataset.studentName,

                            registrationNumber:
                                select.dataset.registrationNumber,

                            studentClass:
                                teacherClass,

                            teacherId:
                                teacherId || null,

                            teacherName:
                                teacherName,

                            attendanceDate:
                                select.dataset.date,

                            status:
                                status

                        });

                    }
                );


                if (!records.length) {

                    alert(
                        "Please enter at least one attendance status."
                    );

                    return;
                }


                const originalText =
                    saveAttendanceButton.textContent;


                saveAttendanceButton.disabled =
                    true;


                saveAttendanceButton.textContent =
                    "Saving Attendance...";


                try {

                    const response =
                        await fetch(
                            `${API_URL}/api/attendance`,
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        records:
                                            records
                                    })
                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            result.error ||
                            result.message ||
                            "Unable to save attendance."
                        );

                    }


                    alert(
                        "Weekly attendance saved successfully!"
                    );


                    await loadWeeklyAttendance();


                    await loadAttendanceStats();

                } catch (error) {

                    console.error(
                        "Save attendance error:",
                        error
                    );


                    alert(
                        error.message ||
                        "Unable to save attendance."
                    );

                } finally {

                    saveAttendanceButton.disabled =
                        false;

                    saveAttendanceButton.textContent =
                        originalText;

                }

            }
        );

    }


    async function loadAttendanceStats() {

        try {

            const weekStart =
                attendanceWeek?.value;


            if (!weekStart) {
                return;
            }


            const params =
                new URLSearchParams();


            if (teacherClass) {

                params.set(
                    "studentClass",
                    teacherClass
                );

            }


            params.set(
                "weekStart",
                weekStart
            );


            const response =
                await fetch(
                    `${API_URL}/api/attendance?${params.toString()}`
                );


            if (!response.ok) {
                return;
            }


            const data =
                await response.json();


            const records =
                data.attendance ||
                data.records ||
                [];


            let present =
                0;

            let absent =
                0;

            let late =
                0;


            records.forEach(
                function (record) {

                    const status =
                        String(
                            record.status ||
                            ""
                        ).toLowerCase();


                    if (
                        status ===
                        "present"
                    ) {
                        present++;
                    }


                    if (
                        status ===
                        "absent"
                    ) {
                        absent++;
                    }


                    if (
                        status ===
                        "late"
                    ) {
                        late++;
                    }

                }
            );


            const presentElement =
                document.getElementById(
                    "totalPresent"
                );


            const absentElement =
                document.getElementById(
                    "totalAbsent"
                );


            const lateElement =
                document.getElementById(
                    "totalLate"
                );


            if (presentElement) {
                presentElement.textContent =
                    present;
            }


            if (absentElement) {
                absentElement.textContent =
                    absent;
            }


            if (lateElement) {
                lateElement.textContent =
                    late;
            }

        } catch (error) {

            console.error(
                "Attendance stats error:",
                error
            );

        }

    }


    /* =========================================================
       HELPERS
       ========================================================= */

    function formatDate(
        value
    ) {

        if (!value) {
            return "—";
        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(
                value
            );

        }


        return date.toLocaleDateString(
            "en-GB",
            {
                day:
                    "2-digit",
                month:
                    "short",
                year:
                    "numeric"
            }
        );

    }


    function formatResultDate(
        value
    ) {

        if (!value) {
            return "—";
        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(
                value
            );

        }


        return date.toLocaleDateString(
            "en-GB",
            {
                day:
                    "2-digit",
                month:
                    "short",
                year:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit"
            }
        );

    }


    function escapeHtml(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(
            value
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =========================================================
       INITIAL LOAD
       ========================================================= */

    setDefaultAttendanceWeek();


    loadStudents();


    fetchTeacherResultCount();


    loadAttendanceStats();

});