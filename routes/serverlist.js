var express = require('express');
var request = require('request');
var router = express.Router();
const { Client } = require('ssh2');
const db = require('../common/data').serverList;
// 流量配置
const liu = require('../common/data').liu;
const { ping } = require("../common/ping");

router.post('/serverAdd', async function(req, res) {
    if(req.body.name&&req.body.url&&req.body.location&&req.body.region&&req.body.token){
        let param = {
            "name":req.body.name,
            "url":req.body.url,
            "location":req.body.location,
            "region":req.body.region,
            "token":req.body.token,
            "show":req.body.show,
            "username":req.body.username?req.body.username:null,
            "password":req.body.password?req.body.password:null,
            "number":req.body.number?req.body.number:0,
            "updata":Date.now()
        };
        await db.insert(param);
        res.send(JSON.stringify({code:200,msg:"控制端服务器添加成功",data:{}}))
    }else{
        res.send(JSON.stringify({code:400,msg:"参数缺失",data:{}}))
    }
    
});
router.post('/serverUpData',async function(req, res) {
    if(req.body._id&&req.body.name&&req.body.url&&req.body.location&&req.body.region&&req.body.token){
        let _id = {
            "_id":req.body._id,
        }
        let param = {
            "name":req.body.name,
            "url":req.body.url,
            "location":req.body.location,
            "region":req.body.region,
            "token":req.body.token,
            "show":req.body.show,
            "username":req.body.username?req.body.username:null,
            "password":req.body.password?req.body.password:null,
            "number":req.body.number?req.body.number:0,
            "updata":Date.now()
        };
        console.log(param)
        let data = await db.update(_id,{ $set: param });
        if(data){
            res.send(JSON.stringify({code:200,msg:"控制端信息更新成功",data:{}}))
        }else{
            res.send(JSON.stringify({code:400,msg:"控制端信息更新失败",data:{}}))
        }
    }else{
        res.send(JSON.stringify({code:400,msg:"参数缺失",data:{}}))
    }
});
router.post('/serverRemove',async function(req, res) {
    
    if(req.body._id){
        let data = await db.remove({'_id':req.body._id});
        if(data){
            res.end(JSON.stringify({
                code: 200,
                msg: '删除成功',
                data:{}
              }))
        }else{
            res.end(JSON.stringify({
                code: 400,
                msg: '删除失败',
                data:{}
            }))
        }
        
    }else{
        res.send(JSON.stringify({code:400,msg:"参数缺失",data:{}}))
    }
});
router.post('/serverFind',async function(req, res) {
    
    let data = await db.find({'show':'true'});
    if(data){
        res.end(JSON.stringify({
            code: 200,
            msg: '查询成功',
            data:data
            }))
    }else{
        res.end(JSON.stringify({
            code: 400,
            msg: '查询失败',
            data:{}
        }))
    }
});

router.post('/serverFindAdmin',async function(req, res) {
    
    let data = await db.find();
    if(data){
        res.end(JSON.stringify({
            code: 200,
            msg: '查询成功',
            data:data
            }))
    }else{
        res.end(JSON.stringify({
            code: 400,
            msg: '查询失败',
            data:{}
        }))
    }
});

router.post('/serverFindOne',async function(req, res) {
    
    if(req.body._id){
        let data = await db.findOne({'_id':req.body._id});
        if(data){
            res.end(JSON.stringify({
                code: 200,
                msg: '查询成功',
                data:data
              }))
        }else{
            res.end(JSON.stringify({
                code: 400,
                msg: '查询失败',
                data:{}
            }))
        }
        
    }else{
        res.send(JSON.stringify({code:400,msg:"参数缺失",data:{}}))
    }
});

router.post('/shell',async function(req, res) {
    
    if(req.body.cmd&&req.body.servershell){
        let servershell = req.body.servershell
        let data = await db.find();
        let items = [];
        for(let i = 0;i<data.length;i++){
            for(let n = 0;n<servershell.length;n++){
                if(data[i].url==servershell[n]){
                    if(data[i].username&&data[i].password){
                        items.push({
                            host: (data[i].url).split(":")[0],
                            port: 22,
                             username: data[i].username, 
                             password: data[i].password
                        })
                    }else{
                        res.end(JSON.stringify({
                            code: 400,
                            msg: '要执行的服务器中必须设置服务器账号和密码（请查看）',
                            data:{}
                        }))
                        return;
                    }
                    
                }
            }
        }
        console.log(items)
        if(items.length>0){
            let results = [];
            for(let i = 0;i<items.length;i++){
                let server = items[i]
                let conn = new Client();
                conn.on('ready', () => {
                    conn.exec(req.body.cmd, (err, stream) => {
                      if (err) {
                        console.error(`Error executing command on ${server.host}: ${err.message}`);
                        conn.end();
                        return;
                      }
              
                      let output = '';
                      stream.on('data', data => {
                        output += data.toString();
                      });
                      stream.on('close', code => {
                        results.push({ server: server.host, output:output });
                        conn.end();
                        if (results.length === items.length) {
                        //   res.json(results);
                        //   console.log(results)
                          res.end(JSON.stringify({
                            code: 200,
                            msg: '批量执行成功',
                            data:results
                          }))
                        }
                      });
                    });
                  });
              
                  conn.on('error', err => {
                    console.error(`Error connecting to ${server.host}: ${err.message}`);
                    res.end(JSON.stringify({
                        code: 400,
                        msg: `Error connecting to ${server.host}: ${err.message}`,
                        data:{}
                    }))
                  });
              
                  conn.connect(server);
            }
        }
        
    }else{
        res.send(JSON.stringify({code:400,msg:"参数缺失",data:{}}))
    }
});

router.post('/ping',async function(req, res) {
    
    if(req.body._id){
        let data = await db.findOne({'_id':req.body._id});
        if(data.url){
            
            ping((data.url).split(":")[0],function(arr){
                let html = ""
                
                for (let i = 0; i < arr.length; i++) {
                    html+=arr[i]+'<br>'
                    
                }
                res.end(JSON.stringify({
                    code: 200,
                    msg: 'ping成功',
                    data:html
                  }))
                
            })
            
        }else{
            res.end(JSON.stringify({
                code: 400,
                msg: 'ping失败',
                data:{}
            }))
        }
        
    }else{
        res.send(JSON.stringify({code:400,msg:"参数缺失",data:{}}))
    }
});

// 清空初始化统计流量
router.post('/liu',async function(req, res) {
    console.log(req.body.url)
    if(req.body.url){
        let _url = {
            "url":req.body.url,
        }
        let RX = 1;
        let TX = 1;
        let liuData = await liu.findOne(_url);
        if(liuData){
            let param = {
                "url":req.body.url,
                "RX":RX,
                "TX":TX,
                "updata":Date.now()
            };
            // console.log(param)
            await liu.update(_url,{ $set: param });
            res.end(JSON.stringify({
                code: 200,
                msg: '清空流量成功',
                data:{}
                }))
        }else{
            let param = {
                "url":req.body.url,
                "RX":RX,
                "TX":TX,
                "updata":Date.now()
            };
            await liu.insert(param);
            res.end(JSON.stringify({
                code: 200,
                msg: '清空流量成功',
                data:{}
            }))
        }
            
        
    }else{
        res.send(JSON.stringify({code:400,msg:"参数缺失",data:{}}))
    }
});


module.exports = router;
