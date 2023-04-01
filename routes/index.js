var express = require('express');
var router = express.Router();
var request = require('request');
const NodeCache = require('node-cache');
const {callTGBot,uptimeKumaData} = require('../common/tg');
const cache = new NodeCache({ stdTTL: 60, checkperiod: 60 });
let newData;
let servers = {};
// 获取配置
const db = require('../common/data').serverList;
// 获取配置分享
const dbshare = require('../common/data').share;
// tg配置
const tg = require('../common/data').tg;

let serverData =  {};
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
  let tgconfig = await tg.find();
  return new Promise((resolve, reject) => {
      request({
        url: 'http://'+data.url+"/serve",
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        timeout:2600,
        body: JSON.stringify(data)
      }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            if(body.code==200){
              // console.log(serverData)
                serverData[data.url] = {
                  name:data.name,
                  location:data.location,
                  region:data.region,
                  getStatus:true,
                  id:data._id,
                  updata:data.updata,
                  show:data.show,
                  data:body
                }
                servers[data.url] = 1;
                
            }else{
              // console.log(serverData)
              serverData[data.url] = {
                name:data.name,
                  location:data.location,
                  region:data.region,
                  getStatus:false,
                  id:data._id,
                  updata:data.updata,
                  show:data.show,
                  data:[]
              }
              if(servers[data.url]){
                servers[data.url]+=1;
              }else{
                servers[data.url] = 1;
              }
            }
            
        }else{
          // console.log(serverData)
          serverData[data.url] = {
            name:data.name,
              location:data.location,
              region:data.region,
              getStatus:false,
              id:data._id,
              updata:data.updata,
              show:data.show,
              data:[]
          }
          if(servers[data.url]){
            servers[data.url]+=1;
          }else{
            servers[data.url] = 1;
          }
            
        }
        // console.log(servers[data.url])
        // tg推送
        if(tgconfig.length!=0){
          if(tgconfig[0].tgshow=="true"&&tgconfig[0].token&&tgconfig[0].chatId&&tgconfig[0].number){
            let number = Number(tgconfig[0].number)
            if(servers[data.url]==number){             //300m秒  5分钟提醒一次
              console.log(data.url+"掉线了")
              callTGBot(uptimeKumaData(data,servers),tgconfig[0])
              setTimeout(function(){
                servers[data.url] =1;
              },3000)
            }
          }
        }
        // end 
        resolve()
        
      });
  })
}

let shouldContinue = true;

async function loop(){
    try {
        if (!shouldContinue) {
            return;
        }

        arrServer = []
        // let config = await db.find({"show":"true"});
        let config = await db.find();
        for(var promiseArr = [], i = 0; i < config.length; i++) {
            promiseArr.push(getServeOption(config[i]))
        }

        Promise.all(promiseArr)
        .then(function () {
            for(let  i = 0; i < config.length; i++) {
                arrServer.push(serverData[config[i].url])
            }
            let data = arrServer.sort(createComprisonFunction("updata"));
            cache.set('items', data);
            newData = data;
            cache.set('data', data);
        })
    } catch (error) {
        console.log(error)
    }

    setTimeout(function(){
        loop()
    },2800)
}

loop();

// 在收到 SIGINT 信号时退出循环
process.on('SIGINT', function() {
    shouldContinue = false;
    console.log('Exiting...');
    process.exit();
});

  

router.post('/list', function(req, res, next) {
  try {
    let cachedData = cache.get('data');
    if (cachedData) {
      let items = []
      for(let i = 0;i<cachedData.length;i++){
        if(cachedData[i].show=="true"){
          items.push(cachedData[i])
        }
      }
      res.send(JSON.stringify({code:200,data:items,updated:new Date().getTime()}));
    }else{
      let items = []
      for(let i = 0;i<newData.length;i++){
        if(newData[i].show=="true"){
          items.push(newData[i])
        }
      }
      res.send(JSON.stringify({code:200,data:items,updated:new Date().getTime()}));
    }
  } catch (error) {
    console.log(error)
  }
  
});

router.post('/share',async function(req, res, next) {
  // console.log(req.body.id)
  if(req.body.id){
    try {
      let config = await dbshare.findOne({"_id":req.body.id});
      let data = cache.get('items');
      let items = []
      if(data&&config){
        // console.log(config.servershare)
        for(let i = 0;i<data.length;i++){
          for(let n = 0;n<config.servershare.length;n++){
            if(config.servershare[n]==data[i].id){
              items.push(data[i])
            }
          }
        }
        res.send(JSON.stringify({code:200,data:items,updated:new Date().getTime()}));
      }else{
        res.send(JSON.stringify({code:400,data:items,updated:new Date().getTime()}));
      }
      
    } catch (error) {
      console.log(error)
    }
  }else{
    try {
      let cachedData = cache.get('data');
  
      if (cachedData) {
        res.send(cachedData);
      }else{
        res.send(newData);
      }
    } catch (error) {
      console.log(error)
    }
  }
  
  
});



module.exports = router;
