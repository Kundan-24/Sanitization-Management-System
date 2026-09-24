// ADMIN SERVICES Cloudinary Image Upload + CRUD + LIVE SEARCH
let allServices = [];

// DOM READY
document.addEventListener("DOMContentLoaded", () => {
    loadServices();
    setupForms();
    setupImageUpload();
    setupSearch();
    setupModalEvents();
});

// LOAD SERVICES
async function loadServices() {
    const tableBody = document.getElementById("servicesTableBody");
    try {
        const response = await fetch("/api/services", {
            method: "GET",
            headers: {"Accept": "application/json"},
            cache: "no-cache"
        });
        const result = await parseResponse(response);
        if (!response.ok) {
            throw new Error(result?.message || result?.error || "Unable to load services.");
        }

        allServices = Array.isArray(result) ? result : Array.isArray(result?.content) ? result.content : [];
        renderServices(allServices);
    } catch (error) {
        console.error("Load services error:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6"
                    class="px-6 py-10 text-center text-red-500">
                    <i class="fa-solid fa-circle-exclamation text-2xl"></i>
                    <p class="mt-3">${escapeHtml(error.message)}</p>
                </td>
            </tr>
        `;
        document.getElementById("serviceEntryInfo").textContent = "Showing 0 to 0 of 0 entries";
    }
}

// RENDER
function renderServices(services) {
    const tableBody = document.getElementById("servicesTableBody");
    const entryInfo = document.getElementById("serviceEntryInfo");
    if (!services.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-10 text-center">
                    <div class="flex flex-col items-center">
                        <i class="fa-solid fa-box-open text-4xl text-gray-300 dark:text-gray-600"></i>
                        <p class="mt-3 text-gray-500 dark:text-gray-400"> No services found.</p>
                    </div>
                </td>
            </tr>
        `;
        entryInfo.textContent = "Showing 0 to 0 of 0 entries";
        return;
    }

    tableBody.innerHTML = services.map((service, index) => {
        const imageHtml = service.image ? `
                <img src="${escapeHtml(service.image)}"
                     alt="${escapeHtml(service.name)}"
                     class="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                     loading="lazy"
                     onerror="this.style.display='none'">
              `
            : `
                <div class="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                    <i class="fa-solid fa-spray-can-sparkles text-blue-600 dark:text-blue-400"></i>
                </div>
              `;

        const statusHtml = service.active ? `
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                </span>
              `
            : `
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Inactive
                </span>
              `;
        return `
            <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white"> ${index + 1}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        ${imageHtml}
                        <div class="min-w-0">
                            <p class="font-semibold text-gray-900 dark:text-white">
                                ${escapeHtml(service.name)}
                            </p>
                            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                ${escapeHtml(service.description || "No description")}
                            </p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    ₹${Number(service.price || 0).toFixed(2)}
                </td>
                <td class="px-6 py-4">
                    ${statusHtml}
                </td>
                <td class="px-6 py-4">
                    ${service.createdAt ? formatDate(service.createdAt) : "-"}
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        <button type="button" onclick="openEditServiceModal(${service.id})" title="Edit Service"
                                class="w-9 h-9 inline-flex items-center justify-center rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        
                        <button type="button" onclick="deleteService(${service.id})" title="Delete Service"
                                class="w-9 h-9 inline-flex items-center justify-center rounded-lg text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
    entryInfo.textContent = `Showing 1 to ${services.length} of ${services.length} entries`;
}

// FORMS
function setupForms() {
    document.getElementById("addServiceForm") ?.addEventListener("submit", async event => {
            event.preventDefault();
            await createService();
        });
    document.getElementById("editServiceForm") ?.addEventListener("submit", async event => {
            event.preventDefault();
            await updateService();
        });
}

// CREATE
async function createService() {
    const submitButton = document.getElementById("addServiceSubmit");
    const name = document.getElementById("serviceTitle").value.trim();
    const description = document.getElementById("serviceDescription").value.trim();
    const price = document.getElementById("servicePrice").value;
    const imageInput = document.getElementById("serviceImage");

    if (!name) {
        showWarning("Service name is required.");
        return;
    }

    if (price === "" || Number(price) < 0) {
        showWarning("Please enter a valid price.");
        return;
    }

    const imageFile = imageInput.files[0];

    if (imageFile && !validateImageFile(imageFile)) {
        return;
    }

    const serviceData = {
        name,
        description,
        price: Number(price),
        active: true
    };

    const formData = new FormData();
    formData.append("service", new Blob([JSON.stringify(serviceData)], { type: "application/json" }));

    if (imageFile) {
        formData.append("image", imageFile);
    }

    setButtonLoading(submitButton, true, "Adding...");
    try {
        const response = await fetch("/api/services", {
                method: "POST",
                body: formData
            });
        const result = await parseResponse(response);

        if (!response.ok) {
            throw new Error(result?.message || result?.error || "Unable to create service.");
        }

        await showSuccess("Service Added", "Service has been added successfully.");
        closeAddServiceModal();
        resetAddServiceForm();
        await loadServices();
    } catch (error) {
        console.error(error);
        showError("Upload Failed", error.message || "Unable to add service.");
    } finally {
        setButtonLoading(submitButton, false, "Add Service");
    }
}

// EDIT
async function openEditServiceModal(id) {
    try {
        const response = await fetch(`/api/services/${id}`, {
                headers: {
                    "Accept": "application/json"
                }
            });

        const service = await parseResponse(response);

        if (!response.ok) {
            throw new Error(service?.message || "Unable to load service.");
        }

        document.getElementById("editServiceId").value = service.id;
        document.getElementById("editServiceTitle").value = service.name || "";
        document.getElementById("editServicePrice").value = service.price ?? "";
        document.getElementById("editServiceDescription").value = service.description || "";
        document.getElementById("editServiceActive").checked = service.active === true;
        const imageInput = document.getElementById("editServiceImage");
        imageInput.value = "";
        document.getElementById("editImageFileName").textContent = "";
        document.getElementById("editImagePreview").src = "";
        document.getElementById("editImagePreviewContainer").classList.add("hidden");

        const currentContainer = document.getElementById("editCurrentImageContainer");
        const currentImage = document.getElementById("editCurrentImage");

        if (service.image) {
            currentImage.src = service.image;
            currentContainer.classList.remove("hidden");
        } else {
            currentImage.src = "";
            currentContainer.classList.add("hidden");
        }

        const modal = document.getElementById("edit-service-modal");
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    } catch (error) {
        console.error(error);
        showError("Error", error.message || "Unable to load service.");
    }
}

async function updateService() {
    const submitButton = document.getElementById("editServiceSubmit");
    const id = document.getElementById("editServiceId").value;
    const name = document.getElementById("editServiceTitle").value.trim();
    const description = document.getElementById("editServiceDescription").value.trim();
    const price = document.getElementById("editServicePrice").value;
    const active = document.getElementById("editServiceActive").checked;
    const imageInput = document.getElementById("editServiceImage");

    if (!id) {
        showWarning("Service ID is missing.");
        return;
    }

    if (!name) {
        showWarning("Service name is required.");
        return;
    }

    if (price === "" || Number(price) < 0) {
        showWarning("Please enter a valid price.");
        return;
    }

    const imageFile = imageInput.files[0];

    if (imageFile && !validateImageFile(imageFile)) {
        return;
    }

    const serviceData = {
        name,
        description,
        price: Number(price),
        active
    };

    const formData = new FormData();

    formData.append("service", new Blob([JSON.stringify(serviceData)], { type: "application/json" }));

    if (imageFile) {
        formData.append("image", imageFile);
    }

    setButtonLoading(submitButton, true, "Updating...");
    try {
        const response = await fetch(`/api/services/${id}`, {
                method: "PUT",
                body: formData
            });
        const result = await parseResponse(response);
        if (!response.ok) {
            throw new Error(result?.message || result?.error || "Unable to update service.");
        }

        await showSuccess("Service Updated", "Service has been updated successfully.");
        closeEditServiceModal();
        await loadServices();
    } catch (error) {
        console.error(error);
        showError("Update Failed", error.message || "Unable to update service.");
    } finally {
        setButtonLoading(submitButton, false, "Update Service");
    }
}

// DELETE
async function deleteService(id) {
    const confirmation = await Swal.fire({
            icon: "warning",
            title: "Delete Service?",
            text: "This service will be permanently deleted.",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280"
        });

    if (!confirmation.isConfirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/services/${id}`, {method: "DELETE"});
        const result = await parseResponse(response);

        if (!response.ok) {
            throw new Error(result?.message || result?.error || "Unable to delete service.");
        }

        await showSuccess("Deleted", "Service deleted successfully.");
        await loadServices();
    } catch (error) {
        console.error(error);
        showError("Delete Failed", error.message || "Unable to delete service.");
    }
}

// ADD MODAL
function openAddServiceModal() {
    resetAddServiceForm();
    const modal = document.getElementById("add-service-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeAddServiceModal() {
    const modal = document.getElementById("add-service-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

function resetAddServiceForm() {
    document.getElementById("addServiceForm") ?.reset();
    document.getElementById("imageFileName").textContent = "";
    document.getElementById("imagePreview").src = "";
    document.getElementById("imagePreviewContainer").classList.add("hidden");
}

// CLOSE EDIT MODAL
function closeEditServiceModal() {
    const modal = document.getElementById("edit-service-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

// IMAGE UPLOAD
function setupImageUpload() {
    const addInput = document.getElementById("serviceImage");
    const editInput = document.getElementById("editServiceImage");

    addInput?.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;
        if (!validateImageFile(file)) {
            this.value = "";
            return;
        }

        document.getElementById("imageFileName").textContent = file.name;
        previewImage(file, "imagePreview", "imagePreviewContainer");
    });

    editInput?.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;
        if (!validateImageFile(file)) {
            this.value = "";
            return;
        }

        document.getElementById("editImageFileName").textContent = file.name;
        previewImage(file, "editImagePreview", "editImagePreviewContainer");
    });

    document.getElementById("removeImageBtn") ?.addEventListener("click", () => {
            document.getElementById("serviceImage").value = "";
            document.getElementById("imageFileName").textContent = "";
            document.getElementById("imagePreview").src = "";
            document.getElementById("imagePreviewContainer").classList.add("hidden");
        });

    document.getElementById("removeEditImageBtn") ?.addEventListener("click", () => {
            document.getElementById("editServiceImage").value = "";
            document.getElementById("editImageFileName").textContent = "";
            document.getElementById("editImagePreview").src = "";
            document.getElementById("editImagePreviewContainer").classList.add("hidden");
        });
}

function previewImage(file, imageId, containerId) {
    const reader = new FileReader();
    reader.onload = event => {
        document.getElementById(imageId).src = event.target.result;
        document.getElementById(containerId).classList.remove("hidden");
    };
    reader.readAsDataURL(file);
}

// IMAGE VALIDATION
function validateImageFile(file) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/svg+xml", "image/avif", "image/tiff"];
    if (!allowedTypes.includes(file.type)) {
        showWarning("Supported formats: JPG, JPEG, PNG, WEBP, GIF, BMP, SVG, AVIF and TIFF.");
        return false;
    }

    if (file.size > 5 * 1024 * 1024) {
        showWarning("Maximum image size is 5 MB.");
        return false;
    }
    return true;
}

// LIVE SEARCH
function setupSearch() {
    const searchInput = document.getElementById("serviceSearch");
    if (!searchInput) return;
    let timer;
    searchInput.addEventListener("input", function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
            const keyword = this.value.trim().toLowerCase();
            if (!keyword) {
                renderServices(allServices);
                return;
            }

            const filtered = allServices.filter(service => {
                    return (String(service.name || "").toLowerCase().includes(keyword)
                        ||
                        String(service.description || "").toLowerCase().includes(keyword)
                        ||
                        String(service.price || "").toLowerCase().includes(keyword)
                    );
                });
            renderServices(filtered);
        }, 200);
    });
}

// COPY
async function copyServices() {
    if (!allServices.length) {
        showWarning("There are no services to copy.");
        return;
    }

    const text = allServices.map((service, index) => {
            return `${index + 1}. ${service.name} - ₹${Number(service.price || 0).toFixed(2)}`;
        }).join("\n");
    try {
        await navigator.clipboard.writeText(text);
        Swal.fire({
            icon: "success",
            title: "Copied",
            text: "Services copied to clipboard.",
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        console.error(error);
        showWarning("Unable to copy services.");
    }
}

// EXPORT CSV
function exportServices() {
    if (!allServices.length) {
        showWarning("There are no services to export.");
        return;
    }

    let csv = "S No,Service,Description,Price,Status,Created Date\n";
    allServices.forEach((service, index) => {
        csv += [index + 1, csvEscape(service.name), csvEscape(service.description || ""), Number(service.price || 0).toFixed(2), service.active ? "Active" : "Inactive", service.createdAt ? formatDate(service.createdAt) : ""].join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sanitization-services.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// MODAL EVENTS
function setupModalEvents() {
    document.addEventListener("click", event => {
        const addModal = document.getElementById("add-service-modal");
        const editModal = document.getElementById("edit-service-modal");

        if (event.target === addModal) {
            closeAddServiceModal();
        }

        if (event.target === editModal) {
            closeEditServiceModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        closeAddServiceModal();
        closeEditServiceModal();
    });
}

// HELPERS
function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


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

function csvEscape(value) {
    const stringValue = String(value ?? "");
    return `"${stringValue.replace(/"/g, '""')}"`;
}

async function parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return await response.json();
    }

    return {
        message: await response.text()
    };
}

function setButtonLoading(button, loading, loadingText) {
    if (!button) return;
    if (loading) {
        button.disabled = true;
        button.dataset.originalHtml = button.innerHTML;
        button.innerHTML = ` <i class="fa-solid fa-spinner fa-spin me-1"></i> ${loadingText} `;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalHtml || loadingText;
    }
}

function showWarning(message) {
    Swal.fire({
        icon: "warning",
        title: "Warning",
        text: message,
        confirmButtonColor: "#2563eb"
    });
}

function showError(title, message) {
    Swal.fire({
        icon: "error",
        title,
        text: message,
        confirmButtonColor: "#dc2626"
    });
}

function showSuccess(title, message) {
    return Swal.fire({
        icon: "success",
        title,
        text: message,
        confirmButtonColor: "#2563eb"
    });
}