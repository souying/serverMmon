//获取地址栏参数，name:参数名称
function getUrlParms(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)
    return unescape(r[2]);
    return null;
}

define([
  'jquery',
  'underscore',
  'backbone',
  'js/views/FileTreeView',
  'bootstrap',
  'context'
], function($, _, Backbone, FileTreeView, boot, context) {

    var SFTPController = Backbone.View.extend({

        initialize : function() {

            /* SFTP events */

            function createCookie(name,value,days) {
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime()+(days*24*60*60*1000));
                    var expires = "; expires="+date.toGMTString();
                }
                else var expires = "";
                document.cookie = name+"="+value+expires+"; path=/";
            }
            function readCookie(name) {
                var nameEQ = name + "=";
                var ca = document.cookie.split(';');
                for(var i=0;i < ca.length;i++) {
                    var c = ca[i];
                    while (c.charAt(0)==' ') c = c.substring(1,c.length);
                    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
                }
                return null;
            }
            function randString(x){
                var s = "";
                while(s.length<x&&x>0){
                    var r = Math.random();
                    s+= String.fromCharCode(Math.floor(r*26) + (r>0.5?97:65));
                }
                return s;
            } 

            //click event for settings
            $("#settings").click(function() {
                console.log("eeee");
                $("#menu-toggle").toggle();
            });
            //connect modal
            $("#connect-modal").click(function(){
                console.log("sdsd");
                $("#connectModal").modal('show');
            });

            $("#menu-toggle").click(function(e) {
                e.preventDefault();
                $("#wrapper").toggleClass("active");
            });
            //context menu for fileTreeView
            context.init({
                fadeSpeed: 100,
                above: 'auto',
                compress: false
            });
            context.attach('.node-name', [{
                text: "新建文件夹"
                , action: function() {
                    $("#newFolderModal").modal();
                }        
            }, {
                text: "新建文件"
                , action: function() {
                    $("#newFileModal").modal();
                    $("#fileName").val("")
                    $("#fileName").focus();            
                }
            }, {
                text: "删除"
                , action: function() {
                    $("#deleteFolderName").html(lastContextFolderName);
                    $("#removeFolderModal").modal();
                }        
            }]);  
            context.attach('.file-name', [{
                text: "保存"
            }, {
                text: "删除"
                , action : function() {
                    $("#deleteFileName").html(lastContextFileLocation);
                    $("#removeFileModal").modal();
                }
            }]); 

            //context menu event for folder
            $(document).on("contextmenu", ".node-name", function(e){
               console.log("打开了新的文件上下文");
               //set this variables to use in new folder and new file
               window.lastContextFolderName = $(e.target).prev().attr("data-location");
               window.lastContextFolderDOM = $(e.target).parent().parent();
            });
            //context menu event for file
            //it will set lastContext file
            $(document).on("contextmenu", ".file-name", function(e){
               window.lastContextFileLocation = $(e.target).attr("data-location");
               window.lastContextFileDOM = $(e.target);
            });
            if(getUrlParms("username")){
                $("#username").val(getUrlParms("username"));
            }else{
                $("#username").val(readCookie("username"));
            }
            if(getUrlParms("password")){
                $("#password").val(getUrlParms("password"));
            }else{
                $("#password").val(readCookie("password"));
            }
            if(getUrlParms("ip")){
                $("#host").val(getUrlParms("ip"));
            }else{
                $("#host").val(readCookie("host"));
            }            
            //set sftp parameters from cookie
            $("#directory").val(readCookie("directory"));
            $("#port").val(readCookie("port")?readCookie("port"):22);

            /* create file */
            $("#create-file").click(function() {
                $("#fileName").focus();
                if($("#fileName").val().length === 0) {
                    return;
                }
                var fileName = window.lastContextFolderName + "/" + $("#fileName").val();
                $.ajax({
                    type: "POST",
                    url: "/sftp/touch",
                    data: {
                        name : fileName
                    },
                    dataType: "json",
                    success: function(resp){
                        //insert new file to approproate folder
                        window.lastContextFolderDOM.find('.files-container').append(
                        '<div id="file-' + randString(5) +
                        '" class="file-name" style="margin-left:' + '12px" data-location="'+
                        fileName + '" title="'+fileName+'">' + $("#fileName").val() + '</div>');

                        // window.lastContextFolderDOM.find(".toggle-folder")                
                        $("#newFileModal").modal('hide');
                        if(!window.lastContextFolderDOM.find('.files-container').is(':visible')) {
                            window.lastContextFolderDOM.find('.toggle-folder').first().click();
                        }
                    }
                });
            });

            /* create folder */
            $("#create-folder").click(function() {
                $("#folderName").focus();
                var fileName = window.lastContextFolderName + "/" + $("#folderName").val();
                $.ajax({
                    type: "POST",
                    url: "/sftp/mkdir",
                    data: {
                        name : fileName
                    },
                    dataType: "json",
                    success: function(resp){
                        //insert the shit
                        window.lastContextFolderDOM.find(".folders-container").first().append(
                            '<div class="tree-node" style="padding-left:12px;">' +
                              '<div class="name-info">' +
                                '<span class="toggle-folder" data-fetched="0" data-location="'+fileName+'">&#9654;</span>' +
                                '<span class="node-name">' + $("#folderName").val() + '</span>' +
                              '</div>' +
                              '<div class="folders-container" style="display:none;">'+
                              '</div>' +
                              '<div class="files-container" style="display:none;">'+
                              '</div>'+            
                            '</div>'
                        );
                        // window.lastContextFolderDOM.find(".toggle-folder")                
                        $("#newFolderModal").modal('hide');
                        if(!window.lastContextFolderDOM.find('.folders-container').is(':visible')) {
                            window.lastContextFolderDOM.find('.toggle-folder').first().click();
                        }
                    }
                });
            });

            $("#start-sftp").click(function(e){
                $("#start-sftp").attr("disabled", true);
                console.log("start sftp event");
                e.preventDefault();
                $.ajax({
                    type: "POST",
                    data: {
                      username: $("#username").val(),
                      password: $("#password").val(),
                      root: $("#directory").val(),
                      host: $("#host").val(),
                      port: $("#port").val()
                    },

                    dataType: "json",
                    url: "/sftp",

                    success: function(resp){
                        createCookie("username", $("#username").val(), 2);
                        createCookie("password", $("#password").val(), 2);
                        createCookie("directory", $("#directory").val(), 2);
                        createCookie("host", $("#host").val(), 2);
                        createCookie("port", $("#port").val(), 2);
                        // var FileTreeView = require("js/views/FileTreeView");
                        window.fileTreeView = new FileTreeView(resp.tree);
                        $("#connectModal").modal("hide");
                    }, 

                    error : function(resp) {
                        window.alert(resp.responseText);
                        $("#start-sftp").attr("disabled", false);
                    }
                });
                return false;
            });

            //delete folder click event
            $("#delete-folder").click(function() {
                var fileName = window.lastContextFolderName;
                $.ajax({
                    type: "POST",
                    url: "/sftp/rmdir",
                    data: {
                        name : fileName
                    },
                    dataType: "json",
                    success: function(resp){
                        window.lastContextFolderDOM.remove();             
                        $("#removeFolderModal").modal('hide');
                    }
                });
            });

            //delete folder click event
            $("#delete-file").click(function() {
                var fileName = window.lastContextFileLocation;
                $.ajax({
                    type: "POST",
                    url: "/sftp/rm",
                    data: {
                        name : fileName
                    },
                    dataType: "json",
                    success: function(resp){
                        window.lastContextFileDOM.remove();             
                        $("#removeFileModal").modal('hide');
                    }
                });
            });             
        }

    });
    
    return SFTPController;
  
});
