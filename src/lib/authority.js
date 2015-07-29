import _ from 'lodash';
import authRbac from 'auth-rbac';

import User from './models/User';
import Role from './models/Role';

const authority = authRbac({
	getUser: (req, callback) => {
		callback(null, req.user);
	},
	
	userGetRole: (user, callback) => {
		Role.findById(user.role, callback);
	},
	
	roleHasPrivilege: function(role, priv, callback) {
		callback(null, _.contains(role.privileges, priv));
	},
});

export default authority;
export const identify = _.constant(authRbac.identify(authority));
export const requirePrivilege = authRbac.requirePrivilege;
