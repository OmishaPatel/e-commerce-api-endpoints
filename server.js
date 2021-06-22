import express from 'express';
import { APP_PORT, MONGO_URL } from './config';// no need to write index.js 
import errorHandler from './middlewares/errorHandler';
import mongoose from 'mongoose';
import routes from './routes';
import path from 'path';

//Database connection
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify : false });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Database connected...');
}).catch(err => {
    console.log('Connection failed...')
});

const app = express();

// path for current folder
global.appRoot = path.resolve(__dirname);

// so that express can receive data besides json
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use('/api', routes); // adding api prefix so no need to add api in routes file all the time creating endpoints
app.use('/uploads',express.static('uploads'));

app.use(errorHandler);

app.listen(APP_PORT
    , () => console.log(`Listening on port ${APP_PORT}`));