const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { validateToken } = require('../middlewares/authMW');

router.post('/',              validateToken, transactionController.create);
router.get('/viewAll',        validateToken, transactionController.getMonthly);
router.get('/viewMonth',      validateToken, transactionController.getYearlySummary);
router.get('/view/:id',       validateToken, transactionController.getById);
router.get('/count/:id',      validateToken, transactionController.countByCategory);
router.delete('/dlt/:id',     validateToken, transactionController.remove);
router.delete('/dltcate/:id', validateToken, transactionController.removeByCategory);
router.patch('/edit/:id',     validateToken, transactionController.update);

module.exports = router;
