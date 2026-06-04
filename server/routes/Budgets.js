const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { validateToken } = require('../middlewares/authMW');

router.post('/',          validateToken, budgetController.create);
router.get('/viewAll',    validateToken, budgetController.getAll);
router.delete('/dlt/:id', validateToken, budgetController.remove);
router.patch('/edit/:id', validateToken, budgetController.update);

module.exports = router;
