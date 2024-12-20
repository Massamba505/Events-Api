// require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");
require("dotenv").config();

const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');

// const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route');
const eventRouter = require('./routes/event.route');
const ticketRouter = require('./routes/ticket.route');
const categoryRoutes = require('./routes/category.route');
const venueRouter = require('./routes/venue.route');
const swaggerDocument = yaml.load(path.join(__dirname, "docs",'swagger.yaml'));

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE',"OPTIONS"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use('/api', indexRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/events', eventRouter);
app.use('/api/tickets', ticketRouter);
app.use('/api/category', categoryRoutes);
app.use('/api/venues',venueRouter);

module.exports = app;
