$(function(){
    $.ajax({
        headers: {
            "authorization": 'Bearer ' + window.localStorage.getItem('token')
        },
        type: "POST",
        url: api+"/user/token", //请求url
        contentType: "application/x-www-form-urlencoded",
        success: (data) => {
            let res = JSON.parse(data)
            if (res.code === 401) {
                
                window.location.replace('./login.html')
                console.log(res.msg);
            }
        }
    })
})