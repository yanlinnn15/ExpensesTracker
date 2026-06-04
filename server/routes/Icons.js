const express = require('express');
const router = express.Router();
const iconController = require('../controllers/iconController');

router.post('/',    iconController.create);
router.get('/view', iconController.getAll);

module.exports = router;
