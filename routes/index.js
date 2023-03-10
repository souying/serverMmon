var express = require('express');
var router = express.Router();
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
/* GET home page. */
// router.get('/', function(req, res, next) {
//   // console.log(config.serverList)
//   // try {
//   //   arrServer = []
//   //   for(var promiseArr = [], i = 0; i < config.serverList.length; i++) {
//   //       promiseArr.push(getServeOption(config.serverList[i]))
//   //   }
  
//   //   Promise.all(promiseArr)
//   //   .then(function () {
//   //       // console.log(arrServer);
//   //       let data = arrServer.sort(createComprisonFunction("id"));

//   //       res.render('index', { title: JSON.stringify(data[0]) });
//   //   })
//   // } catch (error) {
//   //   console.log(error)
//   // }
//   res.render('index', { title: "你好吖" });
  
// });

router.get('/list', function(req, res, next) {
  // console.log(config.serverList)
  try {
    arrServer = []
    for(var promiseArr = [], i = 0; i < config.serverList.length; i++) {
        promiseArr.push(getServeOption(config.serverList[i]))
    }
  
    Promise.all(promiseArr)
    .then(function () {
        // console.log(arrServer);
        let data = arrServer.sort(createComprisonFunction("id"));
        res.send(JSON.stringify({code:200,data:data,updated:new Date().getTime()}));
    })
  } catch (error) {
    console.log(error)
  }
  
});



module.exports = router;
