var express = require('express');
var request = require('request');
var router = express.Router();
const db = require('../common/data').serverList;


router.post('/serverAdd', async function(req, res) {
    if(req.body.name&&req.body.url&&req.body.location&&req.body.region&&req.body.token){
        let param = {
            "name":req.body.name,
            "url":req.body.url,
            "location":req.body.location,
            "region":req.body.region,
            "token":req.body.token,
            "username":req.body.username?req.body.username:null,
            "password":req.body.password?req.body.password:null,
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
            "username":req.body.username?req.body.username:null,
            "password":req.body.password?req.body.password:null,
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



module.exports = router;
