var express = require('express');
var router = express.Router();
var request = require('request');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60, checkperiod: 60 });
// 获取配置
const db = require('../common/data').serverList;
// 获取配置分享
const dbshare = require('../common/data').share;
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
                serverData[data.url] = {
                  name:data.name,
                  location:data.location,
                  region:data.region,
                  getStatus:true,
                  id:data._id,
                  updata:data.updata,
                  data:body
                }
                
            }else{
              if(!serverData[data.url]){
                serverData[data.url] = {
                  name:data.name,
                    location:data.location,
                    region:data.region,
                    getStatus:false,
                    id:data._id,
                    updata:data.updata,
                    data:[]
                }
              } 
            }
            
        }else{
          if(!serverData[data.url]){
            serverData[data.url] = {
              name:data.name,
                location:data.location,
                region:data.region,
                getStatus:false,
                id:data._id,
                updata:data.updata,
                data:[]
            }
          }
            
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
  timer = setInterval(async () => {
      try {
        arrServer = []
        let config = await db.find({"show":"true"});
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
            newData = JSON.stringify({code:200,data:data,updated:new Date().getTime()});
            cache.set('data', newData);
        })
      } catch (error) {
        console.log(error)
      }
  }, 2800)
  

router.post('/list', function(req, res, next) {
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
