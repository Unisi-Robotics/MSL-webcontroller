const express = require('express');
const router = express.Router();

const obsctaleController = require('../controller/obstacleController');

router.get('/', obsctaleController.obstacles_get_all);

module.exports = router  