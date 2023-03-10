/* eslint-disable import/no-extraneous-dependencies */
import { io } from "socket.io-client";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

let sessionFooter;
let currentDate;
let myFile;
let errorExists;
const term = new Terminal();
// DOM properties
const status = document.getElementById("status");
const header = document.getElementById("header");
const footer = document.getElementById("footer");
const countdown = document.getElementById("countdown");
const fitAddon = new FitAddon();
const terminalContainer = document.getElementById("terminal-container");
term.loadAddon(fitAddon);
term.open(terminalContainer);
term.focus();
fitAddon.fit();

const socket = io({
	path: "/socket.io",
});

function resizeScreen() {
	fitAddon.fit();
	socket.emit("resize", { cols: term.cols, rows: term.rows });
}

window.addEventListener("resize", resizeScreen, false);

term.onData((data) => {
	socket.emit("data", data);
});

socket.on("data", (data) => {
	term.write(data);
});

socket.on("connect", () => {
	socket.emit("geometry", term.cols, term.rows);
});

socket.on("setTerminalOpts", (data) => {
	term.options = data;
});

socket.on("title", (data) => {
	document.title = data;
});

socket.on("status", (data) => {
	status.innerHTML = data;
});

socket.on("ssherror", (data) => {
	status.innerHTML = data;
	status.style.backgroundColor = "red";
	errorExists = true;
});

socket.on("headerBackground", (data) => {
	header.style.backgroundColor = data;
});

socket.on("header", (data) => {
	if (data) {
		header.innerHTML = data;
		header.style.display = "block";
		// header is 19px and footer is 19px, recaculate new terminal-container and resize
		terminalContainer.style.height = "calc(100% - 38px)";
		resizeScreen();
	}
});

socket.on("footer", (data) => {
	sessionFooter = data;
	footer.innerHTML = data;
});

socket.on("statusBackground", (data) => {
	status.style.backgroundColor = data;
});

socket.on("disconnect", (err) => {
	if (!errorExists) {
		status.style.backgroundColor = "red";
		status.innerHTML = `WEBSOCKET SERVER DISCONNECTED: ${err}`;
	}
	socket.io.reconnection(false);
	countdown.classList.remove("active");
});

socket.on("error", (err) => {
	if (!errorExists) {
		status.style.backgroundColor = "red";
		status.innerHTML = `ERROR: ${err}`;
	}
});

// safe shutdown
let hasCountdownStarted = false;

socket.on("shutdownCountdownUpdate", (remainingSeconds) => {
	if (!hasCountdownStarted) {
		countdown.classList.add("active");
		hasCountdownStarted = true;
	}
	countdown.innerText = `Shutting down in ${remainingSeconds}s`;
});

term.onTitleChange((title) => {
	document.title = title;
});
