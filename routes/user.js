const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');
const User = require('../models/user');
const passport = require('passport');


router.get('/register', (req, res)=>{
	res.render('register');
});

router.post(
	'/register', 
	[
		check('name', 'Name is required').isLength({ min: 1 }),
		check('email', 'Email is required').isEmail(),
		check('username', 'Username is required').isLength({ min: 1 }),
		check('password', 'Password is required').isLength({ min: 1 }),
		// check('password2', 'Passwords mismatch').isEqual(req.body.password),
	],
	(req, res)=>{

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.render('register', {
			errors: errors.array()
		});
	} else {
		const name = req.body.name;
		const email = req.body.email;
		const username = req.body.username;
		const password = req.body.password;

		const newUser = new User({
			name,
			email,
			username,
			password
		});

		bcrypt.genSalt(10, function(err, salt) {
		    bcrypt.hash(newUser.password, salt, function(err, hash) {

				console.log('hash', hash);
				if (err) {
					console.log(err);
				}
				newUser.password = hash;
				newUser.save((err)=>{
					if (err) {
						console.log(err);
					} else {
						req.flash("success", "You can login now");
						res.redirect('/users/login');
					}	
				});
		    });
		});
	}

	// user.save((err)=>{
	// 	if (err) {
	// 		console.log(err);
	// 	} else {
	// 		console.log('AAAAAAAAAAAAAAAAAA');
	// 		req.flash("info", "Article added");
	// 		res.redirect('/');
	// 	}	
	// });	
});

router.get('/login', (req, res) => {
	res.render('login');
});

router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

router.post(
	'/login',
	  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

module.exports = router;