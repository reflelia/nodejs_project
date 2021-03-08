const db = require('./db');
var bcrypt = require('bcrypt');

module.exports = function (app) {

    var passport = require('passport')
    , LocalStrategy = require('passport-local')
    .Strategy;

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
        console.log("serializeUser ", user)
        done(null, user);
      });
      
    passport.deserializeUser(function(user, done) {

        console.log("deserializeUser email ", user.email)
        var userinfo;
        var sql = 'SELECT * FROM user WHERE email=?';
        db.query(sql , [user.email], function (err, result) {
        if(err) console.log('mysql 에러');     
        
        console.log("deserializeUser mysql result : " , result);
        var json = JSON.stringify(result[0]);
        userinfo = JSON.parse(json);
        done(null, userinfo);
        })    
    });

    passport.use(new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'pwd'
        },
        function(username, password, done) {
            var sql = 'SELECT * FROM user WHERE email=?';
            db.query(sql , [username], function (err, result) {
              if(err) console.log('mysql 에러');  
              if(result.length === 0){
                console.log("결과 없음");
                return done(null, false, { message: 'Incorrect' });
              }
              else {
                bcrypt.compare(password, result[0].password, function(err, res){
                  // 입력받은 ID와 비밀번호에 일치하는 회원정보가 없는 경우   
                  if(res){
                    console.log(result);
                    var json = JSON.stringify(result[0]);
                    var userinfo = JSON.parse(json);
                    console.log("userinfo " + userinfo);
                    return done(null, userinfo);  // result값으로 받아진 회원정보를 return해줌
                  } else {
                    return done(null, false, { message: 'Incorrect password' });
                  } 
                });
              }
            })
          }

    ));
    return passport;
}
