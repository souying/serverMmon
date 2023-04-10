const axios = require("axios");


// TG Bot Token
const BOT_TOKEN = ""
// TG 聊天 ID
const CHAT_ID = ""
// TG 消息解析模式
const PARSE_MODE = "Markdown"

// 标准时间转换成年月日时分秒（补0）
function getTime(timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear(),
        M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1),
        D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()),
        h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()),
        m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()),
        s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
    return Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s
}

const uptimeKumaData = (data,servers) => {
    return `
    *------------------${data.name}------------------*    
  🔹 *服务地区*:${data.location}   
  🔹 *服务简称*:${data.region}    
  🔹 *地址*: [${data.url}](${data.url})  
  🔹 *状态*: ${data.getStatus ? "🟢 UP" : "🔴 DOWN"}  
  🔹 *时间*: ${getTime(Date.now())}  
  🔹 *推送间隔*: ${servers[data.url]*3} 秒  
  🔹 *重试次数*: ${servers[data.url]} 次  
  🔹 *监控面板*: [青蛇面板](https://github.com/souying/serverMmon)  
    `
  }

// 调用 TG API 发送消息
const callTGBot = (text,data) => {
    
    let url = "https://api.telegram.org/bot" + data.token + "/sendMessage";
    axios
      .post(url, {
        chat_id: data.chatId,
        parse_mode: PARSE_MODE,
        text: text,
      })
      .then((res) => {
        // console.log(`状态码: ${res.statusCode}`);
        // console.log(res);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  module.exports = {
    callTGBot,
    uptimeKumaData
}

