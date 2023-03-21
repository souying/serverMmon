const serverList = require('./db')('./basedata/serverlist.db');
const user = require('./db')('./basedata/user.db');
module.exports = {
    serverList,
    user
}
