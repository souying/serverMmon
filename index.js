const { server, config } = require("./server/app");

server.listen({ host: config.listen.ip, port: config.listen.port });

// eslint-disable-next-line no-console
console.log(`SSHnake service listening on ${config.listen.ip}:${config.listen.port}`);

server.on("error", (err) => {
	if (err.code === "EADDRINUSE") {
		config.listen.port += 1;
		console.warn(`SSHnake Address in use, retrying on port ${config.listen.port}`);
		setTimeout(() => {
			server.listen(config.listen.port);
		}, 250);
	} else {
		// eslint-disable-next-line no-console
		console.log(`SSHnake server.listen ERROR: ${err.code}`);
	}
});
