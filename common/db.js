const Datastore = require('nedb');
function DB(database) {
  let options = {
    filename: database,
    autoload: true,
  };
  this.db = new Datastore(options);
}
DB.prototype.limit = function(offset, limit) {
  this.offset = offset || 0;
  this.limit = limit || 15;
  return this;
}
DB.prototype.sort = function(orderby) {
  this.orderby = orderby;
  return this;
}
DB.prototype.find = function(query, select) {
  return new Promise((resolve, reject) => {
    let stmt = this.db.find(query || {});
    if (this.orderby !== undefined) {
      stmt.sort(this.orderby);
    }
    if (this.offset !== undefined) {
      stmt.skip(this.offset).limit(this.limit);
    }
    if (select != undefined) {
      stmt.projection(select || {});
    }
    stmt.exec((err, docs) => {
      if (err) {
        return reject(err);
      }
      resolve(docs);
    })
  })
};
DB.prototype.findOne = function(query, select) {
  return new Promise((resolve, reject) => {
    let stmt = this.db.findOne(query || {});
    if (this.sort !== undefined) {
      stmt.sort(this.sort);
    }
    if (select != undefined) {
      stmt.projection(select || {});
    }
    stmt.exec((err, doc) => {
      if (err) {
        return reject(err);
      }
      resolve(doc);
    })
  })
}
DB.prototype.insert = function(values) {
  return new Promise((resolve, reject) => {
    this.db.insert(values, (err, newDoc) => {
      if (err) {
        return reject(err);
      }
      resolve(newDoc);
    })
  })
}
DB.prototype.update = function(query, values, options) {
  return new Promise((resolve, reject) => {
    this.db.update(query || {}, values || {}, options || {}, (err, numAffected) => {
      if (err) {
        return reject(err);
      }
      resolve(numAffected);
    })
  });
}
DB.prototype.remove = function(query, options) {
  return new Promise((resolve, reject) => {
    this.db.remove(query || {}, options || {}, (err, numAffected) => {
      if (err) {
        return reject(err);
      }
      resolve(numAffected);
    })
  });
}
module.exports = (database) => {
  return new DB(database);
}