define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone) {

  var FileTreeView = Backbone.View.extend({

      el: "#folder-tree",

      events: {
          "click .toggle-folder": "toggleFolderContent",
          "click .node-name" : "toggleFolderContent",
          "dblclick .file-name": "openFile",
          "click .tab-link": "updateEditorValue"
      },

      initialize: function(options, isRootFolder){
          _.bindAll(this, "render", "createFolderStructure", "toggleFolderContent", "openFile", "updateEditorValue");
          this.options = options;
          this.fileIndex = 0;
          this.rootFolderName = options.name;

          this.render();

          this.fileTreeMap = {}
          this.$el.show();
          $("#connect-modal").hide();
          console.log("file tree view initi");
          //fileTreeMap[options.name] = 
      },

      render: function(){
          this.$el.html("");
          var tr = '&#9660;';
          var rootNode = $('<div class="sidebar-brand" style="padding-left:12px;">' +
            '<div class="name-info">' +
              '<span class="toggle-folder" data-fetched="1" data-location="'+this.options.name+'">'+'</span>' +
              '<span class="node-name" style="font-weight:bold;">' + '青蛇探针' + '</span>' +
            '</div>' +
            '<div class="folders-container">'+
            '</div>' +
            '<div class="files-container">'+
            '</div>'+
          '</div>'
          );
          this.$el.append(rootNode);
          this.buildFileTree(rootNode, this.options, true);
      },

      buildFileTree: function(el, options, isRootFolder){
        var self = this;
        var tr = '&#9660;';
        var level = el.parents('.tree-node').length+1;

        var ra = '&#9654;';
        //el.append(rootNode);
        _.each(options.folders.sort(), function(name){
          var names = name.split('/');
          var n = names[names.length-1];
          el.find(".folders-container").first().append(
            '<div class="tree-node" style="padding-left:12px; line-height:30px; font-size:15px;">' +
              '<div class="name-info">' +
                '<span class="toggle-folder" data-fetched="0" data-location="'+name+'" title="'+name+'">'+ra+'</span>' +
                '<span class="node-name">'  + n + '</span>' +
              '</div>' +
              '<div class="folders-container" style="display:none;">'+
              '</div>' +
              '<div class="files-container" style="display:none;">'+
              '</div>'+            
            '</div>'
          );
        });

        _.each(options.files.sort(), function(name){
          var names = name.split('/');
          var n = names[names.length-1];
          el.find(".files-container").last().append(
            '<div id="file-'+self.fileIndex+
            '" class="file-name" style="margin-left:'+'12px" data-location="'+
            name+'" title="'+name+'">'+n+'</div>'
          );
          self.fileIndex++;
        });
        console.log(options);
      },

      createFolderStructure: function(folder, folderName, wrapper, isRoot, scope){

          if(this.is_empty(folder)) return;

          var self = this;
          var tr = isRoot?'&#9660;':'&#9654;';
          var rootNode = $('<div class="tree-node">' + '<div class="name-info"><span class="toggle-folder">'+tr+'</span><span class="node-name">' + folderName + '</span></div>' +
            '<div class="folders-container"></div>' + '<div class="files-container"></div>' +
          '</div>');
          wrapper.append(rootNode);

          if(!isRoot){
            rootNode.find(".folders-container").first().hide();
            rootNode.find(".files-container").last().hide();
          }
          var marginP = rootNode.parents(".tree-node").length+1;

          rootNode.css("margin-left", "12px");

          var keys = Object.keys(folder);

          for(var i=0; i<keys.length; i++){
            if(keys[i]!=='files'){
              scope.createFolderStructure(folder[keys[i]], keys[i], rootNode.find(".folders-container").first(), false, scope);
            } else {
              console.log(folderName, folder['files']);
              for(var j=0; j<folder['files'].length; j++){
                  self.index += 1;
                var p = folder['files'][j].split("/");
                rootNode.find(".files-container").last().append('<div id="file-'+self.index+'" class="file-name" style="margin-left:'+'12px" data-location="'+folder['files'][j]+'">'+p[p.length-1]+'</div>');
              }
            }
          }
      },

      is_empty: function(obj) {

        // null and undefined are empty
        if (obj == null) return true;
        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length && obj.length > 0)    return false;
        if (obj.length === 0)  return true;

        for (var key in obj) {
            if (hasOwnProperty.call(obj, key))    return false;
        }

        return true;
      },

      toggleFolderContent: function(e){
          // console.log(999);
          // $(e.target).parent().parent().find(".folders-container").first().toggle();
          // $(e.target).parent().parent().find(".files-container").last().toggle();
          
          var self = this;

          var target = $(e.target)
            , dataFetched = false
            , dataLocation = false;

          if(!target.hasClass("toggle-folder")) {
            target = $(e.target).prev();
            dataFetched = target.attr("data-fetched");
            dataLocation = target.attr("data-location");
          } else {
            target = $(e.target);
            dataFetched = target.attr("data-fetched");
            dataLocation = target.attr("data-location");
          }

          if(dataFetched === '2') {
            return;
          }
          if(dataFetched === '0'){

            target.attr('data-fetched', '2');

            $.ajax({
              type: "POST",
              url: "/sftp/dir",
              dataType: 'json',
              data: {
                root: dataLocation
              },
              success: function(resp){
                //console.log(resp);
                var p = target.parent().parent();
                self.buildFileTree(p, resp.tree);
                p.find(".folders-container").first().show();
                p.find(".files-container").last().show();

                target.attr("data-fetched", "1");
                target.html('&#9660;');
              }
            });
          } else {
            var p = target.parent().parent();
            if(p.find(".folders-container").first().is(":visible")){
              p.find(".folders-container").first().hide();
              p.find(".files-container").last().hide();
              if(target.hasClass("toggle-folder")) target.html('&#9654;');
            } else {
              p.find(".folders-container").first().show();
              p.find(".files-container").last().show();
              if(target.hasClass("toggle-folder")) target.html('&#9660;');
            }
            
          }
      },

      openFile: function(e){

        var self = this;
        var fileName = $(e.target).attr('data-location');
        $('.file-selected').removeClass('file-selected');
        $(e.target).addClass('file-selected');

        console.log("eeeeeee");
        window.app.FileTabs.trigger('add', {
            id : $(e.target).attr('id')
            , location : $(e.target).attr('data-location')
            , name : $(e.target).html()
        });

        // if(self.fileTreeMap[fileName] === undefined){
        //     self.fileTreeMap[fileName] = {};
        //     $.ajax({
        //         type: "POST",
        //         url: "/sftp/read",
        //         // dataType: "json",
        //         data: {
        //             fileName: fileName
        //         },
        //         success: function(r){

        //             env.editor.session.doc.setValue(r);

        //             var mode = modelist.getModeForPath(fileName);
        //             self.fileTreeMap[fileName].value = r;
        //             self.fileTreeMap[fileName].mode = mode;

        //             env.editor.session.setMode(mode.mode);
        //             env.editor.session.modeName = mode.name;

        //             $("#editor-tabs li").removeClass("active");
        //             //add to tabs if not exist
        //             if($("li#"+$(e.target).attr("id")+"-tab").length === 0) {
                      
        //               var li = $('<li data-file-name="'+fileName+'"'+
        //                 'class="tab-link active" id"' + $(e.target).attr("id") + '-tabs">' + $(e.target).html()+
        //                 '<span class="close-tab" style="float:right; font-weight:bold;">x</span>'+
        //                 '</li>');

        //               li.click(function(e){
        //                 $("#editor-tabs li").removeClass("active");
        //                 $(e.target).addClass("active");
        //                 var fileName = $(e.target).attr("data-file-name");
        //                 env.editor.session.doc.setValue(self.fileTreeMap[fileName].value);

        //                 var mode = self.fileTreeMap[fileName].mode;
        //                 env.editor.session.setMode(mode.mode);
        //                 env.editor.session.modeName = mode.name;                          
        //               });

        //               li.find("span").click(function(e){
        //                 e.stopPropagation();
        //                 $(e.target).parent().remove();
        //               });
        //               $("#editor-tabs").append(li)
        //             }
        //         }
        //     });
        //   } else {
        //     env.editor.session.doc.setValue(self.fileTreeMap[fileName].value);

        //     var mode = self.fileTreeMap[fileName].mode;
        //     env.editor.session.setMode(mode.mode);
        //     env.editor.session.modeName = mode.name;            

        //   }
      },

      updateEditorValue: function(e){
        
      }

  });
  
  return FileTreeView;
  
});
