import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import compression from 'compression';

import config from '../../config';
import passport from './passport';
import * as logger from './logger';
import * as controllers from './controllers';

mongoose.connect(config.db.mongo.url);

const app = express();
export default app;

app.set('json spaces', 2);

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(cors(config.cors));
app.use(passport.initialize());
app.use(logger.logRequest());

app.use('/', controllers.root);
app.use('/oauth2', controllers.oauth2);
app.use('/users', controllers.users);
app.use('/roles', controllers.roles);
app.use('/clients', controllers.clients);
app.use('/sessions', controllers.sessions);
app.use('/access-tokens', controllers.accessTokens);
app.use('/refresh-tokens', controllers.refreshTokens);
