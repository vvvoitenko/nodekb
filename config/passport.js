const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('./database');
const bcrypt = require('bcryptjs');


module.exports = (passport) => {
	//Local Strategy 
	passport.use(new LocalStrategy((username, password, done)=>{
		let query = {username};
		User.findOne(query, (err, user) => {
			if (err) {
				console.log(err);
				throw err;
			}
			if (!user) {
				console.log('NO USER');
				return done(null, false, {message: 'No user found'});
			}


			bcrypt.compare(password, user.password, (err, isMatch)=>{
				if (err) {
					console.log('err2', err);
					throw err;
				}
				if (isMatch) {
					console.log('isMatch');
					return done(null, user);
				} else {
					console.log('isNotMatch');
					return done(null, false, {message: 'Wrong password'});
				}
			});

		});	
	}));
	passport.serializeUser(function(user, done) {
	  done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
	  User.findById(id, function(err, user) {
	    done(err, user);
	  });
	});
}
