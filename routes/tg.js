var express = require('express');
var router = express.Router();
const db = require('../common/data').tg;


router.post('/add', async function(req, res) {
    if(req.body.token&&req.body.chatId&&req.body.number&&req.body.tgshow){
        let param = {
            "token":req.body.token,
            "chatId":req.body.chatId,
            "number":req.body.number,
            "tgshow":req.body.tgshow,
            "time":Date.now()
        };
        await db.insert(param);
        res.send(JSON.stringify({code:200,msg:"保存成功",data:{}}))
    }else{
        res.send(JSON.stringify({code:400,msg:"参数缺失",data:{}}))
    }
    
});

router.post('/updata',async function(req, res) {
    
    if(req.body._id&&req.body.token&&req.body.chatId&&req.body.number&&req.body.tgshow){
        let _id = {
            "_id":req.body._id,
        }
        let param = {
            "token":req.body.token,
            "chatId":req.body.chatId,
            "number":req.body.number,
            "tgshow":req.body.tgshow,
            "time":Date.now()
        };
        let data = await db.update(_id,{ $set: param });
        if(data){
            res.send(JSON.stringify({code:200,msg:"telegram信息更新成功",data:{}}))
        }else{
            res.send(JSON.stringify({code:400,msg:"telegram信息更新失败",data:{}}))
        }
    }else{
        res.send(JSON.stringify({code:400,msg:"参数缺失",data:{}}))
    }
});



router.post('/tgFindOne',async function(req, res) {
    let data = await db.find();
    console.log(data)
    res.end(JSON.stringify({
        code: 200,
        msg: '查询成功',
        data:data
    }))
});




module.exports = router;
