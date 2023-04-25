var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//引入插件
var vertoken=require('../common/token')
var { expressjwt: jwt } = require("express-jwt");

var indexRouter = require('../routes/index');
var userRouter = require('../routes/user');
var shareRouter = require('../routes/share');
var tgRouter = require('../routes/tg');
var serverListRouter = require('../routes/serverlist');
var indexws = require('../routes/ws');

const config = require("./config");
const path = require("path");
const crypto = require("crypto");
const nodeRoot = path.dirname(require.main.filename);
const publicPath = path.join(nodeRoot, "client", "public");
const publicPathHome = path.join(nodeRoot, "home");
const publicPathAdmin = path.join(nodeRoot, "admin");
const publicPathflow = path.join(nodeRoot, "flow");
console.log(path.join(nodeRoot, "home"))
const express = require("express");

const app = express();
const server = require("http").Server(app);
var expressWs = require('express-ws')(app,server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//设置跨域访问
app.all('*', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header('Access-Control-Allow-Headers', ['mytoken','Content-Type','authorization','Authorization']);
	next();
});




const io = require("socket.io")(server, {
	serveClient: false,
	path: "/socket.io",
	origins: ["localhost:"+config.listen.port],
});
const expressConfig = {
	secret: crypto.randomBytes(20).toString("hex"),
	name: "serverMmon",
	resave: true,
	saveUninitialized: false,
	unset: "destroy",
	ssh: {
		dotfiles: "ignore",
		etag: false,
		extensions: ["htm", "html"],
		index: false,
		maxAge: "1s",
		redirect: false,
		setHeaders(res) {
			res.set("x-timestamp", Date.now());
		},
	},
};
const session = require("express-session")(expressConfig);

const appSocket = require("./socket");
const { connect, notfound, handleErrors } = require("./routes");

// safe shutdown
let remainingSeconds = 30;
let shutdownMode = false;
let shutdownInterval;
let connectionCount = 0;
// eslint-disable-next-line consistent-return
function safeShutdownGuard(req, res, next) {
	if (!shutdownMode) return next();
	res.status(503).end("状态503 服务不可用：服务器正在关闭");
}
// express
app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());


app.use('/server', indexRouter);
app.ws('/basic', indexws.basic);

app.use(safeShutdownGuard);
app.use(session);
app.disable("x-powered-by");
app.use(express.urlencoded({ extended: true }));
app.post("/host/:host?", connect);
app.post("/", express.static(publicPathHome, expressConfig));
app.use("/", express.static(publicPathHome, expressConfig));
app.post("/ssh", express.static(publicPath, expressConfig));
app.use("/ssh", express.static(publicPath, expressConfig));
app.post("/login", express.static(publicPath, expressConfig));
app.use("/login", express.static(publicPath, expressConfig));
app.post("/admin", express.static(publicPathAdmin, expressConfig));
app.use("/admin", express.static(publicPathAdmin, expressConfig));
app.post("/flow", express.static(publicPathflow, expressConfig));
app.use("/flow", express.static(publicPathflow, expressConfig));
app.get("/host/:host?", connect);
app.post("/submit", (req, res) => {
	connect(req, res, req.body.host,req.body.port, req.body.username, req.body.userpassword);
});
app.get("/ssh", (req, res) => {
	res.sendFile(path.join(path.join(publicPath, "login.html")));
});
app.get("/login", (req, res) => {
	res.sendFile(path.join(path.join(publicPath, "login.html")));
});
app.get("/", (req, res) => {
	res.sendFile(path.join(path.join(publicPathHome, "index.html")));
});



//验证token是否过期并规定那些路由不需要验证
app.use(jwt({
	secret:'aXloaWR1NzZidmgyaGpnaDEyNCEh',
	algorithms:['HS256']
  }).unless({
  //用户第一次登录的时候不需要验证token
	path:[
		'/user/login',
		'/user/reg',
		'/server/list',
		'/server/share',
		'/server/interface',
		'/server/dbiflist',
		'/submit',
		'/socket.io'
	]  //不需要验证的接口名称
  })
  )
  //解析token获取用户信息
app.use(function(req, res, next) {
	// console.log(req)
	var token = req.headers['authorization'];
	// console.log(req.headers['authorization'])
	if(token == undefined){
		return next();
	}else{
		vertoken.getToken(token).then((data)=> {
// 			console.log(data)
			req.data = data;
			return next();
		}).catch((error)=>{
			return next();
		})
	}
  });

  //token失效返回信息
app.use(function(err,req,res,next){
	if(err.status==401){
		 res.send(JSON.stringify({code:401,message:'token失效,退出登录'}))
	}
  })


app.use('/user', userRouter);
app.use('/serverlist', serverListRouter);
app.use('/share', shareRouter);
app.use('/tg', tgRouter);



app.use(notfound);

app.use(handleErrors);


// clean stop
function stopApp(reason) {
	shutdownMode = false;
	if (reason) console.info(`Stopping: ${reason}`);
	clearInterval(shutdownInterval);
	io.close();
	server.close();
}

// bring up socket
io.on("connection", appSocket);

// socket.io
// expose express session with socket.request.session
io.use((socket, next) => {
	socket.request.res ? session(socket.request, socket.request.res, next) : next(next); // eslint disable-line
});




function countdownTimer() {
	if (!shutdownMode) clearInterval(shutdownInterval);
	remainingSeconds -= 1;
	if (remainingSeconds <= 0) {
		stopApp("倒计时结束");
	} else io.emit("shutdownCountdownUpdate", remainingSeconds);
}

const signals = ["SIGTERM", "SIGINT"];
signals.forEach((signal) =>
	process.on(signal, () => {
		if (shutdownMode) stopApp("安全关闭中止，强制退出");
		if (!connectionCount > 0) stopApp("所有连接已断开");
		shutdownMode = true;
		console.error(
			`\r\n${connectionCount} 客户端连接.\r\n启动 ${remainingSeconds} 倒计时\r\n再次按Ctrl+C强制退出`
		);
		if (!shutdownInterval) shutdownInterval = setInterval(countdownTimer, 1000);
	})
);

module.exports = { server, config };

const onConnection = (socket) => {
	connectionCount += 1;
	socket.on("disconnect", () => {
		connectionCount -= 1;
		if (connectionCount <= 0 && shutdownMode) {
			stopApp("所有客户端已断开连接");
		}
	});
	socket.on("geometry", (cols, rows) => {
		socket.request.session.ssh.terminfo = { cols, rows };
	});
};

io.on("connection", onConnection);
