var express = require('express');
var router = express.Router();
var vertoken = require('../common/token')
const db = require('../common/data').user;
router.post('/login', async function(req, res) {
    if(req.body.username&&req.body.password){
        let data = await db.findOne({'username':req.body.username,'password':req.body.password});
        if(data){
            vertoken.setToken(data.username, data._id).then(token => {
                console.log(token);
                res.end(JSON.stringify({
                  code: 200,
                  msg: '登录成功',
                  token: token,
                  data:{"username":data.username,"email":data.email}
                }))
            })
        }else{
            res.end(JSON.stringify({
                code: 400,
                msg: '账号或者密码错误',
                data:{}
            }))
        }
        
    }else{
        res.send(JSON.stringify({code:400,msg:"参数缺失",data:{}}))
    }
});
router.post('/reg',async function(req, res) {
    if(req.body.username&&req.body.password&&req.body.email){
        let data = await db.find();
        if(data.length>0){
            res.send(JSON.stringify({code:400,msg:"已有账户，关闭注册",data:{}}))
        }else{
            let param = {
                "username":req.body.username,
                "password":req.body.password,
                "email":req.body.email,
                "today":new Date()
            }
            await db.insert(param);
            res.send(JSON.stringify({code:200,msg:"注册成功",data:{"username":req.body.username,"email":req.body.email}}))
        }
    }else{
        res.send(JSON.stringify({code:400,msg:"参数缺失",data:{}}))
    }
});

router.post('/info',async function(req, res) {
    if(req.body.username&&req.body.oldpassword&&req.body.newpassword){
        let param = {
            "username":req.body.username,
            "password":req.body.oldpassword
        }
        let data = await db.update(param,{ $set: { password: req.body.newpassword } });
        if(data){
            res.send(JSON.stringify({code:200,msg:"密码修改成功",data:{}}))
        }else{
            res.send(JSON.stringify({code:400,msg:"密码修改失败",data:{}}))
        }
    }else{
        res.send(JSON.stringify({code:400,msg:"参数缺失",data:{}}))
    }
});

router.post('/token',async function(req, res) {
    res.send(JSON.stringify({code:200,msg:"登录状态有效",data:{}}))
});

router.get('/info', async (req, res) => {
    const { user_id } = req.data || {};
    if (!user_id) {
        res.send(JSON.stringify({ code:400, msg:"token 不合法", data:{} }))
    } else {
        const { password, ...user} = await db.findOne({ _id: user_id });
        if (user) {
            res.json({ code: 0, data: user })
        } else {
            res.json({ code: 400, msg:"查找用户失败", data: {} })
        }
    }
});

module.exports = router;
