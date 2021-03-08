var express = require('express');
var router = express.Router();
var topic = require('../lib/topic');

router.get('/', function(req, res, next){
    topic.home(req, res);
})

module.exports = router;