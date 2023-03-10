var ws = {}
var request = require('request');
// 获取配置文件
var config = require('../config/config');
let arrServer = []
function createComprisonFunction(propertyName){
  return function(object1,object2){
      var value1 = object1[propertyName];
      var value2 = object2[propertyName];
      if(value1 < value2){
          return -1;
      }else if(value1 > value2){
          return 1;
      }else{
          return 0;
      }
  }
}
async function getServeOption(data) {
  return new Promise((resolve, reject) => {
      request({
        url: data.url+"/serve",
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        // timeout:2500,
        body: JSON.stringify(data)
      }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body)
            if(body.code==200){
                arrServer.push({
                  name:data.name,
                  location:data.location,
                  region:data.region,
                  getStatus:true,
                  id:data.id,
                  data:body
                })
            }else{
                arrServer.push({
                  name:data.name,
                  location:data.location,
                  region:data.region,
                  getStatus:false,
                  id:data.id,
                  data:[]
                })
            }
            
        }else{
            arrServer.push({
              name:data.name,
              location:data.location,
              region:data.region,
              getStatus:false,
              id:data.id,
              data:[]
            })
        }
        resolve()
        
      });
  })
}

let timer = undefined
let newData;
if(timer!=undefined){
      clearInterval(timer)
    timer = undefined
  }
  timer = setInterval(() => {
      try {
        arrServer = []
        for(var promiseArr = [], i = 0; i < config.serverList.length; i++) {
            promiseArr.push(getServeOption(config.serverList[i]))
        }
        
        
      
        Promise.all(promiseArr)
        .then(function () {
            // console.log(arrServer);
            let data = arrServer.sort(createComprisonFunction("id"));
            newData = JSON.stringify({code:200,data:data,updated:new Date().getTime()});
        })
      } catch (error) {
        console.log(error)
      }
  }, 2500)
  
var timer1 = undefined;
ws.basic = function(ws,req){
    arrServer = []
  
  // 使用 ws 的 send 方法向连接另一端的客户端发送数据
//   ws.send('connect to express server with WebSocket success')

  // 使用 on 方法监听事件
  //   message 事件表示从另一段（服务端）传入的数据
    ws.on('message', function (msg) {
        ws.send(newData?newData:[])
    })
    if(timer1!=undefined){
        clearInterval(timer1)
        timer1 = undefined
    }
      // 设置定时发送消息
      timer1 = setInterval(() => {
          ws.send(newData);
      }, 3000)
  

      // close 事件表示客户端断开连接时执行的回调函数
      ws.on('close', function (e) {
        console.log('close connection')
        clearInterval(timer1)
        timer1 = undefined
      })
}

module.exports = ws