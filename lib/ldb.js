var low = require('lowdb');
var FileSync = require('lowdb/adapters/FileSync');
var adapter = new FileSync('db.json');
var ldb = low(adapter);
ldb.defaults({users:[], topics:[]}).write();
module.exports = ldb;