
/* =========================================
   ANNOUNCER AI — MAIN APP
========================================= */

const API_URL =
    "http://localhost:5000/api/announcements";

const avatar = document.getElementById("avatar");
const avatarCard = document.getElementById("avatarCard");
const speakingStatus = document.getElementById("speakingStatus");
const announcementText = document.getElementById("announcementText");
const announceButton = document.getElementById("announceButton");
const clock = document.getElementById("clock");
const scheduleList = document.getElementById("scheduleList");
const nowAnnouncing = document.getElementById("nowAnnouncing");

let announcerEnabled =
    localStorage.getItem("announcerEnabled") !== "false";

let announcements = [];
let selectedVoice = null;
let audioUnlocked = false;


/* =========================================
   LOCAL COMPUTER TIME
========================================= */

function getLocalTime() {

    const now = new Date();

    const hours =
        String(now.getHours()).padStart(2, "0");

    const minutes =
        String(now.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
}


function getLocalDateKey() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getLocalDayOfWeek() {

    return new Date().getDay();

}


function updateClock() {

    if (!clock) return;

    const now = new Date();

    const hours =
        String(now.getHours()).padStart(2, "0");

    const minutes =
        String(now.getMinutes()).padStart(2, "0");

    const seconds =
        String(now.getSeconds()).padStart(2, "0");

    clock.textContent =
        `${hours}:${minutes}:${seconds}`;

}


updateClock();

setInterval(
    updateClock,
    1000
);


/* =========================================
   LOAD ANNOUNCEMENTS
========================================= */

async function loadAnnouncements() {

    try {

        const response =
            await fetch(API_URL);

        const data =
            await response.json();

        announcements =
            (data.announcements || []).map(
                function (announcement) {

                    return {

                        id:
                            announcement.id,

                        time:
                            announcement.scheduledTime ||
                            announcement.time ||
                            "",

                        category:
                            announcement.category ||
                            "General",

                        message:
                            announcement.message ||
                            "",

                        repeat:
                            announcement.repeat ||
                            "once",

                        weeklyDay:
                            announcement.weeklyDay !==
                                undefined &&
                            announcement.weeklyDay !==
                                null
                                ? Number(
                                    announcement.weeklyDay
                                )
                                : null,

                        createdAt:
                            announcement.createdAt ||
                            null

                    };

                }
            );

        displaySchedule();

    } catch (error) {

        console.error(
            "Could not load announcements:",
            error
        );

    }

}


/* =========================================
   DISPLAY SCHEDULE
========================================= */

function displaySchedule() {

    if (!scheduleList) return;

    scheduleList.innerHTML = "";

    if (announcements.length === 0) {

        scheduleList.innerHTML =
            "<p>No scheduled announcements.</p>";

        return;

    }

    const sorted =
        [...announcements].sort(
            function (a, b) {

                return a.time.localeCompare(
                    b.time
                );

            }
        );


    sorted.forEach(
        function (announcement) {

            const item =
                document.createElement("div");

            item.className =
                "schedule-item";


            let repeatText =
                "Once";


            if (
                announcement.repeat ===
                "daily"
            ) {

                repeatText =
                    "🔄 Every Day";

            }


            if (
                announcement.repeat ===
                "weekdays"
            ) {

                repeatText =
                    "📅 Weekdays";

            }


            if (
                announcement.repeat ===
                "weekly"
            ) {

                const days = {

                    0: "Sunday",
                    1: "Monday",
                    2: "Tuesday",
                    3: "Wednesday",
                    4: "Thursday",
                    5: "Friday",
                    6: "Saturday"

                };

                const dayName =
                    days[
                        Number(
                            announcement.weeklyDay
                        )
                    ];


                repeatText =
                    dayName
                        ? `🗓️ Every ${dayName}`
                        : "🗓️ Every Week";

            }


            item.innerHTML = `

                <div>

                    <strong>
                        ${announcement.time}
                    </strong>

                    <span>
                        ${announcement.category}
                    </span>

                </div>


                <p>
                    ${announcement.message}
                </p>


                <small>
                    ${repeatText}
                </small>

            `;


            scheduleList.appendChild(
                item
            );

        }
    );

}


/* =========================================
   VOICE SYSTEM
========================================= */

function getSavedVoice() {

    return localStorage.getItem(
        "announcerVoice"
    );

}


function findVoice() {

    const voices =
        speechSynthesis.getVoices();

    const savedVoice =
        getSavedVoice();


    if (savedVoice) {

        const match =
            voices.find(
                function (voice) {

                    return (
                        voice.name ===
                        savedVoice
                    );

                }
            );


        if (match) {

            return match;

        }

    }


    return (

        voices.find(
            function (voice) {

                return (
                    voice.lang &&
                    voice.lang
                        .toLowerCase()
                        .startsWith("en")
                );

            }
        )

        ||

        voices[0]

        ||

        null

    );

}


speechSynthesis.onvoiceschanged =
    function () {

        selectedVoice =
            findVoice();

    };


setTimeout(
    function () {

        selectedVoice =
            findVoice();

    },
    1000
);


/* =========================================
   SPEAK ANNOUNCEMENT
========================================= */

function speakAnnouncement(message) {

    if (!message) return;

    speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            message
        );


    selectedVoice =
        findVoice();


    if (selectedVoice) {

        utterance.voice =
            selectedVoice;

    }


    utterance.rate =
        0.9;

    utterance.pitch =
        1;

    utterance.volume =
        1;


    utterance.onstart =
        function () {

            if (avatarCard) {

                avatarCard.classList.add(
                    "speaking"
                );

            }


            if (speakingStatus) {

                speakingStatus.textContent =
                    "Speaking...";

            }


            if (nowAnnouncing) {

                nowAnnouncing.textContent =
                    message;

            }


            if (announcementText) {

                announcementText.textContent =
                    message;

            }

        };


    utterance.onend =
        function () {

            if (avatarCard) {

                avatarCard.classList.remove(
                    "speaking"
                );

            }


            if (speakingStatus) {

                speakingStatus.textContent =
                    "Ready";

            }

        };


    utterance.onerror =
        function (error) {

            console.error(
                "Speech error:",
                error
            );


            if (avatarCard) {

                avatarCard.classList.remove(
                    "speaking"
                );

            }


            if (speakingStatus) {

                speakingStatus.textContent =
                    "Ready";

            }

        };


    speechSynthesis.speak(
        utterance
    );

}


/* =========================================
   CHIME
   CHIME MUST FINISH BEFORE VOICE
========================================= */

function playChime() {

    return new Promise(
        function (resolve) {

            try {

                const audio =
                    new Audio(
                        "sounds/announcement-chime.mp3"
                    );


                audio.volume =
                    1;


                let finished =
                    false;


                function finish() {

                    if (finished) {

                        return;

                    }


                    finished =
                        true;


                    resolve();

                }


                audio.addEventListener(
                    "ended",
                    finish,
                    {
                        once: true
                    }
                );


                audio.addEventListener(
                    "error",
                    function () {

                        console.log(
                            "Chime playback error."
                        );

                        finish();

                    },
                    {
                        once: true
                    }
                );


                const playPromise =
                    audio.play();


                if (
                    playPromise &&
                    typeof playPromise.then ===
                        "function"
                ) {

                    playPromise.catch(
                        function (error) {

                            console.log(
                                "Chime could not play:",
                                error
                            );

                            finish();

                        }
                    );

                }

            } catch (error) {

                console.log(
                    "Audio error:",
                    error
                );

                resolve();

            }

        }
    );

}


/* =========================================
   HISTORY
========================================= */

function saveHistory(
    message,
    category
) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "announcerHistory"
            ) || "[]"
        );


    history.unshift({

        message:
            message,

        category:
            category,

        time:
            new Date().toLocaleString()

    });


    localStorage.setItem(
        "announcerHistory",
        JSON.stringify(
            history.slice(0, 50)
        )
    );

}


/* =========================================
   DELIVER ANNOUNCEMENT
========================================= */

async function deliverAnnouncement(
    message,
    category = "General"
) {

    if (!announcerEnabled) {

        return;

    }


    if (!message) {

        return;

    }


    let speechText =
        message;


    if (
        category &&
        category !== "General"
    ) {

        speechText =
            category +
            ". " +
            message;

    }


    /* PLAY CHIME FIRST */

    await playChime();


    /* SPEAK AFTER CHIME */

    speakAnnouncement(
        speechText
    );


    saveHistory(
        message,
        category
    );

}


/* =========================================
   TEST ANNOUNCEMENT BUTTON
========================================= */

if (announceButton) {

    announceButton.addEventListener(
        "click",
        function () {

            deliverAnnouncement(
                "This is a test announcement.",
                "Test"
            );

        }
    );

}


/* =========================================
   AUDIO UNLOCK
========================================= */

function unlockAudio() {

    if (audioUnlocked) {

        return;

    }


    try {

        const audio =
            new Audio();


        audio.muted =
            true;


        const playPromise =
            audio.play();


        if (
            playPromise &&
            typeof playPromise.then ===
                "function"
        ) {

            playPromise
                .then(
                    function () {

                        audio.pause();

                        audioUnlocked =
                            true;

                    }
                )
                .catch(
                    function () {}
                );

        }

    } catch (error) {

        console.log(
            "Audio unlock error:",
            error
        );

    }

}


document.addEventListener(
    "click",
    unlockAudio,
    {
        once: true
    }
);


/* =========================================
   REPEAT CHECK
========================================= */

function shouldAnnounceToday(
    announcement
) {

    const repeat =
        announcement.repeat ||
        "once";


    /* =====================================
       ONCE
    ===================================== */

    if (repeat === "once") {

        if (!announcement.createdAt) {

            return true;

        }


        const created =
            new Date(
                announcement.createdAt
            );


        const createdDate =
            created.getFullYear() +
            "-" +
            String(
                created.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                created.getDate()
            ).padStart(2, "0");


        return (
            createdDate ===
            getLocalDateKey()
        );

    }


    /* =====================================
       EVERY DAY
    ===================================== */

    if (repeat === "daily") {

        return true;

    }


    /* =====================================
       WEEKDAYS
       Monday = 1
       Friday = 5
    ===================================== */

    if (repeat === "weekdays") {

        const day =
            getLocalDayOfWeek();


        return (
            day >= 1 &&
            day <= 5
        );

    }


    /* =====================================
       EVERY WEEK
       USE SELECTED WEEKLY DAY
    ===================================== */

    if (repeat === "weekly") {

        if (
            announcement.weeklyDay ===
            null ||
            announcement.weeklyDay ===
            undefined
        ) {

            /*
               Older weekly announcements
               without a selected day will
               continue using their creation day.
            */

            if (!announcement.createdAt) {

                return false;

            }


            const created =
                new Date(
                    announcement.createdAt
                );


            return (
                created.getDay() ===
                getLocalDayOfWeek()
            );

        }


        const selectedDay =
            Number(
                announcement.weeklyDay
            );


        const todayDay =
            getLocalDayOfWeek();


        return (
            selectedDay ===
            todayDay
        );

    }


    return false;

}


/* =========================================
   SCHEDULER
========================================= */

function checkSchedule() {

    const currentTime =
        getLocalTime();


    const enabled =
        localStorage.getItem(
            "announcerEnabled"
        ) !== "false";


    if (!enabled) {

        return;

    }


    announcerEnabled =
        enabled;


    announcements.forEach(
        function (announcement) {

            if (!announcement.time) {

                return;

            }


            /* TIME MATCH */

            if (
                announcement.time !==
                currentTime
            ) {

                return;

            }


            /* REPEAT MATCH */

            if (
                !shouldAnnounceToday(
                    announcement
                )
            ) {

                return;

            }


            /* PREVENT DUPLICATE */

            const uniqueKey =
                "announced_" +
                getLocalDateKey() +
                "_" +
                announcement.id;


            if (
                localStorage.getItem(
                    uniqueKey
                ) === "true"
            ) {

                return;

            }


            localStorage.setItem(
                uniqueKey,
                "true"
            );


            console.log(
                "ANNOUNCEMENT TRIGGERED:",
                announcement
            );


            deliverAnnouncement(
                announcement.message,
                announcement.category ||
                    "General"
            );

        }
    );

}


/* =========================================
   RUN SCHEDULER EVERY SECOND
========================================= */

setInterval(
    checkSchedule,
    1000
);


/* =========================================
   REFRESH ANNOUNCEMENTS
========================================= */

setInterval(
    loadAnnouncements,
    10000
);


/* =========================================
   ADMIN TOGGLE LISTENER
========================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            "announcerEnabled"
        ) {

            announcerEnabled =
                event.newValue !==
                "false";

        }

    }
);


/* =========================================
   START
========================================= */

loadAnnouncements();


console.log(
    "Announcer AI initialized."
);


console.log(
    "Scheduler is using computer local time."
);

