const fs = require("fs").promises;
const { Console } = require("console");
const db = require("easy-db-json");
db.setFile("./db.json");

async function getEventType(event) {
    let eventname = event.event;
    let eventdate = event.timestamp;
    let eventdetails = event.toString().split(",").slice(2);

    let dockingEvents = ["Docked", "Undocked", "DockingRequested", "DockingDenied"];
    let locationEvents = ["Location", "FSDJump", "SupercruiseEntry", "SupercruiseExit", "StartJump", "ApproachBody", "LeaveBody", "DockingRequested", "DockingDenied"];
    if (dockingEvents.includes(eventname)) {
        return new dockingEvent({ date: eventdate, type: eventname, station: event.StationName });
    } else if (locationEvents.includes(eventname)) {
        return new locationEvent({ date: eventdate, type: eventname, system: event.StarSystem, station: event.StationName });
    } else {
        return new miscEvent({ date: eventdate, type: eventname, details: eventdetails });
    }
}

function updateOutput(message) {
    console.clear();
    console.log(message);
}

async function main() {
    const folder = "C:/Users/nicey/Code/Personal/EDJF/j";
    let files = await fs.readdir(folder);
    let jsonFiles = files.filter((file) => file.endsWith(".log"));

    let eventCount = { Dock: 0, Misc: 0, Location: 0 };
    let dbUpdates = {};

    for (let i = 0; i < jsonFiles.length; i++) {
        let file = jsonFiles[i];
        let data = await fs.readFile(`${folder}/${file}`, "utf8");
        let lines = data.split("\n");

        for (let j = 0; j < lines.length; j++) {
            try {
                updateOutput(`Processing file ${i + 1} of ${jsonFiles.length} - ${file} - Line ${j + 1} of ${lines.length}`);
                let jsonLine = JSON.parse(lines[j]);
                let eventType = jsonLine.event;

                if (!dbUpdates[eventType]) {
                    dbUpdates[eventType] = 1;
                } else {
                    dbUpdates[eventType]++;
                }
            } catch (error) {
                // Skip invalid JSON lines
            }
        }
    }

    // Batch update the database
    for (let eventType in dbUpdates) {
        let currentCount = db.get(eventType) || 0;
        db.set(eventType, currentCount + dbUpdates[eventType]);
    }

    let dockCount = db.get("Docked") || 0;
    let dockFailCount = db.get("DockingDenied") || 0;
    let jumpCount = db.get("FSDJump") || 0;
    let interdictCount = db.get("Interdicted") || 0;
    let CGCount = db.get("CommunityGoalJoin") || 0;
    let fuelCount = db.get("RefuelAll") || 0;
    let FScount = db.get("FuelScoop") || 0;

    console.log("Complete!");
    console.log(`You have:\n- Docked ${dockCount} times (with ${dockFailCount} faliures) `)
    console.log(`- Jumped ${jumpCount} times`)
    console.log(`- Been interdicted ${interdictCount} times`)
    console.log(`- Joined ${CGCount} community goals`)
    console.log(`- Refueled ${fuelCount} times`)
    console.log(`- Fuel scooped ${FScount} times`)
    return;
}

main().catch(console.error);