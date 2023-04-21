const serverList = require('./db')('./basedata/serverlist.db');
const user = require('./db')('./basedata/user.db');
const share = require('./db')('./basedata/share.db');
const tg = require('./db')('./basedata/tg.db');
const liu = require('./db')('./basedata/liu.db');
module.exports = {
    serverList,
    user,
    share,
    tg,
    liu
}
