/* =========================================
   ANNOUNCER AI — ADMIN PANEL
========================================= */

const API_URL =
    "http://localhost:5000/api/announcements";

let announcements = [];
let editingId = null;


/* =========================================
   ADMIN LOGIN PROTECTION
========================================= */

if (
    sessionStorage.getItem("announcerAdmin") !== "true"
) {
    window.location.href = "login.html";
}


/* =========================================
   ELEMENTS
========================================= */

const announcementTime =
    document.getElementById("announcementTime");

const announcementCategory =
    document.getElementById("announcementCategory");

const announcementMessage =
    document.getElementById("announcementMessage");

const announcementRepeat =
    document.getElementById("announcementRepeat");

const weeklyDayContainer =
    document.getElementById("weeklyDayContainer");

const weeklyDay =
    document.getElementById("weeklyDay");

const saveAnnouncement =
    document.getElementById("saveAnnouncement");

const announcementList =
    document.getElementById("announcementList");

const totalAnnouncements =
    document.getElementById("totalAnnouncements");

const nextAnnouncement =
    document.getElementById("nextAnnouncement");

const scheduleStatus =
    document.getElementById("scheduleStatus");

const logoutButton =
    document.getElementById("logoutButton");

const voiceSelect =
    document.getElementById("voiceSelect");

const saveVoice =
    document.getElementById("saveVoice");

const testVoice =
    document.getElementById("testVoice");

const announcementHistory =
    document.getElementById("announcementHistory");

const announcerToggle =
    document.getElementById("announcerToggle");


/* =========================================
   WEEKLY DAY DISPLAY
========================================= */

function updateWeeklyDayVisibility() {

    if (!weeklyDayContainer || !announcementRepeat) {
        return;
    }

    if (announcementRepeat.value === "weekly") {

        weeklyDayContainer.style.display = "block";

    } else {

        weeklyDayContainer.style.display = "none";

    }
}

if (announcementRepeat) {

    announcementRepeat.addEventListener(
        "change",
        updateWeeklyDayVisibility
    );

    updateWeeklyDayVisibility();
}


/* =========================================
   DAY NAME
========================================= */

function getDayName(day) {

    const days = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday"
    };

    return days[Number(day)] || "";
}


/* =========================================
   LOAD ANNOUNCEMENTS
========================================= */

async function loadAnnouncements() {

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {

            throw new Error(
                "Server returned " +
                response.status
            );

        }

        const data =
            await response.json();

        announcements =
            data.announcements || [];

        displayAnnouncements();

        console.log(
            "Announcements loaded:",
            announcements
        );

    } catch (error) {

        console.error(
            "Could not load announcements:",
            error
        );

        if (scheduleStatus) {

            scheduleStatus.textContent =
                "❌ Backend connection failed";

        }

    }
}


/* =========================================
   DISPLAY ANNOUNCEMENTS
========================================= */

function displayAnnouncements() {

    if (!announcementList) {
        return;
    }

    announcementList.innerHTML = "";

    if (announcements.length === 0) {

        announcementList.innerHTML =
            "<p>No announcements scheduled.</p>";

        updateStats();

        return;
    }

    announcements.sort(
        function (a, b) {

            const timeA =
                a.scheduledTime ||
                a.time ||
                "23:59";

            const timeB =
                b.scheduledTime ||
                b.time ||
                "23:59";

            return timeA.localeCompare(timeB);

        }
    );

    announcements.forEach(
        function (announcement) {

            const item =
                document.createElement("div");

            item.className =
                "announcement-item";

            const time =
                announcement.scheduledTime ||
                announcement.time ||
                "--:--";

            const category =
                announcement.category ||
                "General";

            const message =
                announcement.message ||
                "";

            const repeat =
                announcement.repeat ||
                "once";

            let repeatText =
                "Once";

            if (repeat === "daily") {

                repeatText =
                    "🔄 Every Day";

            }

            if (repeat === "weekdays") {

                repeatText =
                    "📅 Weekdays";

            }

            if (repeat === "weekly") {

                const dayName =
                    getDayName(
                        announcement.weeklyDay
                    );

                repeatText =
                    dayName
                        ? `🗓️ Every ${dayName}`
                        : "🗓️ Every Week";

            }

            item.innerHTML = `
                <div>

                    <strong>
                        🕐 ${time}
                    </strong>

                    <div class="announcement-category">

                        ${getCategoryIcon(category)}
                        ${category}

                    </div>

                    <div style="
                        color:#9ca3af;
                        font-size:12px;
                        margin-top:5px;
                    ">

                        ${repeatText}

                    </div>

                    <div class="announcement-message">

                        ${message}

                    </div>

                </div>

                <div class="announcement-actions">

                    <button
                        onclick="editAnnouncement('${announcement.id}')"
                    >
                        Edit
                    </button>

                    <button
                        onclick="deleteAnnouncement('${announcement.id}')"
                    >
                        Delete
                    </button>

                </div>
            `;

            announcementList.appendChild(item);

        }
    );

    updateStats();
}


/* =========================================
   CATEGORY ICON
========================================= */

function getCategoryIcon(category) {

    const icons = {

        General: "📢",
        Break: "🕐",
        Lunch: "🍽️",
        Assembly: "🏫",
        Worship: "🙏",
        Emergency: "🚨",
        Academic: "📚",
        Closing: "🚌"

    };

    return icons[category] || "📢";
}


/* =========================================
   SAVE / UPDATE ANNOUNCEMENT
========================================= */

if (saveAnnouncement) {

    saveAnnouncement.addEventListener(
        "click",
        async function () {

            const time =
                announcementTime
                    ? announcementTime.value
                    : "";

            const category =
                announcementCategory
                    ? announcementCategory.value
                    : "General";

            const message =
                announcementMessage
                    ? announcementMessage.value.trim()
                    : "";

            const repeat =
                announcementRepeat
                    ? announcementRepeat.value
                    : "once";

            let selectedWeeklyDay = null;

            if (
                repeat === "weekly" &&
                weeklyDay
            ) {

                selectedWeeklyDay =
                    Number(weeklyDay.value);

            }

            if (!time) {

                alert(
                    "Please select an announcement time."
                );

                return;
            }

            if (!message) {

                alert(
                    "Please enter an announcement message."
                );

                return;
            }

            const announcementData = {

                title:
                    category || "Announcement",

                message:
                    message,

                category:
                    category || "General",

                scheduledTime:
                    time,

                repeat:
                    repeat,

                weeklyDay:
                    selectedWeeklyDay

            };

            try {

                let response;

                /* UPDATE */

                if (editingId) {

                    response =
                        await fetch(
                            `${API_URL}/${editingId}`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        announcementData
                                    )
                            }
                        );

                }

                /* CREATE */

                else {

                    response =
                        await fetch(
                            API_URL,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        announcementData
                                    )
                            }
                        );

                }

                const data =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to save announcement"
                    );

                }

                console.log(
                    "Saved:",
                    data
                );

                alert(
                    editingId
                        ? "Announcement updated successfully."
                        : "Announcement saved successfully."
                );

                editingId = null;

                if (announcementTime) {

                    announcementTime.value = "";

                }

                if (announcementMessage) {

                    announcementMessage.value = "";

                }

                if (announcementCategory) {

                    announcementCategory.value =
                        "General";

                }

                if (announcementRepeat) {

                    announcementRepeat.value =
                        "once";

                }

                if (weeklyDay) {

                    weeklyDay.value =
                        "3";

                }

                updateWeeklyDayVisibility();

                if (saveAnnouncement) {

                    saveAnnouncement.textContent =
                        "➕ Add Announcement";

                }

                await loadAnnouncements();

                window.dispatchEvent(
                    new Event(
                        "announcerScheduleUpdated"
                    )
                );

            } catch (error) {

                console.error(
                    "Save error:",
                    error
                );

                alert(
                    "Could not save announcement.\n\n" +
                    error.message
                );

            }

        }
    );
}


/* =========================================
   EDIT ANNOUNCEMENT
========================================= */

window.editAnnouncement =
    function (id) {

        const announcement =
            announcements.find(
                function (item) {

                    return item.id === id;

                }
            );

        if (!announcement) {
            return;
        }

        editingId =
            announcement.id;

        const time =
            announcement.scheduledTime ||
            announcement.time ||
            "";

        if (announcementTime) {

            announcementTime.value =
                time;

        }

        if (announcementCategory) {

            announcementCategory.value =
                announcement.category ||
                "General";

        }

        if (announcementMessage) {

            announcementMessage.value =
                announcement.message ||
                "";

        }

        if (announcementRepeat) {

            announcementRepeat.value =
                announcement.repeat ||
                "once";

        }

        if (
            weeklyDay &&
            announcement.weeklyDay !== undefined &&
            announcement.weeklyDay !== null
        ) {

            weeklyDay.value =
                String(
                    announcement.weeklyDay
                );

        }

        updateWeeklyDayVisibility();

        if (saveAnnouncement) {

            saveAnnouncement.textContent =
                "Update Announcement";

        }

        window.scrollTo({

            top: 0,
            behavior: "smooth"

        });

    };


/* =========================================
   DELETE ANNOUNCEMENT
========================================= */

window.deleteAnnouncement =
    async function (id) {

        if (
            !confirm(
                "Delete this announcement?"
            )
        ) {

            return;

        }

        try {

            const response =
                await fetch(
                    `${API_URL}/${id}`,
                    {
                        method: "DELETE"
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Delete failed"
                );

            }

            await loadAnnouncements();

        } catch (error) {

            console.error(
                "Delete error:",
                error
            );

            alert(
                "Could not delete announcement.\n\n" +
                error.message
            );

        }

    };


/* =========================================
   STATS
========================================= */

function updateStats() {

    if (totalAnnouncements) {

        totalAnnouncements.textContent =
            announcements.length;

    }

    if (scheduleStatus) {

        scheduleStatus.textContent =
            announcements.length > 0
                ? "🟢 Schedule Active"
                : "⚪ No announcements";

    }

    if (nextAnnouncement) {

        if (announcements.length === 0) {

            nextAnnouncement.textContent =
                "None";

        } else {

            const sorted =
                [...announcements].sort(
                    function (a, b) {

                        const timeA =
                            a.scheduledTime ||
                            a.time ||
                            "23:59";

                        const timeB =
                            b.scheduledTime ||
                            b.time ||
                            "23:59";

                        return timeA.localeCompare(
                            timeB
                        );

                    }
                );

            nextAnnouncement.textContent =
                sorted[0].scheduledTime ||
                sorted[0].time ||
                "None";

        }

    }

}


/* =========================================
   VOICE SYSTEM
========================================= */

function loadVoices() {

    if (!voiceSelect) {

        console.log(
            "voiceSelect element not found."
        );

        return;

    }

    const voices =
        window.speechSynthesis.getVoices();

    console.log(
        "Available voices:",
        voices
    );

    voiceSelect.innerHTML = "";

    if (voices.length === 0) {

        const option =
            document.createElement(
                "option"
            );

        option.textContent =
            "Loading voices...";

        option.value = "";

        voiceSelect.appendChild(
            option
        );

        return;

    }

    const savedVoice =
        localStorage.getItem(
            "announcerVoice"
        );

    voices.forEach(
        function (voice) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                voice.name;

            option.textContent =
                `${voice.name} (${voice.lang})`;

            if (
                savedVoice ===
                voice.name
            ) {

                option.selected =
                    true;

            }

            voiceSelect.appendChild(
                option
            );

        }
    );

}


if (
    "speechSynthesis" in window
) {

    loadVoices();

    window.speechSynthesis.onvoiceschanged =
        function () {

            loadVoices();

        };

    setTimeout(
        loadVoices,
        500
    );

    setTimeout(
        loadVoices,
        1500
    );

}


/* =========================================
   SAVE VOICE
========================================= */

if (saveVoice) {

    saveVoice.addEventListener(
        "click",
        function () {

            if (!voiceSelect) {
                return;
            }

            const selectedVoice =
                voiceSelect.value;

            if (!selectedVoice) {

                alert(
                    "No voice selected."
                );

                return;

            }

            localStorage.setItem(
                "announcerVoice",
                selectedVoice
            );

            alert(
                "Voice saved successfully."
            );

        }
    );

}


/* =========================================
   TEST VOICE
========================================= */

if (testVoice) {

    testVoice.addEventListener(
        "click",
        function () {

            if (!voiceSelect) {
                return;
            }

            const selectedName =
                voiceSelect.value;

            const voices =
                window.speechSynthesis
                    .getVoices();

            const selectedVoice =
                voices.find(
                    function (voice) {

                        return voice.name ===
                            selectedName;

                    }
                );

            const speech =
                new SpeechSynthesisUtterance(
                    "Hello. This is Announcer AI voice testing."
                );

            if (selectedVoice) {

                speech.voice =
                    selectedVoice;

            }

            speech.rate = 0.9;
            speech.pitch = 1;
            speech.volume = 1;

            window.speechSynthesis.cancel();

            window.speechSynthesis.speak(
                speech
            );

        }
    );

}


/* =========================================
   ANNOUNCEMENT HISTORY
========================================= */

function loadHistory() {

    if (!announcementHistory) {
        return;
    }

    const history =
        JSON.parse(
            localStorage.getItem(
                "announcerHistory"
            )
        ) || [];

    announcementHistory.innerHTML = "";

    if (history.length === 0) {

        announcementHistory.innerHTML =
            "<p>No announcement history yet.</p>";

        return;

    }

    [...history]
        .reverse()
        .forEach(
            function (item) {

                const div =
                    document.createElement(
                        "div"
                    );

                div.innerHTML = `
                    <strong>
                        ${item.date} ${item.time}
                    </strong>

                    <br>

                    ${getCategoryIcon(
                        item.category
                    )}

                    ${item.category}

                    <br>

                    ${item.message}
                `;

                announcementHistory.appendChild(
                    div
                );

            }
        );

}

loadHistory();


/* =========================================
   ANNOUNCER TOGGLE
========================================= */

function updateToggle() {

    if (!announcerToggle) {
        return;
    }

    const enabled =
        localStorage.getItem(
            "announcerEnabled"
        ) !== "false";

    announcerToggle.textContent =
        enabled
            ? "🟢 Announcer ON"
            : "🔴 Announcer OFF";

}

if (announcerToggle) {

    announcerToggle.addEventListener(
        "click",
        function () {

            const currentlyEnabled =
                localStorage.getItem(
                    "announcerEnabled"
                ) !== "false";

            localStorage.setItem(
                "announcerEnabled",
                currentlyEnabled
                    ? "false"
                    : "true"
            );

            updateToggle();

        }
    );

}

updateToggle();


/* =========================================
   LOGOUT
========================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            sessionStorage.removeItem(
                "announcerAdmin"
            );

            window.location.href =
                "login.html";

        }
    );

}


/* =========================================
   START
========================================= */

loadAnnouncements();

console.log(
    "Announcer AI Admin Panel loaded."
);
