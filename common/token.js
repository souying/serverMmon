var jwt = require('jsonwebtoken');
var jwtScrect = 'aXloaWR1NzZidmgyaGpnaDEyNCEh';  //签名

//登录接口 生成token的方法
var setToken = function (user_name, user_id) {
    return new Promise((resolve, reject) => {
        //expiresln 设置token过期的时间
        //{ user_name: user_name, user_id: user_id } 传入需要解析的值（ 一般为用户名，用户id 等）
        const token = jwt.sign({ user_name: user_name, user_id: user_id }, jwtScrect, { expiresIn: '24h' });
        resolve(token)
    })
}
//各个接口需要验证token的方法
var getToken = function (token) {
    return new Promise((resolve, reject) => {
        if (!token) {
            console.log('token is null')
            reject({
                error: 'token is null'
            })
        }
        else {
            //第二种  改版后的
            var info = jwt.verify(token.split(' ')[1], jwtScrect);
            resolve(info);  //解析返回的值（sign 传入的值）
        }
    })
}

module.exports = {
    setToken,
    getToken
}
