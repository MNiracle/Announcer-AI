const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


/* =========================================
   DATA FILE SETUP
========================================= */

const DATA_DIR =
    path.join(__dirname, "data");

const DATA_FILE =
    path.join(
        DATA_DIR,
        "announcements.json"
    );


if (!fs.existsSync(DATA_DIR)) {

    fs.mkdirSync(
        DATA_DIR,
        {
            recursive: true
        }
    );

}


if (!fs.existsSync(DATA_FILE)) {

    fs.writeFileSync(
        DATA_FILE,
        "[]",
        "utf8"
    );

}


/* =========================================
   READ ANNOUNCEMENTS
========================================= */

function readAnnouncements() {

    try {

        const data =
            fs.readFileSync(
                DATA_FILE,
                "utf8"
            );

        if (!data.trim()) {

            return [];

        }

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Error reading announcements:",
            error
        );

        return [];

    }

}


/* =========================================
   SAVE ANNOUNCEMENTS
========================================= */

function saveAnnouncements(
    announcements
) {

    fs.writeFileSync(

        DATA_FILE,

        JSON.stringify(
            announcements,
            null,
            2
        ),

        "utf8"

    );

}


/* =========================================
   HOME
========================================= */

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Announcer AI backend is running"

        });

    }
);


/* =========================================
   API STATUS
========================================= */

app.get(
    "/api/status",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Announcer AI API is running"

        });

    }
);


/* =========================================
   GET ANNOUNCEMENTS
========================================= */

app.get(
    "/api/announcements",
    (req, res) => {

        const announcements =
            readAnnouncements();

        res.json({

            success: true,

            announcements

        });

    }
);


/* =========================================
   CREATE ANNOUNCEMENT
========================================= */

app.post(
    "/api/announcements",
    (req, res) => {

        const {

            title,

            message,

            category,

            scheduledTime,

            duration,

            repeat,

            weeklyDay

        } = req.body;


        if (!title || !message) {

            return res.status(400).json({

                success: false,

                message:
                    "Title and message are required"

            });

        }


        const announcements =
            readAnnouncements();


        let savedWeeklyDay = null;


        if (
            weeklyDay !== undefined &&
            weeklyDay !== null &&
            weeklyDay !== ""
        ) {

            savedWeeklyDay =
                Number(weeklyDay);

        }


        const newAnnouncement = {

            id:
                Date.now().toString(),

            title:
                title.trim(),

            message:
                message.trim(),

            category:
                category || "General",

            scheduledTime:
                scheduledTime || null,

            duration:
                duration || null,

            repeat:
                repeat || "once",

            weeklyDay:
                savedWeeklyDay,

            createdAt:
                new Date().toISOString()

        };


        announcements.push(
            newAnnouncement
        );


        saveAnnouncements(
            announcements
        );


        res.status(201).json({

            success: true,

            announcement:
                newAnnouncement

        });

    }
);


/* =========================================
   UPDATE ANNOUNCEMENT
========================================= */

app.put(
    "/api/announcements/:id",
    (req, res) => {

        const { id } =
            req.params;

        const announcements =
            readAnnouncements();


        const index =
            announcements.findIndex(
                announcement =>
                    announcement.id === id
            );


        if (index === -1) {

            return res.status(404).json({

                success: false,

                message:
                    "Announcement not found"

            });

        }


        let updatedData = {

            ...announcements[index],

            ...req.body,

            id

        };


        if (
            req.body.weeklyDay !== undefined &&
            req.body.weeklyDay !== null &&
            req.body.weeklyDay !== ""
        ) {

            updatedData.weeklyDay =
                Number(
                    req.body.weeklyDay
                );

        } else if (
            req.body.repeat !== "weekly"
        ) {

            updatedData.weeklyDay =
                null;

        }


        announcements[index] =
            updatedData;


        saveAnnouncements(
            announcements
        );


        res.json({

            success: true,

            announcement:
                announcements[index]

        });

    }
);


/* =========================================
   DELETE ANNOUNCEMENT
========================================= */

app.delete(
    "/api/announcements/:id",
    (req, res) => {

        const { id } =
            req.params;

        const announcements =
            readAnnouncements();


        const filtered =
            announcements.filter(
                announcement =>
                    announcement.id !== id
            );


        if (
            filtered.length ===
            announcements.length
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Announcement not found"

            });

        }


        saveAnnouncements(
            filtered
        );


        res.json({

            success: true,

            message:
                "Announcement deleted"

        });

    }
);


/* =========================================
   START SERVER
========================================= */

app.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            "================================="
        );

        console.log(
            "       ANNOUNCER AI BACKEND"
        );

        console.log(
            "================================="
        );

        console.log(
            `Server: http://localhost:${PORT}`
        );

        console.log(
            `API: http://localhost:${PORT}/api`
        );

        console.log(
            "Status: Running"
        );

        console.log(
            "================================="
        );

        console.log("");

    }
);
