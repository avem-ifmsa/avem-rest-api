var _ = require('lodash');
var authRbac = require('auth-rbac');

var User = require('./models/user');
var Role = require('./models/role');

var authority = authRbac({
	getUser: function(req, cb) {
		cb(null, req.user);
	},
	
	userGetRole: function(user, cb) {
		Role.findById(user.role, cb);
	},
	
	roleHasPrivilege: function(role, priv, cb) {
		cb(null, _.contains(role.privileges, priv));
	},
});

module.exports = exports = authority;
exports.requirePrivilege = authRbac.requirePrivilege;
exports.identify = _.constant(authRbac.identify(authority));
