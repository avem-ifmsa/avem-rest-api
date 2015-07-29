'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _authRbac = require('auth-rbac');

var _authRbac2 = _interopRequireDefault(_authRbac);

var _modelsUser = require('./models/User');

var _modelsUser2 = _interopRequireDefault(_modelsUser);

var _modelsRole = require('./models/Role');

var _modelsRole2 = _interopRequireDefault(_modelsRole);

var authority = (0, _authRbac2['default'])({
	getUser: function getUser(req, callback) {
		callback(null, req.user);
	},

	userGetRole: function userGetRole(user, callback) {
		_modelsRole2['default'].findById(user.role, callback);
	},

	roleHasPrivilege: function roleHasPrivilege(role, priv, callback) {
		callback(null, _lodash2['default'].contains(role.privileges, priv));
	}
});

exports['default'] = authority;
var identify = _lodash2['default'].constant(_authRbac2['default'].identify(authority));
exports.identify = identify;
var requirePrivilege = _authRbac2['default'].requirePrivilege;
exports.requirePrivilege = requirePrivilege;
//# sourceMappingURL=../lib/authority.js.map