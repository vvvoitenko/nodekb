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
	async (req, res)=>{

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
		console.log('bbbbbbbbbbbbbbbb', bcrypt.genSalt(10));

		try {
			const hash = await bcrypt.genSalt(10).then((salt) => {
				console.log('saltsaltsaltsaltsaltsaltsaltsalt', salt);
			    return bcrypt.hash(newUser.password, salt);
			});
			newUser.password = hash;
			await newUser.save();
			req.flash("success", "You can login now");
			res.redirect('/users/login');
		} catch(err) {
			console.log('CATCH ERROR', err);	
		}
		
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