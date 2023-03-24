var api = "";
var url = window.location.href;
// 格式化日期，如月、日、时、分、秒保证为2位数
function formatNumber (n) {
    n = n.toString()
    return n[1] ? n : '0' + n;
}
// 参数number为毫秒时间戳，format为需要转换成的日期格式
function formatTime (number, format) {
    let time = new Date(number)
    let newArr = []
    let formatArr = ['Y', 'M', 'D', 'h', 'm', 's']
    newArr.push(time.getFullYear())
    newArr.push(formatNumber(time.getMonth() + 1))
    newArr.push(formatNumber(time.getDate()))

    newArr.push(formatNumber(time.getHours()))
    newArr.push(formatNumber(time.getMinutes()))
    newArr.push(formatNumber(time.getSeconds()))

    for (let i in newArr) {
        format = format.replace(formatArr[i], newArr[i])
    }
    return format;
}

function trim(str) {
    var reg = /\s+/g;
    if (typeof str === 'string') {
        var trimStr = str.replace(reg,'');
    }
    return trimStr
}
// 注册
$(function(){
    toastr.options = {
        closeButton: true,
        progressBar: true,
        showMethod: 'slideDown',
        timeOut: 4000
    };
    function reg(){
        let username = $("#username").val();
        let password = $("#password").val();
        let email = $("#email").val();
        if(username.length<6){
            toastr.error("用户名不低于6位")
            return;
        }
        if(password.length<9){
            toastr.error("密码不低于9位")
            return;
        }
        if(!email){
            toastr.error("邮箱不能位空")
            
            return;
        }
        let param = {
            "username":trim(username),
            "password":trim(password),
            "email":trim(email)
        }
        $.ajax({
            // headers: {
            //     "authorization": 'Bearer ' + JSON.parse(window.localStorage.getItem('token')) 
            // },
            type: "POST",
            url: api+"/user/reg", //请求url
            contentType: "application/x-www-form-urlencoded",
            data:param,
            success: (data) => {
                let res = JSON.parse(data)
                if (res.code === 200) {
                    toastr.success(res.msg);
                } else {
                    toastr.error("错误信息：" + res.msg);
                }
            }
        })
    }
    $(document).on("click","#regbtn",function(){
        reg()
    })
    
    // 登录
    function login(){
        let username = $("#username").val();
        let password = $("#password").val();
        if(!username){
            toastr.error("用户名不能为空")
            return;
        }
        if(!password){
            toastr.error("密码不能为空")
            return;
        }
        let param = {
            "username":trim(username),
            "password":trim(password)
        }
        
        $.ajax({
            // headers: {
            //     "authorization": 'Bearer ' + JSON.parse(window.localStorage.getItem('token')) 
            // },
            type: "POST",
            url: api+"/user/login", //请求url
            contentType: "application/x-www-form-urlencoded",
            data:param,
            success: (data) => {
                let res = JSON.parse(data)
                if (res.code === 200) {
                    toastr.success(res.msg+",即将跳转");
                    localStorage.setItem("token",res.token)
                    setTimeout(function(){
                        window.location.replace('./index.html')
                    },1000)
                } else {
                    toastr.error("错误信息：" + res.msg);
                }
            }
        })
    }
    $(document).on("click","#loginbtn",function(){
        login()
    })

    function changepassword(){
        let username = $("#username").val();
        let oldpassword = $("#oldpassword").val();
        let newpassword = $("#newpassword").val();
        let newpasswordll = $("#newpasswordll").val();
        if(!username){
            toastr.error("原用户名不能为空")
            return;
        }
        if(newpassword.length<9){
            toastr.error("新密码不低于9位")
            return;
        }
        if(!oldpassword){
            toastr.error("原密码不能为空")
            return;
        }
        if(!newpassword){
            toastr.error("新密码不能为空")
            return;
        }
        if(!newpasswordll){
            toastr.error("确认密码不能为空")
            return;
        }
        if(newpasswordll!=newpassword){
            toastr.error("两次密码输入不一致")
            return;
        }
        let param = {
            "username":trim(username),
            "oldpassword":trim(oldpassword),
            "newpassword":trim(newpassword)
        }

        $.ajax({
            headers: {
                "authorization": 'Bearer ' + window.localStorage.getItem('token')
            },
            type: "POST",
            url: api+"/user/info", //请求url
            contentType: "application/x-www-form-urlencoded",
            data:param,
            success: (data) => {
                let res = JSON.parse(data)
                if (res.code === 200) {
                    toastr.success(res.msg+",请重新登录");
                    localStorage.setItem("token",'')
                    setTimeout(function(){
                        window.location.replace('./login.html')
                    },1000)
                } else {
                    toastr.error(res.msg);
                }
            }
        })


    }

    $(document).on("click","#changepassword",function(){
        changepassword();
    })

    function addserver(){
        let name = $("#name").val();
        let url = $("#url").val();
        let location = $("#location").val();
        let region = $("#region").val();
        let token = $("#token").val();
        let username = $("#username").val()?$("#username").val():null;
        let password = $("#password").val()?$("#password").val():null;
        if(!name){
            toastr.error("服务器别名不能为空")
            return;
        }
        if(!url){
            toastr.error("服务器ip端口不能为空")
            return;
        }
        if(!location){
            toastr.error("服务器地区不能为空")
            return;
        }
        if(!region){
            toastr.error("服务器简称不能为空")
            return;
        }
        if(!token){
            toastr.error("服务器通信token不能为空")
            return;
        }

        let param = {
            "name":trim(name),
            "url":trim(url),
            "location":trim(location),
            "region":trim(region),
            "token":trim(token),
            "username":trim(username),
            "password":trim(password)
        }

        $.ajax({
            headers: {
                "authorization": 'Bearer ' + window.localStorage.getItem('token')
            },
            type: "POST",
            url: api+"/serverlist/serverAdd", //请求url
            contentType: "application/x-www-form-urlencoded",
            data:param,
            success: (data) => {
                let res = JSON.parse(data)
                if (res.code === 200) {
                    toastr.success(res.msg);
                    
                } else {
                    toastr.error(res.msg);
                }
            }
        })

    }

    $(document).on("click","#addserver",function(){
        addserver();
    })

    function serverFindHome(){
        $.ajax({
            headers: {
                "authorization": 'Bearer ' + window.localStorage.getItem('token')
            },
            type: "POST",
            url: api+"/serverlist/serverFind", //请求url
            contentType: "application/x-www-form-urlencoded",
            success: (data) => {
                let res = JSON.parse(data)
                if (res.code === 200) {
                    // toastr.success(res.msg);
                    // console.log(res.data)
                    let html = '';
                    for(let i = 0;i<res.data.length;i++){
                        html+=`
                        <tr>
                            <td>${i+1}</td>
                            <td>${res.data[i].url}</td>
                            <td>${res.data[i].name}</td>
                            <td>${res.data[i].location}</td>
                            <td>${res.data[i].region}</td>
                            <td>${res.data[i].token}</td>
                            <td>${res.data[i].username?res.data[i].username:'无数据'}</td>
                            <td>${res.data[i].password?res.data[i].password:'无数据'}</td>
                            <td>${formatTime(res.data[i].updata, 'Y年M月D日 h:m:s')}</td>
                            <td><a href="#"><i class="fa fa-check text-navy"></i></a></td>
                        </tr>
                        `
                    }
                    $("#serverlist").html(html)
                } else {
                    toastr.error(res.msg);
                }
            }
        })
    }

    var serverItem = {};

    function serverFindList(){
        $.ajax({
            headers: {
                "authorization": 'Bearer ' + window.localStorage.getItem('token')
            },
            type: "POST",
            url: api+"/serverlist/serverFind", //请求url
            contentType: "application/x-www-form-urlencoded",
            success: (data) => {
                let res = JSON.parse(data)
                if (res.code === 200) {
                    // toastr.success(res.msg);
                    // console.log(res.data)
                    let html = '';
                    for(let i = 0;i<res.data.length;i++){
                        serverItem[res.data[i]._id] = res.data[i];
                        html+=`
                        <tr>
                            <input class="_id" type="hidden" value="${res.data[i]._id}">
                            <td class="project-status">
                                <span class="label label-primary">${res.data[i].name}</span>
                            </td>
                            <td class="project-title">
                                <small>IP端口：<br>${res.data[i].url}</small>
                            </td>
                            <td class="project-title hidden-xs">
                                <small>国家简称：<br>${res.data[i].region}</small>
                            </td>
                            <td class="project-title hidden-xs">
                                <small>通信token：<br>${res.data[i].token}</small>
                            </td>
                            <td class="project-title hidden-xs">
                                <small>服务器用户名：<br>${res.data[i].username?res.data[i].username:'无数据'}</small>
                            </td>
                            <td class="project-title hidden-xs">
                                <small>服务器密码：<br>${res.data[i].password?res.data[i].password:'无数据'}</small>
                            </td>
                            <td class="project-actions">
                                <a data-toggle="modal" href="#modal-form" class="serveredit btn btn-white btn-sm"><i
                                        class="fa fa-pencil"></i> 编辑 </a>
                                <a  href="javascript:;" class="ssh btn btn-info btn-sm hidden-xs"><i
                                    class="fa fa-desktop"></i> Ssh </a>
                                <a  href="javascript:;" class="shell btn btn-info btn-sm hidden-xs"><i
                                    class="fa fa-desktop"></i> 脚本 </a>
                                <a href="javascript:;" class="deletebtn btn btn-danger btn-sm"><i
                                    class="fa fa fa-times"></i> 删除 </a>
                            </td>
                        </tr>
                        `
                    }
                    $("#serverlist").html(html)
                    
                } else {
                    toastr.error(res.msg);
                }
            }
        })
    }

    if(url.indexOf("index.html")!=-1){
        serverFindHome()
    }
    if(url.indexOf("serverlist.html")!=-1){
        serverFindList()
    }

    // edit 
    function serveredit(_id){
        $("#_idedit").val(serverItem[_id]._id);
        $("#nameedit").val(serverItem[_id].name);
        $("#urledit").val(serverItem[_id].url);
        $("#locationedit").val(serverItem[_id].location);
        $("#regionedit").val(serverItem[_id].region);
        $("#tokenedit").val(serverItem[_id].token);
        $("#usernameedit").val(serverItem[_id].username);
        $("#passwordedit").val(serverItem[_id].password);
    }
    $(document).on("click",".serveredit",function(){
        let _self = $(this);
        let _id = _self.parents("tr").find("._id").val();
        serveredit(_id);
    })

    function editbtn(){
        let _id = $("#_idedit").val();
        let name = $("#nameedit").val();
        let url = $("#urledit").val();
        let location = $("#locationedit").val();
        let region = $("#regionedit").val();
        let token = $("#tokenedit").val();
        let username = $("#usernameedit").val()?$("#usernameedit").val():null;
        let password = $("#passwordedit").val()?$("#passwordedit").val():null;
        if(!name){
            toastr.error("服务器别名不能为空")
            return;
        }
        if(!url){
            toastr.error("服务器ip端口不能为空")
            return;
        }
        if(!location){
            toastr.error("服务器地区不能为空")
            return;
        }
        if(!region){
            toastr.error("服务器简称不能为空")
            return;
        }
        if(!token){
            toastr.error("服务器通信token不能为空")
            return;
        }

        let param = {
            "_id":trim(_id),
            "name":trim(name),
            "url":trim(url),
            "location":trim(location),
            "region":trim(region),
            "token":trim(token),
            "username":trim(username),
            "password":trim(password)
        }
        console.log(param)
        $.ajax({
            headers: {
                "authorization": 'Bearer ' + window.localStorage.getItem('token')
            },
            type: "POST",
            url: api+"/serverlist/serverUpData", //请求url
            contentType: "application/x-www-form-urlencoded",
            data:param,
            success: (data) => {
                let res = JSON.parse(data)
                if (res.code === 200) {
                    toastr.success(res.msg);
                    setTimeout(function(){
                        window.location.replace('./serverlist.html')
                    },1000)
                    
                } else {
                    toastr.error(res.msg);
                }
            }
        })
    }

    $(document).on("click","#editbtn",function(){
        editbtn();
    })

    function deletebtn(_id){
        let param = {
            "_id":trim(_id)
        }
        $.ajax({
            headers: {
                "authorization": 'Bearer ' + window.localStorage.getItem('token')
            },
            type: "POST",
            url: api+"/serverlist/serverRemove", //请求url
            contentType: "application/x-www-form-urlencoded",
            data:param,
            success: (data) => {
                let res = JSON.parse(data)
                if (res.code === 200) {
                    toastr.success(res.msg);
                    setTimeout(function(){
                        window.location.replace('./serverlist.html')
                    },1000)
                    
                } else {
                    toastr.error(res.msg);
                }
            }
        })
    }

    $(document).on("click",".deletebtn",function(){
        let _self = $(this);
        let _id = _self.parents("tr").find("._id").val();
        deletebtn(_id);
    })

    $(document).on("click",".ssh",function(){
        let _self = $(this);
        let _id = _self.parents("tr").find("._id").val();
        let url = serverItem[_id].url;
        let username = serverItem[_id].username?serverItem[_id].username:"";
        let password = serverItem[_id].password?serverItem[_id].password:"";
        let ip = url.split(":")[0]
        window.open('/ssh/?username='+username+'&ip='+ip+'&password='+password)
    })

    function copy(e) {
        let transfer = document.createElement('input');
        document.body.appendChild(transfer);
        transfer.value = target.value;  // 这里表示想要复制的内容
        transfer.focus();
        transfer.select();
        if (document.execCommand('copy')) {
            document.execCommand('copy');
        }
        transfer.blur();
        console.log('复制成功');
        document.body.removeChild(transfer);
        
    }

    $(document).on("click",".shell",function(){
        let _self = $(this);
        let _id = _self.parents("tr").find("._id").val();
        let token = serverItem[_id].token;
        let url = serverItem[_id].url;
        let port = url.split(":")[1];
        let shell = `bash <(curl -sL https://cdn.jsdelivr.net/gh/souying/serverMmon@main/scripts/mmon_install.sh) install_mmon ${token} ${port}`;
        let transfer = document.createElement('input');
        document.body.appendChild(transfer);
        transfer.value = shell;  // 这里表示想要复制的内容
        transfer.focus();
        transfer.select();
        if (document.execCommand('copy')) {
            document.execCommand('copy');
        }
        transfer.blur();
        console.log('复制成功');
        document.body.removeChild(transfer);
    })

    function serverFindShell(){
        $.ajax({
            headers: {
                "authorization": 'Bearer ' + window.localStorage.getItem('token')
            },
            type: "POST",
            url: api+"/serverlist/serverFind", //请求url
            contentType: "application/x-www-form-urlencoded",
            success: (data) => {
                let res = JSON.parse(data)
                if (res.code === 200) {
                    // toastr.success(res.msg);
                    // console.log(res.data)
                    let html = '';
                    for(let i = 0;i<res.data.length;i++){
                        html+=`
                        <option value="${res.data[i].url}">${res.data[i].name}</option>
                        `
                    }
                    $("#servershell").html(html)
                    $("#servershell").trigger("chosen:updated");
                } else {
                    toastr.error(res.msg);
                }
            }
        })
    }

    if(url.indexOf("shell.html")!=-1){
        serverFindShell()
    }

    $(document).on("click","#shell",function(){
        let cmd = $("#cmd").val();
        let servershell = $("#servershell").val();
        if(cmd.length<=0){
            toastr.error("执行命令不能为空");
            return;
        }
        if(servershell.length<=0){
            toastr.error("请选择执行命令的服务器");
            return;
        }

        let param = {
            "cmd":cmd,
            "servershell":servershell
        }
        console.log(param)
        toastr.success("提交成功请等待");
        $.ajax({
            headers: {
                "authorization": 'Bearer ' + window.localStorage.getItem('token')
            },
            type: "POST",
            url: api+"/serverlist/shell", //请求url
            contentType: "application/x-www-form-urlencoded",
            data:param,
            success: (data) => {
                let res = JSON.parse(data)
                if (res.code === 200) {
                    toastr.success(res.msg);
                    console.log(res.data)
                    let html = ""
                    for(let i = 0;i<res.data.length;i++){
                        html+=`
                            <p>服务器ip为：${res.data[i].server} 输出结果为：${res.data[i].output} 运行时间${formatTime(new Date(), 'Y年M月D日 h:m:s')}</p>
                        `
                    }
                    $("#servercmd").prepend(html)
                    
                } else {
                    toastr.error(res.msg);
                }
            }
        })
        
    })
    


})

