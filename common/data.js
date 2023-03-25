const serverList = require('./db')('./basedata/serverlist.db');
const user = require('./db')('./basedata/user.db');
const share = require('./db')('./basedata/share.db');
module.exports = {
    serverList,
    user,
    share
}
