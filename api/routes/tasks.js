const express = require('express');
const router = express.Router();

const taskController = require('../controller/taskController');

router.get('/', taskController.task_get_all);

router.post('/', taskController.task_post);

module.exports = router  