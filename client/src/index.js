/* eslint-disable import/no-extraneous-dependencies */
import { io } from "socket.io-client";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import  "./zmodem.min.js";

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

let zsentry = new Zmodem.Sentry({
	to_terminal: function (octets) {
	},  //i.e. send to the terminal

	on_detect(detection) {
		let zsession = detection.confirm();
		
		if (zsession.type === "send") {
			alert("暂不支持rz sz 命令")
			// uploadFile(zsession);
		} else {
			alert("暂不支持rz sz 命令")
			// downloadFile(zsession);
		}
	},

	on_retract: function () {
	},

	sender: function (octets) {
		socket.emit("data",new Uint8Array(octets))
	},
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
	// alert(data)
	// term.write(data);
	if (typeof (data) === 'string') {
		term.write(data);
	} else {
		zsentry.consume(data);
	}
});

function uploadFile(zsession) {
	let uploadHtml = "<div>" +
		"<label class='upload-area' style='width:100%;text-align:center;' for='fupload'>" +
		"<input id='fupload' name='fupload' type='file' style='display:none;' multiple='true'>" +
		"<i class='fa fa-cloud-upload fa-3x'></i>" +
		"<br />" +
		"点击选择文件" +
		"</label>" +
		"<br />" +
		"<span style='margin-left:5px !important;' id='fileList'></span>" +
		"</div><div class='clearfix'></div>";

	let upload_dialog = bootbox.dialog({
		message: uploadHtml,
		title: "上传文件",
		buttons: {
			cancel: {
				label: '关闭',
				className: 'btn-default',
				callback: function (res) {
					try {
						// zsession 每 5s 发送一个 ZACK 包，5s 后会出现提示最后一个包是 ”ZACK“ 无法正常关闭
						// 这里直接设置 _last_header_name 为 ZRINIT，就可以强制关闭了
						zsession._last_header_name = "ZRINIT";
						zsession.close();
					} catch (e) {
						console.log(e);
					}
				}
			},
		},
		closeButton: false,
	});

	function hideModal() {
		upload_dialog.modal('hide');
	}

	let file_el = document.getElementById("fupload");

	return new Promise((res) => {
		file_el.onchange = function (e) {
			let files_obj = file_el.files;
			hideModal();
			Zmodem.Browser.send_files(zsession, files_obj, {
					on_offer_response(obj, xfer) {
						if (xfer) {
							// term.write("\r\n");
						} else {
							term.write(obj.name + " was upload skipped\r\n");
						}
					},
					on_progress(obj, xfer) {
						updateProgress(xfer);
					},
					on_file_complete(obj) {
						term.write("\r\n" + obj.name + " was upload success\r\n");
					},
				}
			).then(zsession.close.bind(zsession), console.error.bind(console)
			).then(() => {
				res();
			});
		};
	});
}

function updateProgress(xfer) {
	let detail = xfer.get_details();
	let name = detail.name;
	let total = detail.size;
	let percent;
	if (total === 0) {
		percent = 100
	} else {
		percent = Math.round(xfer._file_offset / total * 100);
	}

	term.write("\r" + name + ": " + total + " " + xfer._file_offset + " " + percent + "%    ");
}

function downloadFile(zsession) {
	zsession.on("offer", (xfer) => {

		let FILE_BUFFER = [];
		xfer.on("input", (payload) => {
			updateProgress(xfer);
			FILE_BUFFER.push(new Uint8Array(payload));
		});

		xfer.accept().then(
			() => {
				Zmodem.Browser.save_to_disk(
					FILE_BUFFER,
					xfer.get_details().name
				);
			},
			console.error.bind(console)
		);

	});

	zsession.on("session_end", () => {
		term.write("\r\n");
	});

	zsession.start();
}




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
