var child = require('child_process');

var iconv = require('iconv-lite');
var encoding = 'cp936';
var binaryEncoding = 'binary';

const ping = (ip,fn) => {
    new Promise((res, rej) => {
        res(ip);
    }).then((ip) => {
        var connecting = false;
        var dataArr = []; // 新增：用于存储收到的数据
        var fab_cp = child.exec('ping -w 5 ' + ip,{ encoding: binaryEncoding });
        fab_cp.stdout.on("data", function(data) {
            data = iconv.decode(Buffer.from(data, binaryEncoding), encoding)
            dataArr.push(data); // 新增：将新数据添加到数组中
        });
 
        fab_cp.on("exit", function(code, signal) {
            // console.log(code, ',', signal);
            console.log('connecting status :', connecting);
            fn(dataArr); // 新增：将整个数组作为参数传递给回调函数
        });
    });
}
module.exports = {
    ping
}