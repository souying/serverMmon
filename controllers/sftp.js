var sftpConnection = false
  , connection = false;

function readFolder(sftp, folderName, res){
  var result = {
    folders: [],
    files: [],
    name: folderName
  }
  // console.log(result)
  sftp.opendir(folderName + "/", function(err, handle){
    if(err) throw err;

    console.log(folderName);
    sftp.readdir(handle, function(err, list){
      var count = list.length;
      console.log(count);
      if(list.length === 2) {
        res.write(JSON.stringify({
            success: true
            , tree: result
        }));
        res.end();                  
        return;        
      }

      list.forEach(function(l){
        if(l.filename!="." && l.filename!="..") {
          var fileName = folderName+"/"+l.filename;
          if(count<=0){
            // console.log(result);
            return;
          }
          sftp.stat(fileName, function(err, stat){
            count--;
            if(stat.isDirectory()){
                result.folders.push(fileName);
            } else {
                result.files.push(fileName);
            }
            if(count<=0){
              // console.log(123456)
              res.write(JSON.stringify({
                  success: true
                  , tree: result
              }));
              res.end();                  
              return;
            }
          })
        }
      });
    });
  });
}
exports.start = function(req, res) {

  const { Client } = require('ssh2');
    // console.log(Client)
    var c = new Client();

    c.on('connect', function() {
      console.log('Connection :: connect');
    });

    var rootFolder = {};
    var allFoldersInRoot = {};
    var allFolderNames = [];
    var treeRootObject = {};
    // console.log(req.body)
    var rootFolderName = req.body.root;
    var password = req.body.password;
    var username = req.body.username;
    var host = req.body.host;
    var port = req.body.port?req.body.port:22;

    c.on('ready', function() {
      
    });

    connection.on('ready', function(){
      console.log('Connection :: ready');
      connection = c;
      //sftpConnection = c;
      c.sftp(function(err, sftp) {

        console.log("sftp ready")
        sftpConnection = sftp
        if (err) {
          res.status(500).send('Could not create SFTP connection');
        }
        sftp.on('end', function() {
          console.log('SFTP :: SFTP session closed');
        });
        //readFolder(sftp, rootFolderName);
        //sftp.readFolder(rootFolderName)
        //sftp.opendir(rootFolderName + "/", function readdir(err, handle){
        var r = readFolder(sftp, rootFolderName, res);

        console.log(r);
        //return;
      });
    }).on('error', function(err){
      onsole.log('Connection :: error :: ' + err);
      res.status(500).send('Authentication failure');
    }).on('keyboard-interactive', function (name, descr, lang, prompts, finish) {
        // For illustration purposes only! It's not safe to do this!
        // You can read it from process.stdin or whatever else...
        return finish([password]);
    
        // And remember, server may trigger this event multiple times
        // and for different purposes (not only auth)
    }).connect({
      host: host,
      port: port,
      username: username,
        tryKeyboard: true
    });
    

}

exports.readDir = function(req, res){
  var rootFolderName = req.body.root;
  readFolder(sftpConnection, rootFolderName, res);
}

exports.readFile = function(req, res){
  var fileName = req.body.fileName;
  var rs = sftpConnection.createReadStream(fileName);
  console.log(rs);
  rs.pipe(res);
}

exports.writeFile = function(req, res){
  var fileContent = req.body.content;
  var fileName = req.body.name;

  //sftpConnection.fastPut("../../tmp/text-x.js", "/home/diki/nodes/noditor/test-x.js", function);
  var ws = sftpConnection.createWriteStream(fileName, {autoClose: false});

  ws.write(fileContent, 'utf8', function(){
    console.log("written!!!!!");
    res.write(JSON.stringify({
        success: true
    }));

    res.end();  
  });
}

exports.createFile = function(req, res) {
  var fileName = req.body.name;
  try {
    console.log(fileName);
    sftpConnection.createWriteStream(fileName, {autoClose: false});
    res.write(JSON.stringify({
        success: true
    }));

    res.end();     
  } catch(e) {
    res.status(400)
  }
}

exports.createFolder = function(req, res) {
  console.log(req.body)
  var folderName = req.body.name;
  sftpConnection.mkdir(folderName, function(err){
    if(err) res.status(500);
    res.send({success: true});
  });
}

exports.removeFolder = function(req, res) {
  var folderName = req.body.name;
  try {
    connection.exec('rm -R ' + folderName, function(err, stream){
      if (err) { throw err; res.status(500); }
      stream.on('data', function(data, extended) {
        console.log((extended === 'stderr' ? 'STDERR: ' : 'STDOUT: ')
                    + data);
      });
      stream.on('end', function() {
        console.log('Stream :: EOF');
      });
      stream.on('close', function() {
        console.log('Stream :: close');
      });
      stream.on('exit', function(code, signal) {
        if(code === 0) res.send({success: true});
        console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
      });
    });
  } catch(e) {
    console.log(e);
  }
}

exports.removeFile = function(req, res) {
  var folderName = req.body.name;
  try {
    connection.exec('rm ' + folderName, function(err, stream){
      if (err) { throw err; res.status(500); }
      stream.on('data', function(data, extended) {
        console.log((extended === 'stderr' ? 'STDERR: ' : 'STDOUT: ')
                    + data);
      });
      stream.on('end', function() {
        console.log('Stream :: EOF');
      });
      stream.on('close', function() {
        console.log('Stream :: close');
      });
      stream.on('exit', function(code, signal) {
        if(code === 0) res.send({success: true});
        console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
      });
    });
  } catch(e) {
    console.log(e);
  }
}

