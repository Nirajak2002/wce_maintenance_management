const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const { verify } = require('./verifyAuthToken');

require('dotenv').config();
const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

mongoose.connect(
  process.env.DB_CONNECT,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  () => console.log('connected to db...')
);

app.use(morgan('dev'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());


//If connection to DB is not woking, try below function
// function connectToServer(callback) {
//   try {
//     console.log("Connecting to DataBase...");
//     mongoose.connect(process.env.DB_CONNECT, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     }, (err, client) => {
//       console.log("Almost Connected to DataBase");
//       return callback(err)
//     })
//   } catch (e) {
//     throw e
//   }
// };
// connectToServer(function (err, client) {
//   if (err) { 
//     console.log(err); 
//     console.log("Network Error: " + err.message); 
//   }  else console.log("Database connected!");
//   // start the rest of your app here
// });
app.get('/api/isAuthenticated', verify, (req, res) => {
  try {
    return res.status(200).json({
      success: 1,
    });
  } catch (error) {
    return res.status(403).json({
      success: 0,
    });
  }
});

app.get('/api/logout', (req, res) => {
  try {
    res.clearCookie('auth-token');
    return res.status(200).json({
      success: 1,
      message: 'Logged out Successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: 0,
      error: 'Unable to complete operation',
    });
  }
});

app.use('/api/login', require('./login'));
app.use('/api/complaint', require('./complaint'));
app.use('/api/store', require('./store'));
app.use('/api/material', require('./material'));
app.use('/api/labour',require('./labour'));

app.listen(process.env.PORT, () =>
  console.log(`Listening to PORT ${process.env.PORT}...`)
);
