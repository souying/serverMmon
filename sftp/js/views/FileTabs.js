define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone) {

    var FileTabs = Backbone.View.extend({
        el: '#editor-tabs'
        , events : {
            'click .tab-link'       : 'openTab'
            , 'click .close-tab'    : 'closeTab'
        }
        , initialize : function() {
            _.bindAll(this, 'openTab', 'removeTab', 'closeTab');
            this.openTabs = new (Backbone.Collection.extend({}))();
            this.sessions = new (Backbone.Collection.extend({}))();
            this.on('add', this.addTab, this);
        }
        , addTab : function(fileModel) {
            console.log('adding', fileModel);
            var id = fileModel.id
                , fileName = fileModel.name
                , location = fileModel.location
                , self = this;

            //flag indicating a file is opened
            //note that this flag should be set to true at opening
            env.noFile = false;
            //if it was not fetched already fetch file content and save it in 
            //sessions collection
            if(this.sessions.get(id) === undefined) {
                var EditSession = require("ace/edit_session").EditSession;
                var UndoManager = require("ace/undomanager").UndoManager;
                var mode = modelist.getModeForPath(fileName);
                //get file content
                $.ajax({
                    type : 'POST'
                    , url : '/sftp/read'
                    , data : {
                        fileName: location
                    }
                    , dataType: "text"
                    , success : function(value) {
                        //create new EditSession with new undoManager
                        var session = new EditSession(value, modelist.getModeForPath(fileName));
                        session.setUndoManager(new UndoManager);
                        session.setMode(mode.mode);

                        //on change event of session compare values
                        //and put * charachter to filename
                        //TODO: throttle here
                        session.on('change', function() {
                            var s = $('#' + id + '_tab').find('span').first();
                            if(self.sessions.get(id).get('value') !== session.getValue()){
                                s.html(fileName + '*');
                            } else {
                                s.html(fileName);
                            }
                        });
                        //add to sessions collection
                        self.sessions.add({
                            id : id
                            , filename : fileName
                            , value : value
                            , mode : modelist.getModeForPath(fileName)
                            , session : session
                        });
                        self.renderTab(fileModel);
                    }
                });
            } else {
                window.env.editor.setSession(this.sessions.get(id).get('session'));
                this.renderTab(fileModel);
            }
            
        }
        , renderTab : function(fileModel) {
            var id = fileModel.id
                , fileName = fileModel.name
                , location = fileModel.location
                , self = this;
            $('li', this.el).removeClass('active');
            //openTabs collection hold only open tabs
            if(this.openTabs.get(id) === undefined) {
                this.openTabs.add(fileModel);
                var li = $('<li title="'+ location +'" data-file-name="'+fileName+'"'+
                    'class="tab-link active" id="' + id + '_tab"><span class="tab-file-name">' + fileName + '</span>' +
                    '<span class="close-tab tab-file-close" style="float:right; font-weight:bold;">x</span>'+
                    '</li>'); 
                this.$el.append(li);               
            } else {
                $('li', this.el).removeClass('active');
                $('#' + id + '_tab').addClass('active');
            }
            this.$el.addClass('filled');
            this.setActiveTab(id, true);
        }
        , openTab : function(e) {
            // if($(e.target).is('span')) {
            //     this.removeTab()
            // }
            $('li', this.el).removeClass('active');
            $(e.target).closest('li').addClass('active');
            var fileId = $(e.target).closest('li').attr('id').split('_')[0];
            $('.file-selected').removeClass('file-selected');
            $('#' + fileId).addClass('file-selected');

            this.showFileRecursive($('#' + fileId));

            console.log(fileId);
            this.setActiveTab(fileId, false);
        }
        //set session (it should be already in sessions collection)
        , setActiveTab : function(fileId, moveCursor) {
            var session = this.sessions.get(fileId).get('session');
            window.env.editor.setSession(session);
            this.focusSession(moveCursor);
        }
        //remove tab after click "x"
        , closeTab : function (e) {
            e.stopPropagation();
            var self = this;
            var id = $(e.target).parent().attr('id').split('_')[0];
            if(id) {
                var s = this.sessions.get(id);
                //if tab is closed while file changed
                if(s.get("value") !== s.get("session").getValue()){
                    if (confirm("是否确实要关闭而不保存?") ) {
                        if (confirm("离开前保存您的文件?") ) {
                            // code here for save then leave (Yes)
                        } else {
                            //code here for no save but leave (No)
                            s.get("session").setValue(s.get("value"));
                        }
                        self.removeTab();                            
                    } else {
                        return;
                    }                    
                } else {
                    self.removeTab(id, $(e.target));                    
                }
            }
        }
        , removeTab : function(id, target) {
            var m = this.openTabs.get(id);
            this.openTabs.remove(m);
            //if it is active
            if(target.parent().hasClass('active')) {
                //if no tab remained
                if($('.tab-link', self.el).length <= 1) {
                    window.env.editor.setSession(env.defaultSession);
                    this.focusSession();
                    env.noFile = true;
                } else {
                    //set previous tab active if exist
                    if(target.parent().prev().length > 0) {
                        var fid = target.parent().prev().attr('id').split('_')[0];
                        target.parent().prev().addClass('active');
                        this.setActiveTab(fid);
                    } else if(target.parent().next().length > 0) {
                        var fid = target.parent().next().attr('id').split('_')[0];
                        target.parent().next().addClass('active');
                        this.setActiveTab(fid);                        
                    }
                }
            }
            target.parent().remove(); 
        }
        , focusSession : function (moveCursor) {
            window.env.editor.focus();
            var session = env.editor.session;
            count = session.getLength();
            if(moveCursor) {
                window.env.editor.gotoLine(count, session.getLine(count-1).length);
            }
        }, showFileRecursive : function(el) {
            if(el.parent().is(':visible')) return;
            el.parent().show();
            el.parent().prev().show();
            this.showFileRecursive(el.parent());
        }

    });
  
    return FileTabs;
  
});
