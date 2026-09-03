const API_URL = "http://localhost:5000";

const announcementForm =
    document.getElementById("announcementForm");

const announcementList =
    document.getElementById("announcementList");


// ========================================
// LOAD ANNOUNCEMENTS
// ========================================

async function loadAnnouncements() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/announcements`
            );

        const data =
            await response.json();


        if (!response.ok || !data.success) {

            announcementList.innerHTML =
                "<p>Unable to load announcements.</p>";

            return;
        }


        if (
            !data.announcements ||
            data.announcements.length === 0
        ) {

            announcementList.innerHTML =
                "<p>No announcements have been published yet.</p>";

            return;
        }


        announcementList.innerHTML = "";


        data.announcements.forEach(
            announcement => {

                const article =
                    document.createElement("article");

                article.className =
                    "dashboard-card";


                let imageHTML = "";


                if (announcement.image_url) {

                    imageHTML = `

                        <img
                            src="${announcement.image_url}"
                            alt="${escapeHTML(
                                announcement.title
                            )}"
                            style="
                                width:100%;
                                max-width:600px;
                                height:auto;
                                border-radius:10px;
                                margin-bottom:15px;
                                display:block;
                            "
                        >

                    `;

                }


                article.innerHTML = `

                    ${imageHTML}

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

                    <small>
                        Published:
                        ${new Date(
                            announcement.created_at
                        ).toLocaleString()}
                    </small>

                    <br><br>

                    <button
                        class="btn"
                        onclick="deleteAnnouncement(
                            ${announcement.id}
                        )"
                    >
                        Delete
                    </button>

                `;


                announcementList.appendChild(
                    article
                );

            }
        );


    } catch (error) {

        console.error(
            "Loading announcements error:",
            error
        );

        announcementList.innerHTML =
            "<p>Could not connect to the backend.</p>";

    }

}


// ========================================
// CREATE ANNOUNCEMENT
// ========================================

announcementForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const title =
            document
                .getElementById(
                    "announcement-title"
                )
                .value
                .trim();


        const content =
            document
                .getElementById(
                    "announcement-content"
                )
                .value
                .trim();


        const imageInput =
            document.getElementById(
                "announcement-image"
            );


        if (!title || !content) {

            alert(
                "Please enter the announcement title and content."
            );

            return;
        }


        // ====================================
        // READ IMAGE
        // ====================================

        let imageUrl = null;


        if (
            imageInput.files &&
            imageInput.files.length > 0
        ) {

            const imageFile =
                imageInput.files[0];


            // Limit image size to 5MB

            if (
                imageFile.size >
                5 * 1024 * 1024
            ) {

                alert(
                    "Please choose an image smaller than 5MB."
                );

                return;
            }


            imageUrl =
                await readFileAsDataURL(
                    imageFile
                );

        }


        const button =
            document.getElementById(
                "publishAnnouncementBtn"
            );


        button.disabled = true;

        button.textContent =
            "Publishing...";


        try {

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

                            imageUrl: imageUrl

                        })

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
                    "Unable to publish announcement."
                );

                return;
            }


            alert(
                "Announcement published successfully!"
            );


            announcementForm.reset();


            await loadAnnouncements();


        } catch (error) {

            console.error(
                "Publishing error:",
                error
            );

            alert(
                "Could not connect to the backend."
            );

        } finally {

            button.disabled = false;

            button.textContent =
                "Publish Announcement";

        }

    }
);


// ========================================
// READ FILE
// ========================================

function readFileAsDataURL(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                () => resolve(
                    reader.result
                );


            reader.onerror =
                () => reject(
                    new Error(
                        "Unable to read image."
                    )
                );


            reader.readAsDataURL(file);

        }
    );

}


// ========================================
// DELETE ANNOUNCEMENT
// ========================================

async function deleteAnnouncement(id) {

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
            "Announcement deleted successfully."
        );


        loadAnnouncements();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Could not connect to the backend."
        );

    }

}


// ========================================
// SECURITY
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value || "";

    return div.innerHTML;

}


// ========================================
// INITIAL LOAD
// ========================================

loadAnnouncements();