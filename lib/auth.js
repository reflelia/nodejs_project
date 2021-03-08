var db = require('./db');
var template = require('./template.js');
var sanitizeHTML = require('sanitize-html');
var shortid = require('shortid');
var bcrypt = require('bcrypt');

exports.home = function(request, response){
    db.query(`SELECT * FROM topic`, function(error, topics){
        db.query(`SELECT * FROM author`, function(error2, authors){
            var fmsg = request.flash();
            var feedback = '';
            if(fmsg.error){
                feedback = fmsg.error[0];
                console.log(fmsg);
            }
            
            
            var title = 'WEB - login';
            var list = template.list(topics);
            var html = template.HTML(sanitizeHTML(title), list, 
                ` 
                <div style="color:red;">${feedback}</div>
                <form action="/auth/login_process" method="post">
                <p><input type="text" name="email" placeholder="email"></p>
                <p><input type="password" name="pwd" placeholder="password"></p>
                <p>
                    <input type="submit" value="login">
                </p>
                </form>
                `, 
                ``
            );
            response.send(html);
        });
    });
}

exports.register = function(request, response){
    db.query(`SELECT * FROM topic`, function(error, topics){
        db.query(`SELECT * FROM author`, function(error2, authors){
            var fmsg = request.flash();
            var feedback = '';
            if(fmsg.error){
                feedback = fmsg.error[0];
                console.log(fmsg);
            }
            
            var title = 'WEB - login';
            var list = template.list(topics);
            var html = template.HTML(sanitizeHTML(title), list, 
                ` 
                <div style="color:red;">${feedback}</div>
                <form action="/auth/register_process" method="post">
                <p><input type="text" name="email" placeholder="email"></p>
                <p><input type="password" name="pwd" placeholder="password"></p>
                <p><input type="password" name="pwd2" placeholder="password"></p>
                <p><input type="text" name="displayName" placeholder="display name" value="egoing"></p>
                <p>
                    <input type="submit" value="register">
                </p>
                </form>
                `, 
                ``
            );
            response.send(html);
        });
    });
}

exports.register_process = function(request, response){
    var id = shortid.generate();
    var post = request.body;
    var email = post.email;
    var pwd = post.pwd;
    var pwd2 = post.pwd2;
    var displayName = post.displayName;
    if(pwd!==pwd2){
        request.flash('error', 'Password must same!');
        response.redirect('/auth/register');
    } else {
        bcrypt.hash(pwd, 10, function(err, hash){
            db.query(`
                INSERT INTO user(id, email, password, nickname) VALUES(?, ?, ?, ?)
                `, [id, email, hash, displayName], function(error, result){
                if(error){
                    throw error;
                }
                
                var user = {
                    id:id,
                    email:email,
                    password:hash,
                    displayName:displayName
                }
                console.log('user', user);
                
                request.login(user, function(){
                    return response.redirect('/');
                })
            });
        });   
    }   
    /*
    db.query(`
        INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`,
        [post.title, post.description, post.author],
        function(error, result){
            if(error){
                throw error;
            }
            response.writeHead(302, {Location: `/?id=${encodeURI(result.insertId)}`});
            response.end(); 
        });
        */
}

exports.login_process = function(request, response){


    /*var post = request.body;
    var email = post.email;
    var password = post.pwd;
    if(email === authData.email && password === authData.password){
        request.session.is_logined = true;
        request.session.nickname = authData.nickname;
        request.session.save(function(){
            response.redirect('/');
        });
    } else {
        response.send('who?');
    }*/
    

    /*var post = request.body;
    db.query(`
        INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`,
        [post.title, post.description, post.author],
        function(error, result){
            if(error){
                throw error;
            }
            response.writeHead(302, {Location: `/?id=${encodeURI(result.insertId)}`});
            response.end(); 
        });
        */
}

exports.logout = function(request, response){
    request.logout();
    request.session.save(function(err){
        //response.redirect('/');
    })
}
