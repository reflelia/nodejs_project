var express = require('express');
var router = express.Router();
var auth = require('../lib/auth');

module.exports = function(passport){
    router.get('/login', function(req, res, next){
        auth.home(req, res);
    })
    
    router.post('/login_process', 
        passport.authenticate('local', {
        failureRedirect : '/auth/login', 
        failureFlash: true,
        successFlash: true
        }) , (req, res) => {
        req.session.save( () => {
                res.redirect('/');
        })
    })

    router.get('/register', function(req, res, next){
        auth.register(req, res);
    })

    router.post('/register_process', function(req, res, next){
        auth.register_process(req, res);
    })

    router.get('/logout', function(req, res){
        req.logout();
        req.session.save(function(){
            res.redirect('/');
        })
    })

    return router;
}
