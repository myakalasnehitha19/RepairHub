const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT||3000;

// ==========================================
// DATA FILE
// ==========================================

const DATA_FOLDER = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_FOLDER, "requests.json");

if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]");
}


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ==========================================
// REPAIR SERVICES
// ==========================================

const services = [

    {
        id: "laptop",
        name: "Laptop Repair",
        price: 499
    },

    {
        id: "mobile",
        name: "Mobile Repair",
        price: 299
    },

    {
        id: "ac",
        name: "AC Repair",
        price: 599
    },

    {
        id: "appliance",
        name: "Home Appliance Repair",
        price: 399
    },

    {
        id: "electrical",
        name: "Electrical Repair",
        price: 349
    },

    {
        id: "plumbing",
        name: "Plumbing",
        price: 299
    }

];


// ==========================================
// TECHNICIANS
// ==========================================

const technicians = [

    {
        id: "tech01",
        name: "Rahul Kumar",
        specialization: "Laptop & Computer Repair"
    },

    {
        id: "tech02",
        name: "Priya Sharma",
        specialization: "Mobile & Electronics"
    },

    {
        id: "tech03",
        name: "Arjun Reddy",
        specialization: "AC & Appliances"
    },

    {
        id: "tech04",
        name: "Vikram Singh",
        specialization: "Electrical & Plumbing"
    }

];


// ==========================================
// ALLOWED STATUSES
// ==========================================

const statuses = [

    "Pending",
    "Accepted",
    "Technician Assigned",
    "In Progress",
    "Completed",
    "Cancelled"

];


// ==========================================
// READ REQUESTS
// ==========================================

function readRequests() {

    const data =
        fs.readFileSync(
            DATA_FILE,
            "utf8"
        );

    return JSON.parse(data);

}


// ==========================================
// SAVE REQUESTS
// ==========================================

function saveRequests(requests) {

    fs.writeFileSync(

        DATA_FILE,

        JSON.stringify(
            requests,
            null,
            2
        )

    );

}


// ==========================================
// GET SERVICES
// ==========================================

app.get(
    "/api/services",
    (req, res) => {

        res.json(services);

    }
);


// ==========================================
// GET TECHNICIANS
// ==========================================

app.get(
    "/api/technicians",
    (req, res) => {

        res.json(technicians);

    }
);


// ==========================================
// CREATE REPAIR REQUEST
// ==========================================

app.post(
    "/api/requests",
    (req, res) => {

        const {

            name,
            phone,
            address,
            serviceId,
            description,

            // New realistic fields
            device,
            preferredDate,
            preferredTime

        } = req.body;


        // Check required fields
        if (

            !name ||
            !phone ||
            !address ||
            !serviceId ||
            !description

        ) {

            return res.status(400).json({

                message:
                    "Please fill in all required fields."

            });

        }


        // Find service
        const service =
            services.find(
                item =>
                    item.id === serviceId
            );


        if (!service) {

            return res.status(400).json({

                message:
                    "Invalid repair service."

            });

        }


        // Read existing requests
        const requests =
            readRequests();


        // Generate request ID
        const requestId =

            "RH-" +

            Date.now()
                .toString(36)
                .toUpperCase();


        const now =
            new Date().toISOString();


        // Create request
        const newRequest = {

            id: requestId,

            name:
                name.trim(),

            phone:
                phone.trim(),

            address:
                address.trim(),

            serviceId:
                service.id,

            serviceName:
                service.name,

            estimatedCharge:
                service.price,

            description:
                description.trim(),

            // New information
            device:
                device
                    ? device.trim()
                    : "Not specified",

            preferredDate:
                preferredDate ||
                "Not specified",

            preferredTime:
                preferredTime ||
                "Not specified",

            // Provider information
            technicianId:
                null,

            technicianName:
                null,

            technicianSpecialization:
                null,

            providerNotes:
                "",

            estimatedRepairCost:
                null,

            // Current status
            status:
                "Pending",

            // Status history
            statusHistory: [

                {

                    status:
                        "Pending",

                    time:
                        now

                }

            ],

            createdAt:
                now,

            updatedAt:
                now

        };


        // Save request
        requests.unshift(
            newRequest
        );

        saveRequests(
            requests
        );


        // Response
        res.status(201).json({

            message:
                "Repair request submitted successfully!",

            request: {

                id:
                    newRequest.id,

                serviceName:
                    newRequest.serviceName,

                estimatedCharge:
                    newRequest.estimatedCharge,

                status:
                    newRequest.status,

                createdAt:
                    newRequest.createdAt

            }

        });

    }
);


// ==========================================
// CUSTOMER TRACKING
// ==========================================

app.get(
    "/api/requests/:id",
    (req, res) => {

        const requests =
            readRequests();


        const request =
            requests.find(

                item =>

                    item.id.toLowerCase() ===

                    req.params.id.toLowerCase()

            );


        if (!request) {

            return res.status(404).json({

                message:
                    "Repair request not found."

            });

        }


        // Return realistic tracking information
        res.json({

            id:
                request.id,

            name:
                request.name,

            serviceName:
                request.serviceName,

            description:
                request.description,

            device:
                request.device ||
                "Not specified",

            estimatedCharge:
                request.estimatedCharge,

            estimatedRepairCost:
                request.estimatedRepairCost,

            status:
                request.status,

            technicianName:
                request.technicianName,

            technicianSpecialization:
                request.technicianSpecialization,

            preferredDate:
                request.preferredDate,

            preferredTime:
                request.preferredTime,

            providerNotes:
                request.providerNotes,

            statusHistory:
                request.statusHistory ||
                [],

            createdAt:
                request.createdAt,

            updatedAt:
                request.updatedAt

        });

    }
);


// ==========================================
// PROVIDER - VIEW ALL REQUESTS
// ==========================================

app.get(
    "/api/provider/requests",
    (req, res) => {

        const requests =
            readRequests();

        res.json(
            requests
        );

    }
);


// ==========================================
// PROVIDER - UPDATE REPAIR
// ==========================================

app.patch(
    "/api/provider/requests/:id",
    (req, res) => {

        const {

            status,
            technicianId,
            providerNotes,
            estimatedRepairCost

        } = req.body;


        // Validate status
        if (
            status &&
            !statuses.includes(status)
        ) {

            return res.status(400).json({

                message:
                    "Invalid repair status."

            });

        }


        const requests =
            readRequests();


        const request =
            requests.find(

                item =>
                    item.id ===
                    req.params.id

            );


        if (!request) {

            return res.status(404).json({

                message:
                    "Repair request not found."

            });

        }


        const now =
            new Date().toISOString();


        // ======================================
        // UPDATE STATUS
        // ======================================

        if (
            status &&
            status !== request.status
        ) {

            request.status =
                status;


            // Add to history
            if (
                !request.statusHistory
            ) {

                request.statusHistory =
                    [];

            }


            request.statusHistory.push({

                status:
                    status,

                time:
                    now

            });

        }


        // ======================================
        // ASSIGN TECHNICIAN
        // ======================================

        if (
            technicianId !== undefined
        ) {

            if (
                technicianId === null ||
                technicianId === ""
            ) {

                request.technicianId =
                    null;

                request.technicianName =
                    null;

                request.technicianSpecialization =
                    null;

            }

            else {

                const technician =
                    technicians.find(

                        tech =>
                            tech.id ===
                            technicianId

                    );


                if (!technician) {

                    return res.status(400).json({

                        message:
                            "Invalid technician."

                    });

                }


                request.technicianId =
                    technician.id;

                request.technicianName =
                    technician.name;

                request.technicianSpecialization =
                    technician.specialization;

            }

        }


        // ======================================
        // PROVIDER NOTES
        // ======================================

        if (
            providerNotes !== undefined
        ) {

            request.providerNotes =
                String(
                    providerNotes
                ).trim();

        }


        // ======================================
        // ESTIMATED REPAIR COST
        // ======================================

        if (
            estimatedRepairCost !== undefined
        ) {

            if (
                estimatedRepairCost === "" ||
                estimatedRepairCost === null
            ) {

                request.estimatedRepairCost =
                    null;

            }

            else {

                const cost =
                    Number(
                        estimatedRepairCost
                    );


                if (
                    Number.isNaN(cost) ||
                    cost < 0
                ) {

                    return res.status(400).json({

                        message:
                            "Invalid repair cost."

                    });

                }


                request.estimatedRepairCost =
                    cost;

            }

        }


        // Update timestamp
        request.updatedAt =
            now;


        // Save
        saveRequests(
            requests
        );


        res.json({

            message:
                "Repair details updated successfully!",

            request:

                {

                    id:
                        request.id,

                    status:
                        request.status,

                    technicianName:
                        request.technicianName,

                    providerNotes:
                        request.providerNotes,

                    estimatedRepairCost:
                        request.estimatedRepairCost,

                    updatedAt:
                        request.updatedAt

                }

        });

    }
);


// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(

            `RepairHub server running at http://localhost:${PORT}`

        );

    }
);