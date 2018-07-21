const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const Article = require('../models/article');
const User = require('../models/user');


router.route('/add').get(ensureAuthenticated, (req, res)=>{
	res.render('add_article', {
		title: 'Add article'
	});
}).post(
	ensureAuthenticated,
	[
		check('title', 'Title is required').isLength({ min: 1 }),
//		check('author', 'Author is required').isLength({ min: 1 }),
		check('body', 'Body is required').isLength({ min: 1 })
	],
	async (req, res)=>{
		console.log('rrr', req.body);

	const errors = validationResult(req);
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
	article.author = req.body.body;

	try {
		await article.save();
		req.flash("info", "Article added");
		res.redirect('/');
	} catch(err) {
		console.log('CATCH ERROR1', err);
	}

});
router.route('/:id')
	.get(async (req, res)=>{
		try {
			const article = await Article.findById(req.params.id);
			const user = await User.findById(article.author);
			res.render('article', {
				article,
				author: user.username
			});
		} catch (e) {
			console.log('CATCH ERROR', err);
		    res.render('404');
		}

	})
	.delete(async (req, res)=>{
		try {

			if (!req.user) {
				throw "NO USER";
			}
			const article = await Article.findById(req.params.id);
			if (article.author != req.user._id) {
				throw "User mismatch";
			}
			article.remove();
		} catch (e) {
			console.log('ERRRRRRRRRRRRRRRRRRRRRRRROOOORRRR', e);
			res.status(401).json({status: 'FAIL'});
		}
	});

router.route('/edit/:id').get(ensureAuthenticated, async (req, res)=>{
		try {
			const article = await Article.findById(req.params.id);
			if (article.author != req.user._id) {
				return res.redirect('/');			
			}
			res.render('edit_article', {
				article
			});
		} catch(e) {
			console.log('CATCH ERROR', e);
		}

	}).post(ensureAuthenticated, async (req, res)=>{
		let article = {};
		let q = {_id: req.params.id};

		article.title = req.body.title;
		article.author = req.body.author;
		article.body = req.body.body;

		try {
			await Article.update(q, article);
			req.flash("success", "Article updated");
			res.redirect('/');
		} catch(err) {
			console.log('CATCH ERROR', err);
		}

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


/*	let q = {_id: req.params.id};
	Article.remove(q, (err)=>{
		if (err) {
			console.log('err', err);
		}
		res.send('SUCCESS');
	});
*/	

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