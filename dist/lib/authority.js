'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _authRbac = require('auth-rbac');

var authRbac = _interopRequireWildcard(_authRbac);

var _modelsUser = require('./models/User');

var _modelsUser2 = _interopRequireDefault(_modelsUser);

var _modelsRole = require('./models/Role');

var _modelsRole2 = _interopRequireDefault(_modelsRole);

var authority = authRbac({
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
var identify = _lodash2['default'].constant(authRbac.identify(authority));
exports.identify = identify;
var requirePrivilege = authRbac.requirePrivilege;
exports.requirePrivilege = requirePrivilege;
//# sourceMappingURL=../lib/authority.js.map