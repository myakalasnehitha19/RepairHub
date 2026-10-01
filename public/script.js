// ==========================================
// REPAIRHUB FRONTEND JAVASCRIPT
// ==========================================

// Get elements from the HTML page
const serviceContainer =
    document.getElementById("serviceContainer");

const serviceSelect =
    document.getElementById("serviceSelect");

const priceInfo =
    document.getElementById("priceInfo");

const bookingForm =
    document.getElementById("bookingForm");

const bookingMessage =
    document.getElementById("bookingMessage");

const trackingForm =
    document.getElementById("trackingForm");

const trackingResult =
    document.getElementById("trackingResult");

const loadRequestsButton =
    document.getElementById("loadRequests");

const providerRequests =
    document.getElementById("providerRequests");


// Store services received from backend
let services = [];


// Icons for different services
const serviceIcons = {
    laptop: "💻",
    mobile: "📱",
    ac: "❄️",
    appliance: "🧺",
    electrical: "⚡",
    plumbing: "🚰"
};


// ==========================================
// FUNCTION 1 - LOAD SERVICES
// ==========================================

async function loadServices() {

    try {

        const response =
            await fetch("/api/services");

        services = await response.json();

        // Clear loading message
        serviceContainer.innerHTML = "";

        // Clear dropdown
        serviceSelect.innerHTML = "";

        // Default dropdown option
        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";
        defaultOption.textContent =
            "Select a service";

        serviceSelect.appendChild(defaultOption);


        // Create service cards
        services.forEach(service => {

            // Create card
            const card =
                document.createElement("div");

            card.className = "service-card";


            // Icon
            const icon =
                document.createElement("div");

            icon.className = "service-icon";

            icon.textContent =
                serviceIcons[service.id] || "🔧";


            // Service name
            const title =
                document.createElement("h3");

            title.textContent =
                service.name;


            // Description
            const description =
                document.createElement("p");

            description.textContent =
                "Professional repair service for your needs.";


            // Price
            const price =
                document.createElement("p");

            price.className = "price";

            price.textContent =
                "Estimated visit charge: ₹" +
                service.price;


            // Choose button
            const button =
                document.createElement("button");

            button.className =
                "choose-button";

            button.textContent =
                "Book this service →";

            button.type = "button";


            // Button click
            button.addEventListener(
                "click",
                function () {

                    serviceSelect.value =
                        service.id;

                    updatePrice();

                    document
                        .getElementById("booking")
                        .scrollIntoView({
                            behavior: "smooth"
                        });

                }
            );


            // Add everything to card
            card.appendChild(icon);
            card.appendChild(title);
            card.appendChild(description);
            card.appendChild(price);
            card.appendChild(button);


            // Add card to page
            serviceContainer.appendChild(card);


            // Add option to dropdown
            const option =
                document.createElement("option");

            option.value =
                service.id;

            option.textContent =
                service.name;

            serviceSelect.appendChild(option);

        });

    }

    catch (error) {

        console.error(error);

        serviceContainer.innerHTML =
            "<p>Unable to load services.</p>";

    }

}


// ==========================================
// FUNCTION 2 - UPDATE PRICE
// ==========================================

function updatePrice() {

    const selectedService =
        services.find(
            service =>
                service.id === serviceSelect.value
        );


    if (selectedService) {

        priceInfo.textContent =
            "Estimated visit charge: ₹" +
            selectedService.price +
            ". Final repair cost may vary.";

    }

    else {

        priceInfo.textContent =
            "Select a service to see the estimated visit charge.";

    }

}


// When customer changes service
serviceSelect.addEventListener(
    "change",
    updatePrice
);


// ==========================================
// FUNCTION 3 - BOOK A REPAIR
// ==========================================

bookingForm.addEventListener(
    "submit",
    async function (event) {

        // Stop page refresh
        event.preventDefault();


        bookingMessage.textContent =
            "Submitting your repair request...";


        // Collect customer information
        const customerData = {

            name:
                document.getElementById("name").value,

            phone:
                document.getElementById("phone").value,

            address:
                document.getElementById("address").value,

            serviceId:
                document.getElementById("serviceSelect").value,

            description:
                document.getElementById("description").value

        };


        try {

            // Send data to Node.js backend
            const response =
                await fetch("/api/requests", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(customerData)

                });


            const result =
                await response.json();


            // Check for error
            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Unable to submit request."
                );

            }


            // Show request ID
            bookingMessage.innerHTML =
                "✅ Repair request submitted successfully!<br><br>" +
                "<strong>Your Request ID:</strong> " +
                result.request.id +
                "<br><br>" +
                "Please save this ID to track your repair.";


            // Clear form
            bookingForm.reset();


            // Reset price message
            updatePrice();

        }

        catch (error) {

            console.error(error);

            bookingMessage.textContent =
                "❌ " + error.message;

        }

    }
);


// ==========================================
// FUNCTION 4 - TRACK REPAIR
// ==========================================

trackingForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        trackingResult.innerHTML =
            "<p>Searching for your repair...</p>";


        const requestId =
            document
                .getElementById("trackingId")
                .value
                .trim();


        try {

            // Ask backend for request
            const response =
                await fetch(
                    "/api/requests/" +
                    encodeURIComponent(requestId)
                );


            const request =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    request.message ||
                    "Request not found."
                );

            }


            // Display request information
            trackingResult.innerHTML = `

                <h3>🔧 Repair Request Details</h3>

                <p>
                    <strong>Request ID:</strong>
                    ${request.id}
                </p>

                <p>
                    <strong>Service:</strong>
                    ${request.serviceName}
                </p>

                <p>
                    <strong>Problem:</strong>
                    ${request.description}
                </p>

                <p>
                    <strong>Estimated Visit Charge:</strong>
                    ₹${request.estimatedCharge}
                </p>

                <p>
                    <strong>Status:</strong>
                    <span class="status">
                        ${request.status}
                    </span>
                </p>

                <p>
                    <strong>Submitted:</strong>
                    ${new Date(
                        request.createdAt
                    ).toLocaleString()}
                </p>

                <p>
                    <strong>Last Updated:</strong>
                    ${new Date(
                        request.updatedAt
                    ).toLocaleString()}
                </p>

            `;

        }

        catch (error) {

            trackingResult.innerHTML =
                `<p>❌ ${error.message}</p>`;

        }

    }
);


// ==========================================
// FUNCTION 5 - PROVIDER DASHBOARD
// ==========================================

loadRequestsButton.addEventListener(
    "click",
    loadProviderRequests
);


async function loadProviderRequests() {

    providerRequests.innerHTML =
        "<p>Loading repair requests...</p>";


    try {

        // Get all requests
        const response =
            await fetch(
                "/api/provider/requests"
            );


        const requests =
            await response.json();


        providerRequests.innerHTML = "";


        // No requests
        if (requests.length === 0) {

            providerRequests.innerHTML =
                "<p>No repair requests yet.</p>";

            return;

        }


        // Display each request
        requests.forEach(request => {

            const card =
                document.createElement("div");

            card.className =
                "job-card";


            card.innerHTML = `

                <h3>
                    ${request.serviceName}
                </h3>

                <p>
                    <strong>Request ID:</strong>
                    ${request.id}
                </p>

                <p>
                    <strong>Customer:</strong>
                    ${request.name}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${request.phone}
                </p>

                <p>
                    <strong>Address:</strong>
                    ${request.address}
                </p>

                <p>
                    <strong>Problem:</strong>
                    ${request.description}
                </p>

                <p>
                    <strong>Current Status:</strong>
                    <span class="status">
                        ${request.status}
                    </span>
                </p>

                <label>
                    Update Status
                </label>

            `;


            // Status dropdown
            const select =
                document.createElement("select");


            const statusOptions = [

                "Pending",

                "Accepted",

                "In Progress",

                "Completed",

                "Cancelled"

            ];


            statusOptions.forEach(status => {

                const option =
                    document.createElement("option");

                option.value = status;

                option.textContent = status;


                if (status === request.status) {

                    option.selected = true;

                }


                select.appendChild(option);

            });


            card.appendChild(select);


            // Update button
            const updateButton =
                document.createElement("button");

            updateButton.className =
                "main-button";

            updateButton.textContent =
                "Update Status";

            updateButton.type = "button";


            // Update message
            const message =
                document.createElement("p");

            message.className =
                "message";


            // Button click
            updateButton.addEventListener(
                "click",
                async function () {

                    message.textContent =
                        "Updating status...";


                    try {

                        const response =
                            await fetch(
                                "/api/provider/requests/" +
                                encodeURIComponent(
                                    request.id
                                ),
                                {

                                    method: "PATCH",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({
                                            status:
                                                select.value
                                        })

                                }
                            );


                        const result =
                            await response.json();


                        if (!response.ok) {

                            throw new Error(
                                result.message
                            );

                        }


                        message.textContent =
                            "✅ Status updated successfully!";


                        // Reload requests
                        setTimeout(
                            loadProviderRequests,
                            500
                        );

                    }

                    catch (error) {

                        message.textContent =
                            "❌ " +
                            error.message;

                    }

                }
            );


            card.appendChild(updateButton);

            card.appendChild(message);


            providerRequests.appendChild(card);

        });

    }

    catch (error) {

        providerRequests.innerHTML =
            `<p>❌ ${error.message}</p>`;

    }

}


// ==========================================
// START APPLICATION
// ==========================================

loadServices();