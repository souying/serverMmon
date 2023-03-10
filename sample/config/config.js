var config = {
    serverList:[
        {
            "id":1,  //序号数字类型
            "name":"节点名",
            "url":"http://xx.xx.xx:5888",  //控制端url
            "location":"大陆",  //服务器位置
            "region":"CN",  //服务器国家简称
            "token":"123456789"   // 与被控制端通信token 
        }
        
    ]
}
module.exports = config;