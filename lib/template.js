var sanitizeHTML = require('sanitize-html');
var template = {
    HTML:function(title, list, body, control, authStatusUI = '<a href="/auth/login">login</a> | <a href="/auth/register">Register</a>'){
        return `
        <!doctype html>
        <html>
        <head>
            <title>WEB1 - ${title}</title>
            <meta charset="utf-8">
        </head>
        <body>
            ${authStatusUI}
            <h1><a href="/">WEB</a></h1>
            <a href="/author">author</a>
            ${list}
            ${control}
            ${body}
        </body>
        </html>
    `;
    },list:function(topics){
        var list = '<ol>';
        var i = 0;
        while(i < topics.length){
            list = list+`<li><a href="/page/${topics[i].id}">${sanitizeHTML(topics[i].title)}</a></li>`;
            i++;
        }
        list = list+'</ol>';
        return list;
    }, authorSelect:function(authors, author_id){
        var tag = ``;
        var i = 0;
        while(i < authors.length){
            var selected = '';
            if(authors[i].id === author_id){
                selected = ' selected';
            }
            tag += `<option value="${authors[i].id}"${selected}>${sanitizeHTML(authors[i].name)}</option>`;
            i++;
        }
        return `
        <select name="author">
        ${tag}
        </select>
        `
    }, authorTable:function(authors){
        var tag = '<table>';
            var i = 0;
            while(i < authors.length){
                tag += `
                <tr>
                    <td>${sanitizeHTML(authors[i].name)}</td>
                    <td>${sanitizeHTML(authors[i].profile)}</td>
                    <td><a href="/author/update?id=${authors[i].id}">update</a></td>
                    <td>
                        <form action="/author/delete_process" method="post">
                            <input type="hidden" name="id" value="${authors[i].id}">
                            <input type="submit" value="delete">
                        </form>
                    </td>
                </tr>
                `
                i++;
            }
        tag += '</table>';
        return tag;
    }
}

module.exports = template;