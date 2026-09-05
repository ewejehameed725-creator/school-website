// =====================================================
// TEACHER DASHBOARD
// Lagos State Model College Meiran
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
        localStorage.getItem("teacherName") ||
        "Class Teacher";

    const teacherClass =
        localStorage.getItem("teacherClass") ||
        "";

    const teacherId =
        localStorage.getItem("teacherId") ||
        "";


    // =====================================================
    // DISPLAY TEACHER INFORMATION
    // =====================================================

    const teacherDisplayName =
        document.getElementById("teacherDisplayName");

    if (teacherDisplayName) {
        teacherDisplayName.textContent =
            teacherName;
    }


    const profileTeacherName =
        document.getElementById("profileTeacherName");

    if (profileTeacherName) {
        profileTeacherName.textContent =
            teacherName;
    }


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

    if (menuButton && sidebar && overlay) {

        menuButton.addEventListener(
            "click",
            function () {

                sidebar.classList.add("open");

                overlay.classList.add("active");

            }
        );


        overlay.addEventListener(
            "click",
            function () {

                sidebar.classList.remove("open");

                overlay.classList.remove("active");

            }
        );

    }


    // =====================================================
    // SHOW SECTION
    // =====================================================

    function showSection(target) {

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


        if (sidebar) {

            sidebar.classList.remove("open");

        }


        if (overlay) {

            overlay.classList.remove("active");

        }


        // Load required information

        if (target === "studentManagement") {

            loadStudents();

        }


        if (target === "attendance") {

            setDefaultAttendanceWeek();

            loadWeeklyAttendance();

        }

    }


    // =====================================================
    // NAVIGATION
    // =====================================================

    navLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function (event) {

                const target =
                    link.getAttribute("data-section");


                // Normal page link
                if (!target) {

                    return;

                }


                event.preventDefault();

                showSection(target);

            }
        );

    });


    // =====================================================
    // QUICK ACTIONS
    // =====================================================

    const quickButtons =
        document.querySelectorAll(
            ".teacher-quick-actions [data-section]"
        );


    quickButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const target =
                    button.getAttribute("data-section");


                if (target) {

                    showSection(target);

                }

            }
        );

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

                if (studentForm) {

                    studentForm.reset();

                }


                const studentId =
                    document.getElementById("studentId");

                if (studentId) {

                    studentId.value = "";

                }


                const classInput =
                    document.getElementById("studentClass");

                if (classInput) {

                    classInput.value =
                        teacherClass;

                }


                if (studentFormContainer) {

                    studentFormContainer.style.display =
                        "block";

                    studentFormContainer.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    }


    // =====================================================
    // CANCEL STUDENT FORM
    // =====================================================

    if (cancelStudentButton) {

        cancelStudentButton.addEventListener(
            "click",
            function () {

                if (studentForm) {

                    studentForm.reset();

                }


                const studentId =
                    document.getElementById("studentId");

                if (studentId) {

                    studentId.value = "";

                }


                if (studentFormContainer) {

                    studentFormContainer.style.display =
                        "none";

                }

            }
        );

    }


    // =====================================================
    // LOAD STUDENTS
    // =====================================================

    async function loadStudents() {

        if (!studentTableBody) {

            return;

        }


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
                    data.error ||
                    data.message ||
                    "Failed to load students."
                );

            }


            const students =
                Array.isArray(data)
                    ? data
                    : data.students || [];


            displayStudents(students);

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

        if (
            !students ||
            students.length === 0
        ) {

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


        updateStudentCount(
            students.length
        );


        studentTableBody.innerHTML = "";


        students.forEach(
            function (student, index) {

                const row =
                    document.createElement("tr");


                const studentId =
                    String(student.id || "");


                row.innerHTML = `

                    <td>
                        ${escapeHTML(
                            student.serial_number ||
                            index + 1
                        )}
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
                            data-action="edit"
                            data-id="${escapeHTML(studentId)}"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="btn"
                            data-action="delete"
                            data-id="${escapeHTML(studentId)}"
                        >
                            Delete
                        </button>

                    </td>

                `;


                const editButton =
                    row.querySelector(
                        '[data-action="edit"]'
                    );


                const deleteButton =
                    row.querySelector(
                        '[data-action="delete"]'
                    );


                if (editButton) {

                    editButton.addEventListener(
                        "click",
                        function () {

                            editStudent(studentId);

                        }
                    );

                }


                if (deleteButton) {

                    deleteButton.addEventListener(
                        "click",
                        function () {

                            deleteStudent(studentId);

                        }
                    );

                }


                studentTableBody.appendChild(row);

            }
        );

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
                    ).value.trim();


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
                        ).value ||
                        null,


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
                        ).value ||
                        null,


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


                if (saveButton) {

                    saveButton.disabled = true;

                    saveButton.textContent =
                        "Saving...";

                }


                try {

                    let response;


                    if (studentId) {

                        response =
                            await fetch(
                                `${API_URL}/api/students/${encodeURIComponent(studentId)}`,
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
                            result.message ||
                            "Unable to save student."
                        );

                    }


                    alert(
                        studentId
                            ? "Student updated successfully!"
                            : "Student added successfully!"
                    );


                    studentForm.reset();


                    document.getElementById(
                        "studentId"
                    ).value = "";


                    document.getElementById(
                        "studentClass"
                    ).value =
                        teacherClass;


                    if (studentFormContainer) {

                        studentFormContainer.style.display =
                            "none";

                    }


                    await loadStudents();


                    // Refresh attendance if it is already open
                    await loadWeeklyAttendance();

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

                    if (saveButton) {

                        saveButton.disabled = false;

                        saveButton.textContent =
                            "Save Student";

                    }

                }

            }
        );

    }


    // =====================================================
    // EDIT STUDENT
    // =====================================================

    async function editStudent(id) {

        try {

            const response =
                await fetch(
                    `${API_URL}/api/students?studentClass=${encodeURIComponent(teacherClass)}`
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "Unable to load students."
                );

            }


            const students =
                Array.isArray(data)
                    ? data
                    : data.students || [];


            // UUID-safe comparison
            const student =
                students.find(
                    item =>
                        String(item.id) ===
                        String(id)
                );


            if (!student) {

                alert(
                    "Student could not be found."
                );

                return;

            }


            document.getElementById(
                "studentId"
            ).value =
                student.id || "";


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
                    ? String(
                        student.date_of_birth
                    ).substring(0, 10)
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


            if (studentFormContainer) {

                studentFormContainer.style.display =
                    "block";


                studentFormContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }

        catch (error) {

            console.error(
                "Edit student error:",
                error
            );


            alert(
                error.message ||
                "Unable to load student information."
            );

        }

    }


    // =====================================================
    // DELETE STUDENT
    // =====================================================

    async function deleteStudent(id) {

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
                    `${API_URL}/api/students/${encodeURIComponent(id)}`,
                    {
                        method: "DELETE"
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.error ||
                    result.message ||
                    "Unable to delete student."
                );

            }


            alert(
                "Student deleted successfully."
            );


            await loadStudents();

            await loadWeeklyAttendance();

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

    }


    // =====================================================
    // MAKE FUNCTIONS AVAILABLE IF NEEDED
    // =====================================================

    window.editStudent =
        editStudent;

    window.deleteStudent =
        deleteStudent;


    // =====================================================
    // STUDENT COUNT
    // =====================================================

    function updateStudentCount(count) {

        const totalStudents =
            document.getElementById(
                "totalStudents"
            );


        const attendanceStudentCount =
            document.getElementById(
                "attendanceStudentCount"
            );


        if (totalStudents) {

            totalStudents.textContent =
                count;

        }


        if (attendanceStudentCount) {

            attendanceStudentCount.textContent =
                count;

        }

    }


    // =====================================================
    // ATTENDANCE ELEMENTS
    // =====================================================

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


    // =====================================================
    // ATTENDANCE DAYS
    // =====================================================

    const attendanceDays = [
        {
            name: "Monday",
            offset: 0
        },
        {
            name: "Tuesday",
            offset: 1
        },
        {
            name: "Wednesday",
            offset: 2
        },
        {
            name: "Thursday",
            offset: 3
        },
        {
            name: "Friday",
            offset: 4
        }
    ];


    // =====================================================
    // DEFAULT ATTENDANCE WEEK
    // =====================================================

    function setDefaultAttendanceWeek() {

        if (!attendanceWeek) {

            return;

        }


        if (attendanceWeek.value) {

            return;

        }


        const today =
            new Date();


        const day =
            today.getDay();


        // Sunday = 0
        // Monday = 1

        const difference =
            day === 0
                ? -6
                : 1 - day;


        const monday =
            new Date(today);


        monday.setDate(
            today.getDate() +
            difference
        );


        attendanceWeek.value =
            toInputDate(monday);

    }


    // =====================================================
    // GET MONDAY FROM SELECTED DATE
    // =====================================================

    function getMonday(dateString) {

        const date =
            parseInputDate(dateString);


        if (!date) {

            return null;

        }


        const day =
            date.getDay();


        const difference =
            day === 0
                ? -6
                : 1 - day;


        date.setDate(
            date.getDate() +
            difference
        );


        return date;

    }


    // =====================================================
    // LOAD WEEKLY ATTENDANCE
    // =====================================================

    async function loadWeeklyAttendance() {

        if (!attendanceTableBody) {

            return;

        }


        if (!teacherClass) {

            attendanceTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        No class has been assigned to this teacher.
                    </td>
                </tr>
            `;

            return;

        }


        setDefaultAttendanceWeek();


        const selectedDate =
            attendanceWeek
                ? attendanceWeek.value
                : "";


        if (!selectedDate) {

            attendanceTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        Select a week to load attendance.
                    </td>
                </tr>
            `;

            return;

        }


        const monday =
            getMonday(selectedDate);


        if (!monday) {

            return;

        }


        // Always make the selected week Monday

        const mondayString =
            toInputDate(monday);


        if (attendanceWeek) {

            attendanceWeek.value =
                mondayString;

        }


        updateAttendanceWeekLabel(
            monday
        );


        attendanceTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    Loading attendance...
                </td>
            </tr>
        `;


        try {

            // Load students and existing attendance
            // at the same time.

            const studentsRequest =
                fetch(
                    `${API_URL}/api/students?studentClass=${encodeURIComponent(teacherClass)}`
                );


            const attendanceRequest =
                fetch(
                    `${API_URL}/api/attendance?studentClass=${encodeURIComponent(teacherClass)}&weekStart=${encodeURIComponent(mondayString)}`
                );


            const [
                studentsResponse,
                attendanceResponse
            ] =
                await Promise.all([
                    studentsRequest,
                    attendanceRequest
                ]);


            const studentsData =
                await studentsResponse.json();


            const attendanceData =
                await attendanceResponse.json();


            if (!studentsResponse.ok) {

                throw new Error(
                    studentsData.error ||
                    studentsData.message ||
                    "Unable to load students."
                );

            }


            if (!attendanceResponse.ok) {

                throw new Error(
                    attendanceData.error ||
                    attendanceData.message ||
                    "Unable to load attendance."
                );

            }


            const students =
                Array.isArray(studentsData)
                    ? studentsData
                    : studentsData.students || [];


            const attendanceRecords =
                Array.isArray(attendanceData)
                    ? attendanceData
                    : attendanceData.attendance || [];


            updateStudentCount(
                students.length
            );


            displayWeeklyAttendance(
                students,
                attendanceRecords,
                monday
            );

        }

        catch (error) {

            console.error(
                "Load attendance error:",
                error
            );


            attendanceTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        Unable to load attendance.
                        Please try again.
                    </td>
                </tr>
            `;

        }

    }


    // =====================================================
    // DISPLAY WEEKLY ATTENDANCE
    // =====================================================

    function displayWeeklyAttendance(
        students,
        attendanceRecords,
        monday
    ) {

        if (
            !students ||
            students.length === 0
        ) {

            attendanceTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        No students have been added to ${escapeHTML(teacherClass)} yet.
                    </td>
                </tr>
            `;

            return;

        }


        attendanceTableBody.innerHTML = "";


        students.forEach(
            function (student, index) {

                const row =
                    document.createElement("tr");


                const studentId =
                    String(student.id || "");


                const existingRecords =
                    attendanceRecords.filter(
                        record =>
                            String(
                                record.student_id
                            ) === studentId
                    );


                let cells = "";


                attendanceDays.forEach(
                    function (day) {

                        const date =
                            new Date(monday);


                        date.setDate(
                            monday.getDate() +
                            day.offset
                        );


                        const dateString =
                            toInputDate(date);


                        const record =
                            existingRecords.find(
                                item =>
                                    String(
                                        item.attendance_date
                                    ).substring(0, 10) ===
                                    dateString
                            );


                        const status =
                            record
                                ? record.status
                                : "";


                        cells += `

                            <td>

                                <select
                                    class="attendance-status"
                                    data-student-id="${escapeHTML(studentId)}"
                                    data-student-name="${escapeHTML(student.student_name || "")}"
                                    data-registration-number="${escapeHTML(student.registration_number || "")}"
                                    data-date="${dateString}"
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option
                                        value="Present"
                                        ${status === "Present" ? "selected" : ""}
                                    >
                                        Present
                                    </option>

                                    <option
                                        value="Absent"
                                        ${status === "Absent" ? "selected" : ""}
                                    >
                                        Absent
                                    </option>

                                    <option
                                        value="Late"
                                        ${status === "Late" ? "selected" : ""}
                                    >
                                        Late
                                    </option>

                                    <option
                                        value="Excused"
                                        ${status === "Excused" ? "selected" : ""}
                                    >
                                        Excused
                                    </option>

                                </select>

                            </td>

                        `;

                    }
                );


                row.innerHTML = `

                    <td>
                        ${escapeHTML(
                            student.serial_number ||
                            index + 1
                        )}
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


                    ${cells}

                `;


                attendanceTableBody.appendChild(
                    row
                );

            }
        );

    }


    // =====================================================
    // LOAD ATTENDANCE BUTTON
    // =====================================================

    if (loadAttendanceButton) {

        loadAttendanceButton.addEventListener(
            "click",
            function () {

                loadWeeklyAttendance();

            }
        );

    }


    // =====================================================
    // SAVE WEEKLY ATTENDANCE
    // =====================================================

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


                const records = [];


                selects.forEach(
                    function (select) {

                        const status =
                            select.value;


                        // Empty means teacher has not
                        // entered attendance for that day.

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


                if (records.length === 0) {

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
                                method: "POST",

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


                    // Reload from database so the teacher
                    // sees exactly what was saved.

                    await loadWeeklyAttendance();

                }

                catch (error) {

                    console.error(
                        "Save attendance error:",
                        error
                    );


                    alert(
                        error.message ||
                        "Unable to save attendance."
                    );

                }

                finally {

                    saveAttendanceButton.disabled =
                        false;


                    saveAttendanceButton.textContent =
                        originalText;

                }

            }
        );

    }


    // =====================================================
    // UPDATE ATTENDANCE WEEK LABEL
    // =====================================================

    function updateAttendanceWeekLabel(
        monday
    ) {

        const label =
            document.getElementById(
                "attendanceWeekLabel"
            );


        if (!label) {

            return;

        }


        const friday =
            new Date(monday);


        friday.setDate(
            monday.getDate() + 4
        );


        label.textContent =
            `${formatShortDate(monday)} - ${formatShortDate(friday)}`;

    }


    // =====================================================
    // FORMAT SHORT DATE
    // =====================================================

    function formatShortDate(date) {

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    // =====================================================
    // DATE TO YYYY-MM-DD
    // =====================================================

    function toInputDate(date) {

        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");


        const day =
            String(
                date.getDate()
            ).padStart(2, "0");


        return `${year}-${month}-${day}`;

    }


    // =====================================================
    // PARSE DATE WITHOUT TIMEZONE PROBLEMS
    // =====================================================

    function parseInputDate(value) {

        if (!value) {

            return null;

        }


        const parts =
            value.split("-");


        if (parts.length !== 3) {

            return null;

        }


        const year =
            Number(parts[0]);


        const month =
            Number(parts[1]) - 1;


        const day =
            Number(parts[2]);


        const date =
            new Date(
                year,
                month,
                day
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return null;

        }


        return date;

    }


    // =====================================================
    // FORMAT DATE
    // =====================================================

    function formatDate(date) {

        if (!date) {

            return "—";

        }


        const parts =
            String(date)
                .split("T")[0]
                .split("-");


        if (parts.length === 3) {

            return `${parts[2]}/${parts[1]}/${parts[0]}`;

        }


        return date;

    }


    // =====================================================
    // SECURITY: ESCAPE HTML
    // =====================================================

    function escapeHTML(value) {

        return String(value ?? "")
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


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    loadStudents();


    setDefaultAttendanceWeek();

});