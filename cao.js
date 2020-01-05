#!/usr/bin/node

if (process.argv.includes("--help")) {
	console.log("(Change Audio Output)")
	console.log("Routes all pulseaudio sink-inputs to a specific sink via a selection menu")
	console.log("Usage: cao")
	return
}

const {exec} = require("child_process")
const fs = require("fs")
const err_wstream = fs.createWriteStream("/tmp/cao.stderr");

//Get sink list
exec("pactl list short sinks", (err, stdout) => {
	if (err) {
		console.log("An error occured retrieving sink-input list (/tmp/cao.stderr)")
		err_wstream.write(err + "\n")
		process.exit(1)
	}
	const outputLines = stdout.split("\n")

	//remove last empty line
	outputLines.splice(-1, 1)

	const sinkList = []
	outputLines.forEach(line => {
		const columns = line.split("\t")

		const index = columns[0]
		const name = columns[1]

		sinkList.push({index, name})
	})

	//Node outputs in bold by default, thus the reset char at the end
	console.log("Please select:\033[0m")

	let selected = 0;

	draw()

	function draw() {
		
		const display = sinkList.map(
			sink => `${sinkList.indexOf(sink) == selected ? "\033[32m" : "\033[0m"}[${sink.index}] ${sink.name}`
		).join("\n")
		
		process.stdout.write(display)

		//Put cursor back to original place
		process.stdout.cursorTo(0)
		process.stdout.moveCursor(0, -(sinkList.length-1))

	}

	//Read input
	const readline = require('readline')
	readline.emitKeypressEvents(process.stdin)
	process.stdin.setRawMode(true)
	
	process.stdin.on("keypress", (str, key) => {
		if (key.ctrl && key.name == "c") {

			//Move 1 up to cover the "Please select" message
			process.stdout.moveCursor(0, -1)
			//Clear selection menu
			process.stdout.clearScreenDown()

			//Reset color
			process.stdout.write("\033[0m")

			console.log("Selection cancelled by user")

			//Exit process
			process.exit()
			
		}

		//Final selection
		if (key.name == "return") {
			//stop listening for input
			process.stdin.pause()
			
			//Move 1 up to cover the "Please select" message
			process.stdout.moveCursor(0, -1)
			//Clear selection menu
			process.stdout.clearScreenDown()
			
			//Reset color
			process.stdout.write("\033[0m")

			const index = sinkList[selected].index;

			route_input(index)
			set_default(index)

			//Return so we don't draw again
			return
		}

		switch (key.name) {
			case "up":
				if (selected > 0)
					selected--
				break

			case "down":
				if (selected < sinkList.length-1)
					selected++
				break
		}

		draw()
		
	})

	const route_input = (index) =>
		exec("pactl list short sink-inputs", (err, stdout) => {
			if (err) {
				console.log("An error occured retrieving sink-input list (/tmp/cao.stderr)")
				err_wstream.write(err + "\n")
				process.exit(1)
			}
			
			const outputLines = stdout.split("\n")
		
			//remove last empty line
			outputLines.splice(-1, 1)
		
			const inputList = []
			outputLines.forEach(line => {
				const columns = line.split("\t")
		
				const id = columns[0]	
				inputList.push(id)
			})

			inputList.forEach(id => {
				exec(`pactl move-sink-input ${id} ${index}`, err => {
					if (err) {
						console.log(`An error occured moving sink-input ${id}`)
						err_wstream.write(err + "\n")
					}
				})
			})

			console.log(`Done routing all inputs to sink ${index}`)
			
		})

	const set_default = (index) =>
		exec(`pactl set-default-sink ${index}`, (err, stdout) => {
			if (err) {
				console.log(`An error occured setting sink ${index} as default sink`);
				err_wstream.write(err + "\n")
			} else console.log(`Sink ${index} set as default`);
		})

})