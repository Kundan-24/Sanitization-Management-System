document.addEventListener("DOMContentLoaded", () => {
    // ELEMENTS
    const totalRequests = document.getElementById("totalRequests");
    const pendingRequests = document.getElementById("pendingRequests");
    const completedRequests = document.getElementById("completedRequests");
    const cancelledRequests = document.getElementById("cancelledRequests");
    const refreshDashboardBtn = document.getElementById("refreshDashboardBtn");
    const dashboardLoading = document.getElementById("dashboardLoading");
    const dashboardEmpty = document.getElementById("dashboardEmpty");
    const recentRequestsContainer = document.getElementById("recentRequestsContainer");
    const recentRequestsBody = document.getElementById("recentRequestsBody");
    const recentRequestCount = document.getElementById("recentRequestCount");

    // LOAD DASHBOARD
    async function loadDashboard() {
        showLoading();
        try {
            const response = await fetch("/api/service-requests", {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }, cache: "no-cache"
                }
            );

            if (!response.ok) {
                throw new Error(`Unable to load requests. HTTP ${response.status}`);
            }

            const requests = await response.json();
            const data = Array.isArray(requests) ? requests : [];
            updateStats(data);
            renderRecentRequests(data);
        } catch (error) {
            console.error("Dashboard loading error:", error);
            hideLoading();
            recentRequestsContainer?.classList.add("hidden");
            dashboardEmpty?.classList.remove("hidden");

            if (recentRequestCount) {
                recentRequestCount.textContent = "Unable to load requests.";
            }

            showError("Dashboard Loading Failed", error.message || "Unable to load dashboard data.");
        }
    }

    // UPDATE STATS
    function updateStats(requests) {
        const total = requests.length;
        const pending = requests.filter(request => request.status === "PENDING").length;
        const completed = requests.filter(request => request.status === "COMPLETED").length;
        const cancelled = requests.filter(request => request.status === "CANCELLED").length;

        if (totalRequests) {
            totalRequests.textContent = total;
        }

        if (pendingRequests) {
            pendingRequests.textContent = pending;
        }

        if (completedRequests) {
            completedRequests.textContent = completed;
        }

        if (cancelledRequests) {
            cancelledRequests.textContent = cancelled;
        }
    }

    // RECENT REQUESTS
    function renderRecentRequests(requests) {
        hideLoading();
        if (!recentRequestsBody) {
            return;
        }
        recentRequestsBody.innerHTML = "";
        if (requests.length === 0) {
            recentRequestsContainer?.classList.add("hidden");
            dashboardEmpty?.classList.remove("hidden");
            if (recentRequestCount) {
                recentRequestCount.textContent =
                    "0 requests";
            }
            return;
        }

        dashboardEmpty?.classList.add("hidden");
        recentRequestsContainer?.classList.remove("hidden");

        // Latest 5 requests
        const recentRequests = [...requests]
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 5);

        if (recentRequestCount) {
            recentRequestCount.textContent = `${recentRequests.length} latest request${
                recentRequests.length !== 1 ? "s" : ""
                }`;
        }

        recentRequests.forEach(request => {
            const row = document.createElement("tr");
            row.className = "hover:bg-gray-50 dark:hover:bg-gray-700/50";
            const serviceName = request.serviceName || request.service?.name || "N/A";
            row.innerHTML = `
                <td class="px-5 py-4">
                    <span class="font-semibold text-blue-600 dark:text-blue-400">
                        ${escapeHtml(request.trackingId)}
                    </span>
                </td>

                <td class="px-5 py-4">
                    <span class="font-medium text-gray-900 dark:text-white">
                        ${escapeHtml(request.customerName)}
                    </span>
                </td>
                <td class="px-5 py-4 text-gray-700 dark:text-gray-300">${escapeHtml(serviceName)}</td>
                <td class="px-5 py-4 text-gray-700 dark:text-gray-300">${formatDate(request.preferredDate)}</td>
                <td class="px-5 py-4">${getStatusBadge(request.status)}</td>
            `;
            recentRequestsBody.appendChild(row);
        });
    }

    // STATUS BADGE
    function getStatusBadge(status) {
        const statusMap = {
            PENDING: {
                text: "Pending",
                classes: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            },

            CONFIRMED: {
                text: "Confirmed",
                classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            },

            IN_PROGRESS: {
                text: "In Progress",
                classes: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
            },

            COMPLETED: {
                text: "Completed",
                classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            },

            CANCELLED: {
                text: "Cancelled",
                classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }
        };

        const item = statusMap[status] || {
                text: status || "Unknown",
                classes: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            };

        return `
            <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${item.classes}">
                ${escapeHtml(item.text)}
            </span>
        `;
    }

    // DATE FORMAT
    function formatDate(value) {
        if (!value) {
            return "N/A";
        }
        const date = String(value).substring(0, 10);
        const parts = date.split("-");
        if (parts.length !== 3) {
            return escapeHtml(date);
        }
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // SECURITY
    function escapeHtml(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // LOADING
    function showLoading() {
        dashboardLoading?.classList.remove("hidden");
        dashboardEmpty?.classList.add("hidden");
        recentRequestsContainer?.classList.add("hidden");
        if (recentRequestCount) {
            recentRequestCount.textContent = "Loading...";
        }
    }

    function hideLoading() {
        dashboardLoading?.classList.add("hidden");
    }

    // ALERT
    function showError(title, text) {
        if (window.Swal) {
            Swal.fire({
                icon: "error",
                title: title,
                text: text
            });
        } else {
            alert(`${title}\n\n${text}`);
        }
    }


    // EVENTS
    refreshDashboardBtn?.addEventListener("click", loadDashboard);
    // INITIAL LOAD
    loadDashboard();
});