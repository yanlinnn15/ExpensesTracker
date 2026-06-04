const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { validateToken } = require('../middlewares/authMW');

router.post('/',              validateToken, categoryController.create);
router.patch('/edit/:id',     validateToken, categoryController.update);
router.get('/viewAll',        validateToken, categoryController.getAll);
router.get('/view/:id',       validateToken, categoryController.getById);
router.get('/someCate/:id',   validateToken, categoryController.getOthersByType);
router.delete('/dlt/:id',     validateToken, categoryController.remove);

module.exports = router;
