const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const article = require('./routes/article');
const user = require('./routes/user');
const passport = require('passport');
require('./config/db');
const config = require('./config/database');
const app = express();

const ArticleModel = require('./models/article');

const port = 3000;
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

app.all('*', async (req, res, next) => { //all
	res.locals.user = req.user || null;
	next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('connect-flash')());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/articles', article);
app.use('/users', user);

app.get('/', (req, res)=>{
	console.log('MAIN');
	let articles = ArticleModel.find({}, (err, articles)=>{
		if (err) {
			console.log(err);
		}
		res.render('index', {
			title: 'Articles',
			articles: articles
		});
	}).sort([['_id', -1]]);
});
app.use(function(req,res){
    res.render('404');
});
app.listen(port, ()=>{
	console.log(`Server started at port ${port}`);
});
