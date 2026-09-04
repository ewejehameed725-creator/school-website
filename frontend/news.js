const API_URL =
    "https://lagos-state-model-college-backend.onrender.com";

const newsContainer =
    document.getElementById("newsContainer");


// ========================================
// LOAD PUBLIC NEWS
// ========================================

async function loadNews() {

    if (!newsContainer) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/api/announcements`
            );

        const data =
            await response.json();


        if (!response.ok || !data.success) {

            showNewsMessage(
                "Unable to load announcements."
            );

            return;
        }


        if (
            !data.announcements ||
            data.announcements.length === 0
        ) {

            showNewsMessage(
                "There are no announcements available at the moment."
            );

            return;
        }


        newsContainer.innerHTML = "";


        data.announcements.forEach(
            announcement => {

                const article =
                    document.createElement("article");

                article.className =
                    "news-card";


                // ==========================
                // DATE
                // ==========================

                const date =
                    new Date(
                        announcement.created_at
                    );


                const day =
                    date.toLocaleDateString(
                        "en-US",
                        {
                            day: "2-digit"
                        }
                    );


                const month =
                    date.toLocaleDateString(
                        "en-US",
                        {
                            month: "short"
                        }
                    ).toUpperCase();


                // ==========================
                // IMAGE
                // ==========================

                let imageHTML = "";


                if (
                    announcement.image_url &&
                    announcement.image_url.trim() !== ""
                ) {

                    imageHTML = `

                        <div class="news-image">

                            <img
                                src="${escapeHTML(
                                    announcement.image_url
                                )}"
                                alt="${escapeHTML(
                                    announcement.title
                                )}"
                                loading="lazy"
                            >

                        </div>

                    `;
                }


                // ==========================
                // NEWS CARD
                // ==========================

                article.innerHTML = `

                    ${imageHTML}

                    <div class="news-date">

                        <span>
                            ${day}
                        </span>

                        <small>
                            ${month}
                        </small>

                    </div>


                    <div class="news-content">

                        <span class="news-category">
                            Announcement
                        </span>

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

                    </div>

                `;


                newsContainer.appendChild(
                    article
                );

            }
        );


    } catch (error) {

        console.error(
            "News loading error:",
            error
        );

        showNewsMessage(
            "Unable to connect to the school server."
        );

    }

}


// ========================================
// SHOW MESSAGE
// ========================================

function showNewsMessage(message) {

    if (!newsContainer) {
        return;
    }


    newsContainer.innerHTML = `

        <div class="news-empty">

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

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
// START
// ========================================

loadNews();