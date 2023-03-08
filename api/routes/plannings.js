const express = require('express');
const router = express.Router();

const planController = require('../controller/planningController');

router.get('/', planController.planning_get_all);

router.post('/', planController.planning_post);

module.exports = router  