
/* eslint no-unused-expressions: ["error", { "allowShortCircuit": true, "allowTernary": true }],
   no-console: ["error", { allow: ["warn", "error", "info"] }] */
/*esint没有未使用的表达式：[“error”，｛“allowShortCircuit”：true，“allowTerary”：true｝]，

无控制台：[“error”，｛allow:[“warn”，“error”、“info”]｝]*/
const path = require("path");
const util = require("util");

const nodeRoot = path.dirname(require.main.filename);

// 默认配置
const configDefault = {
	listen: {
		ip: "0.0.0.0",
		port: 5880,
	},
	user: {
		name: null,
		password: null,
		privatekey: null,
		overridebasic: false,
	},
	ssh: {
		host: null,
		port: 22,
		term: "xterm-color",
		readyTimeout: 20000,
		keepaliveInterval: 120000,
		keepaliveCountMax: 10,
		allowedSubnets: [],
	},
	terminal: {
		cursorBlink: true,
		scrollback: 10000,
		tabStopWidth: 8,
		bellStyle: "sound",
	},
	header: {
		text: null,
		background: "#f8f8f8",
	},
	options: {
		challengeButton: true,
	},
	algorithms: {
		kex: [
			"ecdh-sha2-nistp256",
			"ecdh-sha2-nistp384",
			"ecdh-sha2-nistp521",
			"diffie-hellman-group-exchange-sha256",
			"diffie-hellman-group14-sha1",
		],
		cipher: [
			"aes128-ctr",
			"aes192-ctr",
			"aes256-ctr",
			"aes128-gcm",
			"aes128-gcm@openssh.com",
			"aes256-gcm",
			"aes256-gcm@openssh.com",
			"aes256-cbc",
		],
		hmac: ["hmac-sha2-256", "hmac-sha2-512", "hmac-sha1"],
		compress: ["none", "zlib@openssh.com", "zlib"],
	},
	serverlog: {
		client: false,
		server: false,
	},
	verify: false,
};
if (process.env.LISTEN) configDefault.listen.ip = process.env.LISTEN;

if (process.env.PORT) configDefault.listen.port = process.env.PORT;

module.exports = configDefault;
