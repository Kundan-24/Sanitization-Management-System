document.addEventListener("DOMContentLoaded", () => {
    // ELEMENTS
    const refreshRequestsBtn = document.getElementById("refreshRequestsBtn");
    const exportPdfBtn = document.getElementById("exportPdfBtn");
    const totalRequests = document.getElementById("totalRequests");
    const pendingRequests = document.getElementById("pendingRequests");
    const progressRequests = document.getElementById("progressRequests");
    const completedRequests = document.getElementById("completedRequests");
    const requestSearch = document.getElementById("requestSearch");
    const statusFilter = document.getElementById("statusFilter");
    const requestDate = document.getElementById("requestDate");
    const resetFilterBtn = document.getElementById("resetFilterBtn");
    const requestCountText = document.getElementById("requestCountText");
    const loadingState = document.getElementById("loadingState");
    const emptyState = document.getElementById("emptyState");
    const tableContainer = document.getElementById("tableContainer");
    const requestsTableBody = document.getElementById("requestsTableBody");
    const requestViewModal = document.getElementById("requestViewModal");
    const closeViewModal = document.getElementById("closeViewModal");
    const modalTrackingId = document.getElementById("modalTrackingId");
    const modalCustomer = document.getElementById("modalCustomer");
    const modalPhone = document.getElementById("modalPhone");
    const modalEmail = document.getElementById("modalEmail");
    const modalService = document.getElementById("modalService");
    const modalAddress = document.getElementById("modalAddress");
    const modalDate = document.getElementById("modalDate");
    const modalTime = document.getElementById("modalTime");
    const modalMessage = document.getElementById("modalMessage");
    const modalStatus = document.getElementById("modalStatus");
    const updateStatusBtn = document.getElementById("updateStatusBtn");

    // PAYMENT MODAL ELEMENTS
    const modalServicePrice = document.getElementById("modalServicePrice");
    const modalRequestCreatedAt = document.getElementById("modalRequestCreatedAt");
    const modalPaymentStatus = document.getElementById("modalPaymentStatus");
    const modalPaymentAmount = document.getElementById("modalPaymentAmount");
    const modalCurrency = document.getElementById("modalCurrency");
    const modalOrderId = document.getElementById("modalOrderId");
    const modalPaymentId = document.getElementById("modalPaymentId");
    const modalPaymentCreatedAt = document.getElementById("modalPaymentCreatedAt");

    // VARIABLES
    let allRequests = [];
    let selectedRequestId = null;
    let searchTimer = null;
    let reportAbortController = null;

    // LOAD CENTRALIZED ADMIN REPORT
    async function loadRequests() {
        /* Cancel previous request. This is important for live search.Example: User types:
         * A
         * AB
         * ABC
         * Old API requests are cancelled so an old response cannot overwrite the latest result.
        */
        if (reportAbortController) {
            reportAbortController.abort();
        }

        reportAbortController = new AbortController();
        showLoading();
        try {
            console.log("Loading centralized admin report...");
            const params = buildFilterParams();
            const query = params.toString();
            const url = query ? `/api/admin/reports?${query}` : "/api/admin/reports";
            console.log("Admin report URL:", url);
            const response = await fetch(url,
                    {
                        method: "GET",
                        headers: {"Accept": "application/json"},
                        cache: "no-cache",
                        signal: reportAbortController.signal
                    }
                );
            console.log("Admin report API status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Unable to load report. HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log("Centralized report received:", data);
            // CENTRALIZED RESPONSE
            if (Array.isArray(data)) {
                /* Backward compatibility.*/
                allRequests = data;
                updateStatsFromRecords();
            } else {
                allRequests = Array.isArray(data.records) ? data.records : [];
                updateStats(data.summary || {});
            }
            renderRequests();
        } catch (error) {

            /*Abort is expected during live search.Do not show an error for aborted requests. */
            if (error.name === "AbortError") {
                return;
            }

            console.error("Admin report loading error:", error);
            hideLoading();
            tableContainer?.classList.add("hidden");
            emptyState?.classList.remove("hidden");

            if (requestCountText) {
                requestCountText.textContent = "Unable to load report.";
            }

            showError("Failed to Load Report", error.message || "Something went wrong while loading the report.");
        }
    }

    // BUILD LIVE FILTER PARAMS
    function buildFilterParams() {
        const params = new URLSearchParams();
        const search = requestSearch?.value?.trim() || "";
        const status = statusFilter?.value || "";
        const date = requestDate?.value || "";

        /* IMPORTANT: Backend contract: search status date Do NOT send fromDate/toDate. */
        if (search) {
            params.append("search", search);
        }

        if (status) {
            params.append("status", status);
        }

        if (date) {
            params.append("date", date);
        }
        return params;
    }

    // STATS
    function updateStats(summary) {
        if (totalRequests) {
            totalRequests.textContent = summary.totalRequests ?? 0;
        }

        if (pendingRequests) {
            pendingRequests.textContent = summary.pendingRequests ?? 0;
        }

        if (progressRequests) {
            progressRequests.textContent = summary.inProgressRequests ?? 0;
        }

        if (completedRequests) {
            completedRequests.textContent = summary.completedRequests ?? 0;
        }
    }

    // FALLBACK STATS
    function updateStatsFromRecords() {
        const pending = allRequests.filter(request => getRequestStatus(request) === "PENDING").length;
        const inProgress = allRequests.filter(request => getRequestStatus(request) === "IN_PROGRESS").length;
        const completed = allRequests.filter(request => getRequestStatus(request) === "COMPLETED").length;

        if (totalRequests) {
            totalRequests.textContent = allRequests.length;
        }

        if (pendingRequests) {
            pendingRequests.textContent = pending;
        }

        if (progressRequests) {
            progressRequests.textContent = inProgress;
        }

        if (completedRequests) {
            completedRequests.textContent = completed;
        }
    }

    // RENDER TABLE
    function renderRequests() {
        if (!requestsTableBody) {
            return;
        }

        requestsTableBody.innerHTML = "";
        hideLoading();
        // EMPTY
        if (!allRequests.length) {
            tableContainer?.classList.add("hidden");
            emptyState?.classList.remove("hidden");
            if (requestCountText) {
                requestCountText.textContent = "0 requests found.";
            }
            return;
        }

        // SHOW TABLE
        tableContainer?.classList.remove("hidden");
        emptyState?.classList.add("hidden");
        if (requestCountText) {
            requestCountText.textContent = `${allRequests.length} request${
                allRequests.length !== 1 ? "s" : ""
                } found`;
        }

        // ROWS
        allRequests.forEach((request, index) => {
                const row = document.createElement("tr");
                row.className = "hover:bg-gray-50 " + "dark:hover:bg-gray-700/50 " + "transition";
                const trackingId = request.trackingId || "N/A";
                const customerName = request.customerName || "N/A";
                const phone = request.phone || "N/A";
                const serviceName = request.serviceName || "N/A";
                const servicePrice = request.servicePrice;
                const requestStatus = getRequestStatus(request);
                const paymentStatus = request.paymentStatus;
                const paymentAmount = request.paymentAmount;
                row.innerHTML = `
                    <!-- NUMBER -->
                    <td class="px-5 py-4 text-gray-500 dark:text-gray-400">
                        ${index + 1}
                    </td>

                    <!-- TRACKING -->
                    <td class="px-5 py-4">
                        <span class="font-semibold text-blue-600 dark:text-blue-400">
                            ${escapeHtml(trackingId)}
                        </span>
                    </td>

                        <!-- CUSTOMER -->
                        <td class="px-5 py-4">
                            <div class="font-medium text-gray-900 dark:text-white">
                                ${escapeHtml(customerName)}
                            </div>
                        </td>
                        
                        <!-- MOBILE -->
                        <td class="px-5 py-4">
                            <div class="text-gray-700 dark:text-gray-300">
                                ${escapeHtml(phone)}
                            </div>
                        </td>
                        
                        <!-- SERVICE -->
                        <td class="px-5 py-4">
                            <div class="text-gray-800 dark:text-gray-200">
                                ${escapeHtml(serviceName)}
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">
                                ${formatCurrency(servicePrice, "INR")}
                            </div>
                        </td>

                    <!-- DATE -->
                    <td class="px-5 py-4 text-gray-700 dark:text-gray-300">
                        ${formatDate(request.preferredDate)}
                    </td>

                    <!-- TIME -->
                    <td class="px-5 py-4 text-gray-700 dark:text-gray-300">
                        ${formatTime(request.preferredTime)}
                    </td>

                    <!-- REQUEST STATUS -->
                    <td class="px-5 py-4">
                        ${getStatusBadge(requestStatus)}
                    </td>

                    <!-- ACTION -->
                    <td class="px-5 py-4 text-center w-32 min-w-[8rem]">
                       <div class="flex items-center justify-center gap-2">
                        <!-- VIEW -->
                        <button type="button"
                            class="view-request-btn w-9 h-9 inline-flex items-center justify-center rounded-lg
                                   bg-blue-100 text-blue-600 hover:bg-blue-200
                                   dark:bg-blue-900/30 dark:text-blue-400 transition"
                            data-id="${request.id}"
                            title="View Full Details">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                
                        <!-- DELETE -->
                        <button type="button"
                            class="delete-request-btn w-9 h-9 inline-flex items-center justify-center rounded-lg
                                   bg-red-100 text-red-600 hover:bg-red-200
                                   dark:bg-red-900/30 dark:text-red-400 transition"
                            data-id="${request.id}"
                            title="Delete Request">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                
                    </div>
                </td>
                `;
                requestsTableBody.appendChild(row);
            }
        );

        // VIEW BUTTONS
        document.querySelectorAll(".view-request-btn")
            .forEach(button => {
                button.addEventListener("click", () => {
                        const id = Number(button.dataset.id);
                        openRequestModal(id);
                    }
                );
            });

        // DELETE BUTTONS
        document.querySelectorAll(".delete-request-btn")
            .forEach(button => {
                button.addEventListener("click", () => {
                        const id = Number(button.dataset.id);
                        deleteRequest(id);
                    }
                );
            });
    }

    // GET REQUEST STATUS
    function getRequestStatus(request) {
        return (request.requestStatus || request.status || "PENDING");
    }

    // REQUEST STATUS BADGE
    function getStatusBadge(status) {
        const config = {
            PENDING: {
                text: "Pending",
                classes: "bg-yellow-100 text-yellow-700 " + "dark:bg-yellow-900/30 " + "dark:text-yellow-400"
            },

            CONFIRMED: {
                text: "Confirmed",
                classes: "bg-blue-100 text-blue-700 " + "dark:bg-blue-900/30 " + "dark:text-blue-400"
            },

            IN_PROGRESS: {
                text: "In Progress",
                classes: "bg-purple-100 text-purple-700 " + "dark:bg-purple-900/30 " + "dark:text-purple-400"
            },

            COMPLETED: {
                text: "Completed",
                classes: "bg-green-100 text-green-700 " + "dark:bg-green-900/30 " + "dark:text-green-400"
            },

            CANCELLED: {
                text: "Cancelled",
                classes: "bg-red-100 text-red-700 " + "dark:bg-red-900/30 " + "dark:text-red-400"
            }
        };

        const item = config[status] || {
                text: status || "Unknown",
                classes: "bg-gray-100 text-gray-700 " + "dark:bg-gray-700 " + "dark:text-gray-300"
            };

        return `
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${item.classes}">
                ${escapeHtml(item.text)}
            </span>
        `;
    }

    // PAYMENT BADGE
    function getPaymentBadge(status) {
        const config = {
            SUCCESS: {
                text: "Paid",
                classes: "bg-green-100 text-green-700 " + "dark:bg-green-900/30 " + "dark:text-green-400"
            },

            CREATED: {
                text: "Created",
                classes: "bg-yellow-100 text-yellow-700 " + "dark:bg-yellow-900/30 " + "dark:text-yellow-400"
            },

            PENDING: {
                text: "Pending",
                classes: "bg-yellow-100 text-yellow-700 " + "dark:bg-yellow-900/30 " + "dark:text-yellow-400"
            },

            FAILED: {
                text: "Failed",
                classes: "bg-red-100 text-red-700 " + "dark:bg-red-900/30 " + "dark:text-red-400"
            },

            REFUNDED: {
                text: "Refunded",
                classes: "bg-purple-100 text-purple-700 " + "dark:bg-purple-900/30 " + "dark:text-purple-400"
            }
        };

        const item = config[status] || {
                text: status || "N/A",
                classes: "bg-gray-100 text-gray-700 " + "dark:bg-gray-700 " + "dark:text-gray-300"
            };

        return `
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${item.classes}">
                ${escapeHtml(item.text)}
            </span>
        `;
    }

    // OPEN REQUEST MODAL
    function openRequestModal(id) {
        const request = allRequests.find(item => Number(item.id) === id);
        if (!request) {
            return;
        }

        selectedRequestId = id;
        // CUSTOMER
        setText(modalTrackingId, request.trackingId);
        setText(modalCustomer, request.customerName);
        setText(modalPhone, request.phone);
        setText(modalEmail, request.email);

        // SERVICE
        setText(modalService, request.serviceName);
        setText(modalServicePrice, formatCurrency(request.servicePrice, "INR"));

        // ADDRESS
        setText(modalAddress, request.address);

        // SCHEDULE
        setText(modalDate, formatDate(request.preferredDate));
        setText(modalTime, formatTime(request.preferredTime));
        setText(modalMessage, request.message || "No message");

        // REQUEST STATUS
        if (modalStatus) {
            modalStatus.value = getRequestStatus(request);
        }

        // REQUEST CREATED
        setText(modalRequestCreatedAt, formatDateTime(request.requestCreatedAt || request.createdAt));

        // PAYMENT DETAILS
        if (modalPaymentStatus) {
            modalPaymentStatus.innerHTML = getPaymentBadge(request.paymentStatus);
        }

        setText(modalPaymentAmount, formatCurrency(request.paymentAmount, request.currency || "INR"));
        setText(modalCurrency, request.currency || "INR");
        setText(modalOrderId, request.razorpayOrderId);
        setText(modalPaymentId, request.razorpayPaymentId);
        setText(modalPaymentCreatedAt, formatDateTime(request.paymentCreatedAt));

        // SHOW MODAL
        requestViewModal?.classList.remove("hidden");
        requestViewModal?.classList.add("flex");
        document.body.classList.add("overflow-hidden");
    }

    // CLOSE MODAL
    function closeModal() {
        requestViewModal?.classList.add("hidden");
        requestViewModal?.classList.remove("flex");
        document.body.classList.remove("overflow-hidden");
        selectedRequestId = null;
    }

    // UPDATE REQUEST STATUS
    async function updateRequestStatus() {
        if (!selectedRequestId) {
            return;
        }
        const newStatus = modalStatus?.value;
        if (!newStatus) {
            return;
        }
        try {
            if (updateStatusBtn) {
                updateStatusBtn.disabled = true;
                updateStatusBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>Updating...`;
            }
            const response = await fetch(
                    `/api/service-requests/${selectedRequestId}/status?status=${encodeURIComponent(newStatus)}`,
                    {
                        method: "PUT",
                        headers: {"Accept": "application/json"
                        }
                    }
                );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Unable to update status.");
            }
            await response.json();
            closeModal();
            showSuccess("Status Updated", "Request status updated successfully.");

            /* Reload current live-filtered report.*/
            await loadRequests();
        } catch (error) {
            console.error("Status update error:", error);
            showError("Update Failed", error.message || "Unable to update status.");
        } finally {
            if (updateStatusBtn) {
                updateStatusBtn.disabled = false;
                updateStatusBtn.innerHTML = "Update";
            }
        }
    }

    // DELETE REQUEST
    async function deleteRequest(id) {
        const request = allRequests.find(item => Number(item.id) === id);
        if (!request) {
            return;
        }
        const result = await Swal.fire({
                icon: "warning",
                title: "Delete Request?",
                text: `Request ${request.trackingId || ""} will be permanently deleted.`,
                showCancelButton: true,
                confirmButtonText: "Yes, Delete",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#dc2626"
            });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await fetch(
                    `/api/service-requests/${id}`,
                    {
                        method: "DELETE",
                        headers: {"Accept": "application/json"}
                    }
                );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Unable to delete request.");
            }

            showSuccess("Deleted", "Request deleted successfully.");

            /* Reload current live-filtered report. */
            await loadRequests();
        } catch (error) {
            console.error("Delete error:", error);
            showError("Delete Failed", error.message || "Unable to delete request.");
        }
    }

    // EXPORT PDF
    function exportReportPdf() {
        const params = buildFilterParams();
        const query = params.toString();
        const url = query ? `/api/admin/reports/pdf?${query}` : "/api/admin/reports/pdf";
        console.log("Exporting centralized PDF:", url);
        window.location.href = url;
    }

    // DATE FORMAT
    function formatDate(value) {
        if (!value) {
            return "N/A";
        }

        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return String(value).split("T")[0];
            }

            return date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );
        } catch {
            return String(value);
        }
    }

    // DATE + TIME FORMAT
    function formatDateTime(value) {
        if (!value) {
            return "N/A";
        }

        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return String(value);
            }

            return date.toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );
        } catch {
            return String(value);
        }
    }

    // TIME FORMAT
    function formatTime(value) {
        if (!value) {
            return "N/A";
        }

        const time = String(value).substring(0, 5);
        const parts = time.split(":");

        if (parts.length < 2) {
            return value;
        }

        let hours = parseInt(parts[0], 10);
        const minutes = parts[1];

        if (isNaN(hours)) {
            return value;
        }

        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    }

    // CURRENCY FORMAT
    function formatCurrency(amount, currency = "INR") {
        if (amount === null || amount === undefined || amount === "") {
            return "N/A";
        }
        const number = Number(amount);
        if (isNaN(number)) {
            return `${currency} ${amount}`;
        }
        try {
            return new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: currency
                }
            ).format(number);
        } catch {
            return `${currency} ${number.toFixed(2)}`;
        }
    }

    // SET TEXT
    function setText(element, value) {
        if (!element) {
            return;
        }
        element.textContent = value === null || value === undefined || value === "" ? "N/A" : value;
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
            requestCountText.textContent = "Loading report...";
        }
    }

    function hideLoading() {
        loadingState?.classList.add("hidden");
    }

    // LIVE SEARCH
    requestSearch?.addEventListener("input", () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {loadRequests();}, 350);
        }
    );

    // LIVE STATUS FILTER
    statusFilter?.addEventListener("change", () => {
            loadRequests();
        }
    );

    // LIVE DATE FILTER
    requestDate?.addEventListener("change", () => {
            loadRequests();
        }
    );

    // REFRESH
    refreshRequestsBtn?.addEventListener("click", () => {
            loadRequests();
        }
    );

    // PDF
    exportPdfBtn?.addEventListener("click", () => {
            exportReportPdf();
        }
    );

    // RESET FILTER
    resetFilterBtn?.addEventListener("click", () => {
            if (requestSearch) {
                requestSearch.value = "";
            }
            if (statusFilter) {
                statusFilter.value = "";
            }
            if (requestDate) {
                requestDate.value = "";
            }
            loadRequests();
        }
    );

    // CLOSE MODAL
    closeViewModal?.addEventListener("click", () => {
            closeModal();
        }
    );

    // UPDATE STATUS
    updateStatusBtn?.addEventListener("click", () => {
            updateRequestStatus();
        }
    );

    // CLOSE MODAL BY BACKDROP
    requestViewModal?.addEventListener("click", event => {
            if (event.target === requestViewModal) {
                closeModal();
            }
        }
    );

    // ESC KEY
    document.addEventListener("keydown", event => {
            if (event.key === "Escape" && requestViewModal && !requestViewModal.classList.contains("hidden")) {
                closeModal();
            }
        }
    );

    // SWEET ALERT HELPERS
    function showSuccess(title, text) {
        if (
            typeof Swal !== "undefined") {
            Swal.fire({
                icon: "success",
                title: title,
                text: text,
                timer: 1800,
                showConfirmButton: false
            });
        } else {
            alert(text || title);
        }
    }

    function showError(title, text) {
        if (typeof Swal !== "undefined") {
            Swal.fire({
                icon: "error",
                title: title,
                text: text
            });
        } else {
            alert(
                text || title
            );
        }
    }

    // INITIAL LOAD
    loadRequests();

});