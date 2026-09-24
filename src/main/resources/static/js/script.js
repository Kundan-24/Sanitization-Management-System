console.log("Script loaded");

// ===================== THEME =========================
let currentTheme = getTheme();
document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initMobileNavbar();
    initAdminSidebar();
});

// Initialize Theme
function initTheme() {
    applyTheme(currentTheme);
    const themeButton = document.getElementById("theme_change_button")
    if (!themeButton) {
        return;
    }
    if (themeButton.dataset.themeInitialized === "true") {
        return;
    }
    themeButton.dataset.themeInitialized = "true";
    themeButton.addEventListener("click", function () {
        currentTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(currentTheme);
        console.log("change theme button clicked");
    });
}

// Save Theme
function setTheme(theme) {
    localStorage.setItem("theme", theme);
}

// Get Theme
function getTheme() {
    return localStorage.getItem("theme") || "light";
}

// Apply Theme
function applyTheme(theme) {
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    html.classList.add(theme);
    setTheme(theme);
    const themeButtonText = document.querySelector("#theme_change_button span");
    if (themeButtonText) {
        themeButtonText.textContent = theme === "light" ? "Dark" : "Light";
    }
}

// ================= MOBILE NAVBAR =====================
function initMobileNavbar() {
    const menuButton = document.getElementById("navbar-menu-button");
    const mobileMenu = document.getElementById("navbar-mobile-menu");
    const menuIcon = document.getElementById("navbar-menu-icon");

    if (!menuButton || !mobileMenu || !menuIcon) {
        return;
    }

    if (menuButton.dataset.menuInitialized === "true") {
        return;
    }

    menuButton.dataset.menuInitialized = "true";

    // Open / Close Mobile Menu
    menuButton.addEventListener("click", function () {
        const isHidden = mobileMenu.classList.contains("hidden");

        if (isHidden) {
            mobileMenu.classList.remove("hidden");
            menuIcon.classList.remove("fa-bars");
            menuIcon.classList.add("fa-xmark");
            menuButton.setAttribute("aria-expanded", "true");
        } else {
            closeMobileNavbar();
        }
    });

    // Mobile menu links click
    const mobileLinks = mobileMenu.querySelectorAll("a");
    mobileLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            closeMobileNavbar();
        });
    });
}

// Close Mobile Navbar
function closeMobileNavbar() {
    const menuButton = document.getElementById("navbar-menu-button");
    const mobileMenu = document.getElementById("navbar-mobile-menu");
    const menuIcon = document.getElementById("navbar-menu-icon");

    if (!menuButton || !mobileMenu || !menuIcon) {
        return;
    }

    mobileMenu.classList.add("hidden");
    menuIcon.classList.remove("fa-xmark");
    menuIcon.classList.add("fa-bars");
    menuButton.setAttribute("aria-expanded", "false");
}

// ================= ADMIN SIDEBAR =====================
function initAdminSidebar() {
    const menuButton = document.getElementById("admin-menu-button");
    const sidebar = document.getElementById("admin-sidebar");
    const overlay = document.getElementById("admin-overlay");

    if (!menuButton || !sidebar || !overlay) {
        return;
    }

    if (menuButton.dataset.sidebarInitialized === "true") {
        return;
    }
    menuButton.dataset.sidebarInitialized = "true";

    // Mobile sidebar open / close
    menuButton.addEventListener("click", function () {
        const isClosed = sidebar.classList.contains("-translate-x-full");
        if (isClosed) {
            openAdminSidebar();
        } else {
            closeAdminSidebar();
        }
    });

    // Overlay click
    overlay.addEventListener("click", function () {
        closeAdminSidebar();
    });


    // Sidebar links click Mobile par menu automatically close
    const sidebarLinks = sidebar.querySelectorAll("a");
    sidebarLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            if (window.innerWidth < 1024) {
                closeAdminSidebar();
            }
        });
    });

    // Escape key
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeAdminSidebar();
        }
    });

    // Desktop resize
    window.addEventListener("resize", function () {
        if (window.innerWidth >= 1024) {
            sidebar.classList.remove("-translate-x-full");
            overlay.classList.add("hidden");
        } else {
            sidebar.classList.add("-translate-x-full");
            overlay.classList.add("hidden");
        }
    });
}


// Open Admin Sidebar
function openAdminSidebar() {
    const sidebar = document.getElementById("admin-sidebar");
    const overlay = document.getElementById("admin-overlay");

    if (!sidebar || !overlay) {
        return;
    }
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
}

// Close Admin Sidebar
function closeAdminSidebar() {
    const sidebar = document.getElementById("admin-sidebar");
    const overlay = document.getElementById("admin-overlay");

    if (!sidebar || !overlay) {
        return;
    }
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
}
