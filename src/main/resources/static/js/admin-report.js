document.addEventListener("DOMContentLoaded", () => {
    // ELEMENTS
    const refreshRequestsBtn = document.getElementById("refreshRequestsBtn");
    const exportPdfBtn = document.getElementById("exportPdfBtn");
    const requestSearch = document.getElementById("requestSearch");
    const requestDate = document.getElementById("requestDate");
    const statusFilter = document.getElementById("statusFilter");
    const resetFilterBtn = document.getElementById("resetFilterBtn");
    const requestCountText = document.getElementById("requestCountText");
    const loadingState = document.getElementById("loadingState");
    const emptyState = document.getElementById("emptyState");
    const tableContainer = document.getElementById("tableContainer");
    const requestsTableBody = document.getElementById("requestsTableBody");

    // SUMMARY
    const totalRequests = document.getElementById("totalRequests");
    const pendingRequests = document.getElementById("pendingRequests");
    const progressRequests = document.getElementById("progressRequests");
    const completedRequests = document.getElementById("completedRequests");

    // MODAL
    const requestViewModal = document.getElementById("requestViewModal");
    const closeViewModal = document.getElementById("closeViewModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const updateStatusBtn = document.getElementById("updateStatusBtn");
    const modalTrackingId = document.getElementById("modalTrackingId");
    const modalCustomer = document.getElementById("modalCustomer");
    const modalPhone = document.getElementById("modalPhone");
    const modalEmail = document.getElementById("modalEmail");
    const modalAddress = document.getElementById("modalAddress");
    const modalService = document.getElementById("modalService");
    const modalServicePrice = document.getElementById("modalServicePrice");
    const modalDate = document.getElementById("modalDate");
    const modalTime = document.getElementById("modalTime");
    const modalMessage = document.getElementById("modalMessage");
    const modalStatus = document.getElementById("modalStatus");
    const modalRequestCreatedAt = document.getElementById("modalRequestCreatedAt");
    const modalPaymentStatus = document.getElementById("modalPaymentStatus");
    const modalPaymentAmount = document.getElementById("modalPaymentAmount");
    const modalCurrency = document.getElementById("modalCurrency");
    const modalOrderId = document.getElementById("modalOrderId");
    const modalPaymentId = document.getElementById("modalPaymentId");
    const modalPaymentCreatedAt = document.getElementById("modalPaymentCreatedAt");

    // DATA
    let currentRequests = [];
    let selectedRequest = null;
    let searchTimer = null;

    // LOAD REPORT
    async function loadReport() {
        showLoading();
        try {
            const params = buildFilterParams();
            const queryString = params.toString();
            const url = queryString ? `/api/admin/reports?${queryString}` : "/api/admin/reports";
            const response =
                await fetch(url, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    },
                    cache: "no-cache"
                });

            if (!response.ok) {
                throw new Error(`Unable to load report. HTTP ${response.status}`);
            }

            const data = await response.json();
            currentRequests = Array.isArray(data.records) ? data.records : [];
            updateSummary(data.summary || {});
            renderReport();
        } catch (error) {
            console.error("Report loading error:", error);
            hideLoading();
            tableContainer?.classList.add("hidden");
            emptyState?.classList.remove("hidden");
            if (requestCountText) {
                requestCountText.textContent = "Unable to load report.";
            }
            updateSummary({});
            showError(error.message || "Unable to load service requests.");
        }
    }

    // BUILD FILTER PARAMS
    function buildFilterParams() {
        const params = new URLSearchParams();
        const search = requestSearch?.value?.trim();
        const date = requestDate?.value;
        const status = statusFilter?.value;

        if (search) {
            params.append("search", search);
        }

        if (date) {
            params.append("date", date);
        }

        if (status) {
            params.append("status", status);
        }
        return params;
    }


    // LIVE SEARCH
    function liveSearch() {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {loadReport();}, 350);
    }

    // SUMMARY
    function updateSummary(summary) {
        if (totalRequests) {
            totalRequests.textContent = Number(summary.totalRequests || 0);
        }

        if (pendingRequests) {
            pendingRequests.textContent = Number(summary.pendingRequests || 0);
        }

        if (progressRequests) {
            progressRequests.textContent = Number(summary.inProgressRequests || 0);
        }

        if (completedRequests) {
            completedRequests.textContent = Number(summary.completedRequests || 0);
        }
    }

    // RENDER TABLE
    function renderReport() {
        if (!requestsTableBody) {
            return;
        }

        requestsTableBody.innerHTML = "";
        hideLoading();

        if (currentRequests.length === 0) {
            tableContainer?.classList.add("hidden");
            emptyState?.classList.remove("hidden");
            if (requestCountText) {
                requestCountText.textContent = "0 requests found.";
            }
            return;
        }

        tableContainer?.classList.remove("hidden");
        emptyState?.classList.add("hidden");

        if (requestCountText) {
            requestCountText.textContent = `${currentRequests.length} request${
                    currentRequests.length !== 1 ? "s" : ""
                } found`;
        }

        currentRequests.forEach((request, index) => {
                const row = document.createElement("tr");
                row.className = "hover:bg-gray-50 dark:hover:bg-gray-700/50";
                row.innerHTML = `
                    <td class="px-5 py-4 text-gray-500 dark:text-gray-400">${index + 1}</td>
                    <td class="px-5 py-4">
                        <span class="font-semibold text-blue-600 dark:text-blue-400">
                            ${escapeHtml(request.trackingId)}
                        </span>
                    </td>
                    <td class="px-5 py-4">
                        <div>
                            <p class="font-medium text-gray-900 dark:text-white">
                                ${escapeHtml(request.customerName)}
                            </p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                ${escapeHtml(request.phone)}
                            </p>
                        </div>
                    </td>
                    <td class="px-5 py-4">
                        <div>
                            <p class="font-medium text-gray-900 dark:text-white">
                                ${escapeHtml(request.serviceName || "N/A")}
                            </p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                ${formatCurrency(request.servicePrice, "INR")}
                            </p>
                        </div>
                    </td>
                    <td class="px-5 py-4 text-gray-700 dark:text-gray-300">
                        ${formatDate(request.preferredDate)}
                    </td>
                    <td class="px-5 py-4 text-gray-700 dark:text-gray-300">
                        ${formatTime(request.preferredTime)}
                    </td>
                    <td class="px-5 py-4">
                        ${getStatusBadge(request.requestStatus || request.status)}
                    </td>
                    <td class="px-5 py-4">
                        ${getPaymentBadge(request.paymentStatus)}
                    </td>
                    <td class="px-5 py-4 text-center">
                        <button type="button" data-index="${index}"
                            class="view-request-btn inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                                   bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition">
                            <i class="fa-solid fa-eye"></i>
                            View
                        </button>
                    </td>
                `;
                requestsTableBody.appendChild(row);
            }
        );
    }

    // REQUEST STATUS BADGE
    function getStatusBadge(status) {
        const statuses = {
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


        const item = statuses[status] || {
                text: status || "Unknown",
                classes: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            };

        return `
            <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${item.classes}">
                ${escapeHtml(item.text)}
            </span>
        `;
    }

    // PAYMENT BADGE
    function getPaymentBadge(status) {
        if (!status) {
            return `
                <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">N/A</span>
            `;
        }

        const statuses = {
            SUCCESS: {
                text: "Paid",
                classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            },

            CREATED: {
                text: "Created",
                classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            },

            PENDING: {
                text: "Pending",
                classes: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            },

            FAILED: {
                text: "Failed",
                classes: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            },

            REFUNDED: {
                text: "Refunded",
                classes: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
            }
        };

        const item = statuses[status] || {
                text: status,
                classes: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            };
        return `<span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${item.classes}"> ${escapeHtml(item.text)} </span> `;
    }

    // OPEN MODAL
    function openRequestModal(request) {
        if (!requestViewModal) {
            return;
        }

        selectedRequest = request;
        setText(modalTrackingId, request.trackingId);
        setText(modalCustomer, request.customerName);
        setText(modalPhone, request.phone);
        setText(modalEmail, request.email || "N/A");
        setText(modalAddress, request.address || "N/A");
        setText(modalService, request.serviceName || "N/A");
        setText(modalServicePrice, formatCurrency(request.servicePrice, request.currency || "INR"));
        setText(modalDate, formatDate(request.preferredDate));
        setText(modalTime, formatTime(request.preferredTime));
        setText(modalMessage, request.message || "No message");

        if (modalStatus) {
            modalStatus.value = request.requestStatus || request.status || "PENDING";
        }

        setText(modalRequestCreatedAt, formatDateTime(request.requestCreatedAt));
        setHtml(modalPaymentStatus, getPaymentBadge(request.paymentStatus));
        setText(modalPaymentAmount, formatCurrency(request.paymentAmount, request.currency || "INR"));
        setText(modalCurrency, request.currency || "N/A");
        setText(modalOrderId, request.razorpayOrderId || "N/A");
        setText(modalPaymentId, request.razorpayPaymentId || "N/A");
        setText(modalPaymentCreatedAt, formatDateTime(request.paymentCreatedAt));

        requestViewModal.classList.remove("hidden");
        requestViewModal.classList.add("flex");
        document.body.classList.add("overflow-hidden");
    }

    // CLOSE MODAL
    function closeModal() {
        if (!requestViewModal) {
            return;
        }

        requestViewModal.classList.add("hidden");
        requestViewModal.classList.remove("flex");
        document.body.classList.remove("overflow-hidden");
        selectedRequest = null;
    }

    // UPDATE STATUS
    async function updateRequestStatus() {
        if (!selectedRequest) {
            return;
        }

        const newStatus = modalStatus?.value;

        if (!newStatus) {
            return;
        }

        const requestId = selectedRequest.id;

        if (!requestId) {
            showError("Request ID is missing.");
            return;
        }

        try {
            if (updateStatusBtn) {
                updateStatusBtn.disabled = true;
                updateStatusBtn.innerHTML = ` <i class="fa-solid fa-spinner fa-spin"></i> Updating... `;
            }

            const response =
                await fetch(
                    `/api/service-requests/${requestId}/status?status=${encodeURIComponent(newStatus)}`,
                    {
                        method: "PUT",
                        headers: {"Accept": "application/json"}
                    }
                );

            if (!response.ok) {
                let message = `Unable to update status. HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    message = errorData.message || message;
                } catch (_) {
                }
                throw new Error(message);
            }

            closeModal();
            await loadReport();
            showSuccess("Request status updated successfully.");
        } catch (error) {
            console.error("Status update error:", error);
            showError(error.message || "Unable to update request status.");
        } finally {
            if (updateStatusBtn) {
                updateStatusBtn.disabled = false;
                updateStatusBtn.innerHTML = "Update Status";
            }
        }
    }

    // EXPORT PDF
    function exportPdf() {
        const params = buildFilterParams();
        const queryString = params.toString();
        const url = queryString ? `/api/admin/reports/pdf?${queryString}` : "/api/admin/reports/pdf";
        window.location.href = url;
    }

    // DATE
    function getDateOnly(value) {
        if (!value) {
            return "";
        }
        return String(value).substring(0, 10);
    }

    function formatDate(value) {
        const date = getDateOnly(value);
        if (!date) {
            return "N/A";
        }
        const parts = date.split("-");
        if (parts.length !== 3) {
            return date;
        }
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    function formatDateTime(value) {
        if (!value) {
            return "N/A";
        }
        const stringValue = String(value);
        const date = getDateOnly(stringValue);
        if (!date) {
            return "N/A";
        }
        const time = stringValue.length >= 16 ? stringValue.substring(11, 16) : "";
        if (!time) {
            return formatDate(date);
        }
        return `${formatDate(date)} ${formatTime(time)}`;
    }

    // TIME
    function formatTime(value) {
        if (!value) {
            return "N/A";
        }
        const raw = String(value).substring(0, 5);
        const parts = raw.split(":");
        let hours = parseInt(parts[0], 10);
        const minutes = parts[1] || "00";

        if (Number.isNaN(hours)) {
            return raw;
        }
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    }

    // CURRENCY
    function formatCurrency(amount, currency = "INR") {
        if (amount === null || amount === undefined || amount === "") {
            return "N/A";
        }

        const number = Number(amount);

        if (Number.isNaN(number)) {
            return `${currency} ${amount}`;
        }
        return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: currency || "INR",
                maximumFractionDigits: 2
            }
        ).format(number);
    }

    // TEXT
    function setText(element, value) {
        if (!element) {
            return;
        }

        element.textContent = value === null || value === undefined || value === "" ? "N/A" : value;
    }

    // HTML
    function setHtml(element, value) {
        if (!element) {
            return;
        }
        element.innerHTML = value || "";
    }

    // ESCAPE HTML
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
        loadingState?.classList.remove("hidden");
        emptyState?.classList.add("hidden");
        tableContainer?.classList.add("hidden");

        if (requestCountText) {
            requestCountText.textContent = "Loading...";
        }
    }

    function hideLoading() {
        loadingState?.classList.add("hidden");
    }

    // ALERT
    function showSuccess(message) {
        if (typeof Swal !== "undefined") {
            Swal.fire({
                icon: "success",
                title: "Success",
                text: message,
                timer: 1800,
                showConfirmButton: false
            });
        } else {
            alert(message);
        }
    }

    function showError(message) {
        if (typeof Swal !== "undefined") {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: message
            });
        } else {
            alert(message);
        }
    }

    // EVENTS Refresh
    refreshRequestsBtn?.addEventListener("click", loadReport);

    // PDF
    exportPdfBtn?.addEventListener("click", exportPdf);

    // LIVE SEARCH
    requestSearch?.addEventListener("input", liveSearch);

    // LIVE DATE
    requestDate?.addEventListener("change", loadReport);

    // LIVE STATUS
    statusFilter?.addEventListener("change", loadReport);

    // RESET
    resetFilterBtn?.addEventListener("click", () => {
            if (requestSearch) {
                requestSearch.value = "";
            }

            if (requestDate) {
                requestDate.value = "";
            }

            if (statusFilter) {
                statusFilter.value = "";
            }
            loadReport();
        }
    );

    // TABLE VIEW
    requestsTableBody?.addEventListener("click", event => {
            const button = event.target.closest(".view-request-btn");
            if (!button) {
                return;
            }
            const index = Number(button.dataset.index);
            if (Number.isNaN(index) || !currentRequests[index]) {
                return;
            }
            openRequestModal(currentRequests[index]);
        }
    );

    // MODAL
    closeViewModal?.addEventListener("click", closeModal);
    closeModalBtn?.addEventListener("click", closeModal);
    updateStatusBtn?.addEventListener("click", updateRequestStatus);
    requestViewModal?.addEventListener("click", event => {
            if (event.target === requestViewModal) {
                closeModal();
            }
        }
    );

    document.addEventListener("keydown", event => {
            if (event.key === "Escape" && requestViewModal && !requestViewModal.classList.contains("hidden")) {
                closeModal();
            }
        }
    );

    // INITIAL LOAD
    loadReport();
});