const fs = require("fs");
const db = require("easy-db-json");
db.setFile("./database.json");





/**
 * @param {String} eventName e.g "Docked"
 */
async function getEventType(event) {
	// console.log(event)
	let eventname = event.event;
	let eventdate = event.timestamp;
	let eventdetails = event.toString().split(",").slice(2);



	let dockingEvents = ["Docked", "Undocked", "DockingRequested", "DockingDenied"];
	let locationEvents = ["Location", "FSDJump", "SupercruiseEntry", "SupercruiseExit", "StartJump", "ApproachBody", "LeaveBody", "DockingRequested", "DockingDenied"];
	if (dockingEvents.includes(eventname)) {
		let res = new dockingEvent({ date: eventdate, type: eventname, station: event.StationName });
		return res
	} else if (locationEvents.includes(eventname)) {
		let res = new locationEvent({ date: eventdate, type: eventname, system: event.StarSystem, station: event.StationName });
		return res
	} else {
		let res = new miscEvent({ date: eventdate, type: eventname, details: eventdetails });
		return res
	}

}

function updateOutput(message) {
	console.clear();
	// console.log("\n")
	console.log(message);
}

async function main() {

	const folder = "C:/Users/nicey/Code/Personal/EDJF/j"

	let files = fs.readdirSync(folder);
	let jsonFiles = files.filter((file) => file.endsWith(".log"));

	var j = 0;
	var i = 0;
	for (let file of jsonFiles) {
		i++;
		let data = fs.readFileSync(folder + "/" + file, "utf8");
		let lines = data.split("\n");

		for (let line of lines) {
			j++;
			try {
				updateOutput(
					`Processing file ${i} of ${jsonFiles.length} - ${file} - Line ${j} of ${lines.length}`
				);
				let jsonLine = JSON.parse(line);
				// let event = await getEventType(jsonLine);
				var temp = db.get(jsonLine.event)
				// console.log(temp)
				// console.log(jsonLine.event)
				if (!temp) {
					db.set(jsonLine.event, 1)
				} else {
					db.set(jsonLine.event, temp + 1)
				}
				
			} catch (error) {/*Skip*/}
		}
		j = 0;
	}
	console.log(`Complete! Parsed ${eventCount.Dock} docking events, ${eventCount.Misc} Misc events & ${eventCount.Location} location events.`)
	return;
}

main().catch(console.error);
