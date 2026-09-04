// ==================================================
// ANNOUNCEMENTS SYSTEM
// Lagos State Model College Meiran
// ==================================================

const API_URL =
    "https://lagos-state-model-college-backend.onrender.com";


// ==================================================
// GET ELEMENTS
// ==================================================

const announcementForm =
    document.getElementById("announcementForm");

const announcementsContainer =
    document.getElementById("announcementsContainer");


// ==================================================
// LOAD ANNOUNCEMENTS
// ==================================================

async function loadAnnouncements() {

    if (!announcementsContainer) {
        return;
    }

    announcementsContainer.innerHTML = `
        <p>Loading announcements...</p>
    `;

    try {

        const response = await fetch(
            `${API_URL}/api/admin/announcements`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            announcementsContainer.innerHTML = `
                <p>
                    Unable to load announcements.
                </p>
            `;

            return;
        }

        displayAnnouncements(
            data.announcements || []
        );

    } catch (error) {

        console.error(
            "Load announcements error:",
            error
        );

        announcementsContainer.innerHTML = `
            <p>
                Unable to connect to the school server.
            </p>
        `;
    }
}


// ==================================================
// DISPLAY ANNOUNCEMENTS
// ==================================================

function displayAnnouncements(
    announcements
) {

    if (!announcementsContainer) {
        return;
    }

    if (!announcements.length) {

        announcementsContainer.innerHTML = `
            <p>
                No announcements available.
            </p>
        `;

        return;
    }


    announcementsContainer.innerHTML =
        announcements.map(
            announcement => {

                const image =
                    announcement.image_url ||
                    announcement.imageUrl;

                const date =
                    announcement.created_at
                        ? new Date(
                            announcement.created_at
                        ).toLocaleDateString()
                        : "";


                return `
                    <div
                        class="announcement-card"
                        data-id="${announcement.id}"
                    >

                        ${
                            image
                                ? `
                                    <img
                                        src="${escapeHTML(image)}"
                                        alt="${escapeHTML(
                                            announcement.title
                                        )}"
                                        class="announcement-image"
                                    >
                                `
                                : ""
                        }

                        <div class="announcement-content">

                            <h3>
                                ${escapeHTML(
                                    announcement.title
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    announcement.content
                                )}
                            </p>

                            ${
                                date
                                    ? `
                                        <small>
                                            Published:
                                            ${date}
                                        </small>
                                    `
                                    : ""
                            }

                            <div
                                class="announcement-actions"
                            >

                                <button
                                    type="button"
                                    onclick="deleteAnnouncement('${announcement.id}')"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>
                `;
            }
        ).join("");
}


// ==================================================
// CREATE ANNOUNCEMENT
// ==================================================

if (announcementForm) {

    announcementForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const titleInput =
                document.getElementById(
                    "announcement-title"
                );

            const contentInput =
                document.getElementById(
                    "announcement-content"
                );

            const imageInput =
                document.getElementById(
                    "announcement-image"
                );


            const title =
                titleInput
                    ? titleInput.value.trim()
                    : "";

            const content =
                contentInput
                    ? contentInput.value.trim()
                    : "";

            const imageUrl =
                imageInput
                    ? imageInput.value.trim()
                    : "";


            // ==============================
            // VALIDATION
            // ==============================

            if (!title || !content) {

                alert(
                    "Please enter the announcement title and content."
                );

                return;
            }


            const submitButton =
                announcementForm.querySelector(
                    "button[type='submit']"
                );


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Publishing...";
            }


            try {

                // ==============================
                // SEND TO RENDER BACKEND
                // ==============================

                const response =
                    await fetch(
                        `${API_URL}/api/announcements`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                title: title,
                                content: content,
                                imageUrl:
                                    imageUrl || null
                            })
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
                        "Unable to publish announcement."
                    );

                    return;
                }


                // ==============================
                // SUCCESS
                // ==============================

                alert(
                    "Announcement published successfully!"
                );


                announcementForm.reset();


                // Reload announcements

                await loadAnnouncements();

            } catch (error) {

                console.error(
                    "Create announcement error:",
                    error
                );

                alert(
                    "Unable to connect to the school server."
                );

            } finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "Publish Announcement";
                }
            }
        }
    );
}


// ==================================================
// DELETE ANNOUNCEMENT
// ==================================================

async function deleteAnnouncement(id) {

    if (!id) {
        return;
    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this announcement?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/announcements/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.message ||
                "Unable to delete announcement."
            );

            return;
        }


        alert(
            "Announcement deleted successfully!"
        );


        await loadAnnouncements();

    } catch (error) {

        console.error(
            "Delete announcement error:",
            error
        );

        alert(
            "Unable to connect to the school server."
        );
    }
}


// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==================================================
// LOAD WHEN PAGE OPENS
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadAnnouncements();

    }
);