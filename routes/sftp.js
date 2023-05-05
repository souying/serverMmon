
var express = require('express');
var router = express.Router();

//sftp roots
var sftp = require('../controllers/sftp');
router.post('/', sftp.start);
router.post('/read', sftp.readFile);
router.post('/dir', sftp.readDir);
router.post('/write', sftp.writeFile);
router.post('/touch', sftp.createFile);
router.post('/mkdir', sftp.createFolder);
router.post('/rmdir', sftp.removeFolder);
router.post('/rm', sftp.removeFile);

module.exports = router;