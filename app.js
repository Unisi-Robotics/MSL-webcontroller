const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const tasksRoutes = require('./api/routes/tasks');
const obstaclesRoutes = require('./api/routes/obstacles');
const planningsRoutes = require('./api/routes/plannings');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static('public'))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if(req.method === "OPTIONS") {
        res.header('Access-Control-Allow-Methods', 'GET, POST');
        return res.status(200).json({});
    }

    next();
});

// The routes
app.use('/tasks', tasksRoutes);
app.use('/obstacles', obstaclesRoutes);
app.use('/plannings', planningsRoutes);

app.get('/', (req, res) => {
    res.sendFile('./views/index.html', { root: __dirname });
})

app.get('/setup-data', (req, res) => {
    res.sendFile('./views/setup-data.html', { root: __dirname });
})

app.use((req, res, next) => {
    const errorInform = new Error('Not Found');
    errorInform.status = 404;
    next(errorInform);
});

app.use((errorInform, req, res, next) => {
    res.status(errorInform.status || 500);
    res.json({
        error: {
            message: errorInform.message
        }
    });
});

module.exports = app;