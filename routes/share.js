var express = require('express');
var request = require('request');
var router = express.Router();
const db = require('../common/data').share;


router.post('/shareAdd', async function(req, res) {
    if(req.body.servershare){
        let param = {
            "servershare":req.body.servershare,
            "updata":Date.now()
        };
        await db.insert(param);
        res.send(JSON.stringify({code:200,msg:"分享地址创建成功",data:{}}))
    }else{
        res.send(JSON.stringify({code:400,msg:"参数缺失",data:{}}))
    }
    
});

router.post('/shareRemove',async function(req, res) {
    
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
router.post('/shareFind',async function(req, res) {
    
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



router.post('/shareFindOne',async function(req, res) {
    
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

router.post('/list',async function(req, res) {
    
        
    
});



module.exports = router;
