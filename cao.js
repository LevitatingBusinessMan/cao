#!/usr/bin/node

const {exec} = require("child_process")

//Get sink list
exec("pactl list short sinks", (err, stdout) => {


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

	console.log("Please select:")

	let selected = 0;

	draw()

	function draw() {
		
		const display = sinkList.map(
			sink => `${sink.index == selected ? "\033[32m" : "\033[0m"}[${sink.index}] ${sink.name}`
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

			//Set the cursor to right place
			process.stdout.moveCursor(0, sinkList.length)
			process.stdout.clearLine()

			//Reset color
			process.stdout.write("\033[0m")

			//Exit process
			process.exit()
			
		}

		//Final selection
		if (key.name == "return") {
			//stop listening for input
			process.stdin.pause()
			
			route_input()
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

	const route_input = () => exec("pactl list short sink-inputs", (err, stdout) => {
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
			exec(`pactl move-sink-input ${id} ${selected}`)
		})


		//Set the cursor to right place
		process.stdout.moveCursor(0, sinkList.length)
		process.stdout.clearLine()

		//Reset color
		process.stdout.write("\033[0m")

		console.log(`Done routing all inputs to device ${selected}`)
		
	})	

})