var db = require('./db');
var template = require('./template.js');
var url = require('url');
var sanitizeHTML = require('sanitize-html');
var authModule = require('./authModule');
var fs = require('fs');
var dateFormat = require('dateformat');

exports.home = function(request, response){
    var imgList = `
    <input type="checkbox" name="img_allchk" value="selectall" onclick="selectAll(this)"> 
    <b>Select All</b>
    <script src="CheckAll.js"></script>
    `;
    fs.readdir('./public/images', function(err, flist){
        for(var i=0; i<flist.length; i++){
            imgList += `<img src=/images/${flist[i]} style="width:700px; display:block; margin-top:10px">
                        <input type="checkbox" name="img_chk" value="${flist[i]}" id="checked">`;
        }
        //console.log(imgList);
    })
    db.query(`SELECT * FROM topic`, function(error, topics){
        console.log('/', request.user);
        var fmsg = request.flash();
        var feedback = '';
        if(fmsg.success){
            feedback = fmsg.success[0];
            console.log(fmsg);
        }
            
        var title = 'Welcome';
        var description = "Hello, Node.js";
        var list = template.list(topics);
        var html = template.HTML(title, list, 
            `<div style="color:blue;">${feedback}</div>
            <h2>${title}</h2>${description}
            <form name="questionForm" method="post" enctype="multipart/form-data" action="/image/test/save">
                <input type="hidden" name="TEST_SN" value="1">
                
                <ul id="questionFormList">
                <li>
                    <input type="hidden" name="Q_SN" value="2">
                    <input type="file" name="IMG_FILE" multiple>
                </li>
                </ul>
                <input type="submit" value="submit"> 
            </form>
            <form name="deleteImage" method="post" action="/image/delete">
                <input type="submit" value="delete">
            ${imgList}
            </form>
            `, 
            `<a href=topic/create>create</a>`,
            authModule.statusUI(request, response)
        );
        response.writeHead(200);
        response.end(html);
    });
}

exports.page = function(request, response, next){
    db.query(`SELECT * FROM topic`, function(error, topics){
        if(error){
            throw error;
        }
        db.query(`SELECT * FROM topic LEFT JOIN user ON topic.author_id=user.id WHERE topic.id=?`, [request.params.pageId], function(error2, topic){
            if(error2){
                throw error2;
            }
            if(topic[0] === undefined){
                next();
            }
            else{
                var date = dateFormat(topic[0].created, "yyyy.mm.dd hh:MM:ss");
                //var date = topic[0].created;
                var title = topic[0].title; 
                var description = sanitizeHTML(topic[0].description, {allowedTags: ['b', 'img', 'br']});
                var list = template.list(topics);
                //<p>by ${sanitizeHTML(topic[0].name)}</p>
                var html = template.HTML(title, list, 
                    `<h2>${sanitizeHTML(title)}</h2>
                    ${description}
                    <p>by ${topic[0].nickname} in ${date}</p>`, 
                    `<a href="/topic/create">create</a> 
                    <a href="/topic/update/${request.params.pageId}">update</a> 
                    <form action="/topic/delete_process" method="post">
                        <input type="hidden" name="id" value=${request.params.pageId}>
                        <input type="submit" value="delete">
                    </form>`,
                    authModule.statusUI(request, response)
                );
                response.writeHead(200);
                response.end(html);
            }
            
        })
    });
}

exports.create = function(request, response){
    if(!authModule.isOwner(request, response)){
        response.redirect('/');
        return false;
    }
    db.query(`SELECT * FROM topic`, function(error, topics){
        db.query(`SELECT * FROM author`, function(error2, authors){
            var title = 'Create';
            var list = template.list(topics);
            var html = template.HTML(sanitizeHTML(title), list, 
                ` 
                <form action="/topic/create_process" method="post">
                <p><input type="text" name="title" placeholder="title" style="width:250px;"></p>
                <p>
                    <textarea rows="10" cols="80" name="description" placeholder="description" wrap="hard"></textarea>
                    <style> textarea{resize:none;}</style>
                </p>
                <p>
                    <input type="submit">
                </p>
                </form>
                `, 
                `<a href="/topic/create">create</a>`,
                authModule.statusUI(request, response)
            );
            response.send(html);
        });
    });
}

exports.create_process = function(request, response){
    // var body = '';
    // var id = '';
    // request.on('data', function(data){
    //     body = body + data;
    // });
    // request.on('end', function(){
    //     var post = qs.parse(body);
    //     console.log(post);
    //     db.query(`
    //     INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`,
    //     [post.title, post.description, post.author],
    //     function(error, result){
    //         if(error){
    //             throw error;
    //         }
            
    //         response.writeHead(302, {Location: `/?id=${encodeURI(result.insertId)}`});
    //         response.end(); 
    //     });
    // })

    var post = request.body;
    var title = post.title;
    var description = post.description;
    description = description.replace(/(?:\r\n|\r|\n)/g, '<br />');
    
    // var id = shortid.generate();
    // // if(!authModule.isOwner(request, response)){
    // //     response.redirect('/');
    // //     return false;
    // // }
    //console.log('리퀘스트 유저 : ', request.user); //리퀘스트 유저 불러오기, author에 넣을 예정.
    //todo :  유저 db id 넣어서 구분하기, id는 shortid로 해서 추가 후 세션에도 추가 확인, author 제거하고 사용자 이름 불러오기
    
    db.query(`
        INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`,
        [title, description, request.user.id],
        function(error, result){
            if(error){
                throw error;
            }
            //자기가 만든 페이지로 리다이렉트
            db.query(`SELECT * FROM topic WHERE author_id=? ORDER BY created DESC LIMIT 1`, [request.user.id], function(error2, result2){
                if(error2){
                    throw error2;
                }
                response.redirect(`/page/${result2[0].id}`);
                response.end();
            })
        });

    
        
    // ldb.get('topics').push({
    //     id:id,
    //     title:title,
    //     description:description,
    //     user_id:request.user.id
    // }).write();
    //response.redirect(`/`);
}

exports.update = function(request, response){
    if(!authModule.isOwner(request, response)){
        response.redirect('/');
        return false;
    }
    var _url = request.url;
    var queryData = url.parse(request.url, true).query;
    db.query(`SELECT * FROM topic`, function(error, topics){
        if(error){
            throw error;
        }
        db.query(`SELECT * FROM topic WHERE id=?`, [request.params.pageId], function(error2, topic){
            if(error2){
                throw error;
            }
            if(request.user.id !== topic[0].author_id){
                request.flash('error', 'you are not owner!');
                response.redirect(`/page/${topic[0].id}`);
                return false;
            }
            var list = template.list(topics);
            var html = template.HTML(sanitizeHTML(topic[0].title), list, 
            `
            <form action="/topic/update_process" method="post">
                <input type=""hidden name="id" value="${topic[0].id}" style="width:250px;">
                <p><input type="text" name="title" placeholder="title" value=${sanitizeHTML(topic[0].title)}></p>
                <p>
                    <textarea rows="10" cols="80" name="description" placeholder="description" wrap="hard">${topic[0].description.replace(/(<br>|<br\/>|<br \/>)/g, '\r\n')}</textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>
            `, 
            `<a href="/topic/create">create</a>`,
            authModule.statusUI(request, response));
            response.send(html);

        });
    });
}

exports.update_process = function(request, response){
    // var body = '';
    // request.on('data', function(data){
    //     body = body + data;
    // });
    // request.on('end', function(){
    //     var post = qs.parse(body);
    //     console.log(post);
    //     db.query(`UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`, 
    //     [post.title, post.description, post.author, post.id], function(error, result){
    //         response.redirect(`/page/${encodeURI(post.id)}`);
    //     });

    // });
    
    var post = request.body;
    if(!authModule.isOwner(request, response)){
        response.redirect('/');
        return false;
    }
    db.query(`UPDATE topic SET title=?, description=?, created=NOW(), author_id=? WHERE id=?`, 
        [post.title, post.description.replace(/(?:\r\n|\r|\n)/g, '<br />'), request.user.id, post.id], function(error, result){
            response.redirect(`/page/${encodeURI(post.id)}`);
        });
}

exports.delete_process = function(request, response){
    // var body = '';
    // request.on('data', function(data){
    //     body = body + data;
        
    // });
    // request.on('end', function(){
    //     console.log(body);
    //     var post = qs.parse(body); 
    //     db.query(`DELETE FROM topic WHERE id=?`, [post.id], function(error, result){
    //         if(error){
    //             throw error;
    //         }
    //         response.redirect('/');
    //     });
    // });


    if(!authModule.isOwner(request, response)){
        response.redirect('/');
        return false;
    }
    var post = request.body;
    db.query(`SELECT * FROM topic WHERE id=?`, [post.id], function(err, result2){
        if(result2[0].author_id !== request.user.id){
            response.redirect(`/page/${post.id}`)
        }
        else{
            db.query(`DELETE FROM topic WHERE id=?`, [post.id], function(error, result){
                if(error){
                    throw error;
                }
                response.redirect('/');
            });
        }
    });
}