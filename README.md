# serverMmon中文版：   
# 又名青蛇探针： 

* serverMmon中文版(青蛇探针)是nodeJs开发的一个酷炫高逼格的云探针、云监控、服务器云监控、多服务器探针~。
* 在线演示：http://106.126.11.114:5880/       

![Latest Version](http://dl.cpp.la/Archive/serverstatus_1.0.9.png)
   
# 主要文件介绍：


* home/config.js	前端接口推送配置以及设置网页标题底部等等                                
* server/config.js   服务端端口配置 其他配置不会的不要改     
* config/config.js   添加控制端服务器信息 token 和端口ip  与安装的控制端一致  

# 自动部署：

【服务端】Docker暂不支持：
```

```  

【监控端】：
```
//国内服务器一键安装脚本  

bash <(curl -sL https://cdn.jsdelivr.net/gh/souying/serverMmon@main/scripts/mmon_install.sh) 

//国外服务器一键安装脚本  

bash <(curl -sL https://raw.githubusercontent.com/souying/serverMmon/main/scripts/mmon_install.sh) 

以上执行后按脚本提示安装  
安装完毕后 直接执行mmon 或者 MMON 可弹出脚本菜单  

```

# 手动安装教程：     
   
**【服务端配置】**           
          
#### 一、安装依赖              
```
npm install
```
#### 二、修改上面主要说明文件（修改配置文件）              
```
  home/config.js  
  server/config.js 
  config/config.js  
```
#### 三、启动测试              
```
npm start
```
如果没错误提示，OK，ctrl+c关闭；如果有错误提示，检查5880端口是否被占用

#### 四、安装pm2 维护进程           
```
npm install -g pm2    

在服务端执行以下命令  

pm2 start index.js --name "serverMmon"  


``` 
以上需要node 环境  如宝塔安装 正常使用node项目安装方式即可  pm2 常用命令 请搜索

  




