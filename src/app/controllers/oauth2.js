import {Router} from 'express';

import * as common from './common';
import * as logger from '../logger';
import oauth2 from '../oauth2';

const router = Router();

router.use('/token',
	common.authenticate('client-public'),
	oauth2.token(), logger.logErrors(),
	oauth2.errorHandler());

export default router;
