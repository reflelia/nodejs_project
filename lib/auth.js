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
        return false;
    }
    db.query(`SELECT * FROM user WHERE email=?`, [email], function(err, res){
        if(res.length!==0){
            request.flash('error', 'email overlapped!');
            response.redirect('/auth/register');
            return false;
        }
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
                return response.redirect('/auth/login');
            });
        });  
    });
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