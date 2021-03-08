const express = require('express');
var app = express();
var topic = require('./lib/topic');
var bodyParser = require('body-parser');
var compression = require('compression');
var session = require('express-session')
var FileStore = require('session-file-store')(session)
var flash = require('connect-flash');
app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended:false}));
app.use(compression());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}))
app.use(flash());

var passport = require('./lib/passport')(app);

const indexRouter = require('./router/index.js');
const authRouter = require('./router/auth.js')(passport);
const topicRouter = require('./router/topic.js');
const authorRouter = require('./router/author.js');
const multerRouter = require('./router/multer.js');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/topic', topicRouter);
app.use('/author', authorRouter);
app.use('/image', multerRouter);

app.get('/page/:pageId', topic.page);

app.use(function(request, response, next){
    response.status(404).send('Sorry cant find that!');
})

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).send("Something broke!");
})

app.listen(3000, () => console.log('Example app listening on port 3000!'));
