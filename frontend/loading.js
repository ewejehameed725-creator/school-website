// ========================================
// SCHOOL WEBSITE LOADING SYSTEM
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    const loader = document.getElementById("pageLoader");

    if (!loader) {
        return;
    }

    // Show the loader when the page opens
    loader.classList.remove("hide");

    // Keep it visible for 2 seconds
    setTimeout(function () {

        loader.classList.add("hide");

    }, 2000);

});


// ========================================
// PAGE-TO-PAGE LOADING
// ========================================

document.addEventListener("click", function (event) {

    const link = event.target.closest("a");

    if (!link) {
        return;
    }

    const href = link.getAttribute("href");

    // Ignore links that don't open pages
    if (
        !href ||
        href === "#" ||
        href.startsWith("#") ||
        href.startsWith("javascript:")
    ) {
        return;
    }

    // Don't interfere with downloads
    if (link.hasAttribute("download")) {
        return;
    }

    // Don't interfere with links opening in a new tab
    if (link.target === "_blank") {
        return;
    }

    // Don't interfere with external websites
    if (
        link.hostname &&
        link.hostname !== window.location.hostname
    ) {
        return;
    }

    const loader =
        document.getElementById("pageLoader");

    if (!loader) {
        return;
    }

    event.preventDefault();

    // Show loading screen
    loader.classList.remove("hide");

    // Wait 2 seconds, then open the page
    setTimeout(function () {

        window.location.href = href;

    }, 2000);

});
// ========================================
// MOBILE SIDEBAR
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    const menuButton =
        document.getElementById("menuButton");

    const closeMenu =
        document.getElementById("closeMenu");

    const mobileSidebar =
        document.getElementById("mobileSidebar");

    const mobileOverlay =
        document.getElementById("mobileOverlay");


    if (
        !menuButton ||
        !closeMenu ||
        !mobileSidebar ||
        !mobileOverlay
    ) {
        return;
    }


    function openMenu() {

        mobileSidebar.classList.add("active");

        mobileOverlay.classList.add("active");

    }


    function closeMenuPanel() {

        mobileSidebar.classList.remove("active");

        mobileOverlay.classList.remove("active");

    }


    menuButton.addEventListener(
        "click",
        openMenu
    );


    closeMenu.addEventListener(
        "click",
        closeMenuPanel
    );


    mobileOverlay.addEventListener(
        "click",
        closeMenuPanel
    );


    // Close menu after selecting a page

    const mobileLinks =
        mobileSidebar.querySelectorAll("a");


    mobileLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            closeMenuPanel
        );

    });

});