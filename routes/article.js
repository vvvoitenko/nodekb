const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const Article = require('../models/article');
const User = require('../models/user');


router.get('/add', ensureAuthenticated, (req, res)=>{
	res.render('add_article', {
		title: 'Add article'
	});
});

router.get('/:id', (req, res)=>{
	console.log('req', req.params);
	Article.findById(req.params.id, (err, article)=> {
		console.log(err);
		console.log(article);

		User.findById(article.author, (err, user)=> {
			console.log('user', user.username);
			res.render('article', {
				article,
				author: user.username
			});
		});
	});
});

router.get('/edit/:id', ensureAuthenticated, (req, res)=>{
	Article.findById(req.params.id, (err, article)=> {
		if (article.author !== req.user._id) {
			res.redirect('/');			
		}
		res.render('edit_article', {
			article
		});
	})
});

router.post(
	'/add',
	ensureAuthenticated,
	[
		check('title', 'Title is required').isLength({ min: 1 }),
//		check('author', 'Author is required').isLength({ min: 1 }),
		check('body', 'Body is required').isLength({ min: 1 })
	],
	(req, res)=>{
		console.log('rrr', req.body);

	const errors = validationResult(req);
	console.log(errors.isEmpty());
	console.log(errors.array());
	if (!errors.isEmpty()) {
		res.render('add_article', {
			title: 'Add article',
			errors: errors.array()
		});
		return;
	}

	let article = new Article();
	article.title = req.body.title;
	article.author = req.user._id;
	article.body = req.body.body;
	article.save((err)=>{
		if (err) {
			console.log(err);
		} else {
			console.log('AAAAAAAAAAAAAAAAAA');
			req.flash("info", "Article added");
			res.redirect('/');
		}	
	});
	console.log(req.body.title);
});

router.post('/edit/:id', ensureAuthenticated, (req, res)=>{
		let article = {};
		article.title = req.body.title;
		article.author = req.body.author;
		article.body = req.body.body;
		
		let q = {_id: req.params.id};

		Article.update(q, article, function(err){
			if (err) {
				console.log('err', err);
			} else {
				req.flash("success", "Article updated");
				res.redirect('/');
			}
		});		

//	Article.findById(req.params.id, (err, article)=> {
		// article.title = req.body.title;
		// article.author = req.body.author;
		// article.title = req.body.body;
		// article.save();

		// res.render('edit_article', {
		// 	article: article
		// });
//	})

});

router.delete('/:id', (req, res)=>{

	if (!req.user) {
		res.status(401).send();
		return;
	}


	Article.findById(req.params.id, function(err, article){
		if (article.author != req.user._id) {
			res.status(403).send();
		} else {
			article.remove(()=>{
				if (err) {
					console.log('err', err);
					res.status(500).send('Some error occured');
				}
				res.send('SUCCESS');
			});
		}
	});

/*	let q = {_id: req.params.id};
	Article.remove(q, (err)=>{
		if (err) {
			console.log('err', err);
		}
		res.send('SUCCESS');
	});
*/	
});

// router.use(function (req, res, next) {
//   res.locals.messages = require('express-messages')(req, res);
//   console.log('res.locals.messages', res.locals.messages);
//   next();
// });


function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		req.flash('danger', 'Please, login!');
		res.redirect('/users/login');
	}
}











module.exports = router;