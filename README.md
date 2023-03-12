# serverMmon中文版(青蛇探针)：   

* serverMmon中文版(青蛇探针)是nodeJs开发的一个酷炫高逼格的云探针、云监控、服务器云监控、多服务器探针~。
* 在线演示：http://106.126.11.114:5880/       

![Latest Version](https://cdn.365api.cn/mmon/home.png)
![Latest Version ssh](https://cdn.365api.cn/mmon/ssh.png)
   
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

#### 一、创建文件夹             
```
mkdir serverMmon && cd serverMmon
``` 
#### 二、拉取源码              
```
git clone https://github.com/souying/serverMmon.git
```
          
#### 三、安装依赖              
```
npm install
```
#### 四、修改上面主要说明文件（修改配置文件）              
```
  home/config.js  //修改服务端ip+端口 或者域名 如下
  
  window.__PRE_CONFIG__ = {
     header: '青蛇🐍探针',
     subHeader: '[serverMmon] 中文名：青蛇🐍探针',
     interval: 1,
     url:'xx.xx.xx.xx',  //主控服务端ip地址或者域名
     footer: '<p>Powered by <a href="https://github.com/souying/serverMmon">serverMmon</a>感谢ServerStatus-Hotaru前端主题</p>'
   };
   
  server/config.js  //修改端口配置 默认5880 不做修改可省略... 如下
  
  5880 改为你自己需要的端口  不做修改此步骤可省略...
  
  config/config.js  //添加多个控制端服务器信息如下
  
  {
      "id":1,  //序号数字类型
      "name":"节点名1",
      "url":"http://xx.xx.xx:5888",  //控制端url
      "location":"大陆",  //服务器位置
      "region":"CN",  //服务器国家简称 大写
      "token":"123456789"   // 与被控制端通信token 
  },
  {
      "id":2,  //序号数字类型
      "name":"节点名2",
      "url":"http://xx.xx.xx:5888",  //控制端url
      "location":"大陆",  //服务器位置
      "region":"CN",  //服务器国家简称 大写
      "token":"123456789"   // 与被控制端通信token 
  },
  {
      "id":3,  //序号数字类型
      "name":"节点名3",
      "url":"http://xx.xx.xx:5888",  //控制端url
      "location":"大陆",  //服务器位置
      "region":"CN",  //服务器国家简称 大写
      "token":"123456789"   // 与被控制端通信token 
  },
  
```
#### 三、启动测试              
```
npm start
```
如果没错误提示，OK，ctrl+c关闭；如果有错误提示，检查5880端口是否被占用  

#### 四、安装pm2 维护进程            
```
npm install -g pm2    // 安装过可省略...  

在服务端执行以下命令  

pm2 start index.js --name "serverMmon"  

重新启动  

pm2 restart serverMmon

停止  

pm2 stop serverMmon

``` 

关键说明 如每次修改完配置文件 请执行以下命令 重启服务端  

```
pm2 restart serverMmon

``` 

以上需要node 环境  如宝塔安装 正常使用node项目安装方式即可  pm2 常用命令 请搜索

ip+端口/  即可访问  

ip+端口/ssh  即可访问在线SSH 


  




