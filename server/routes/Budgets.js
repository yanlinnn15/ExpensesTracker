const express = require('express');
const router = express.Router();
const {Budgets, Categories, Icons, Transactions} = require("../models");
const {validateToken} = require("../middlewares/authMW");
const Joi = require("joi");
const { Op, fn, col } = require('sequelize');

const BSchema = Joi.object({
    amount: Joi.number()
                .precision(2)
                .min(0.01)
                .max(99999999999999999999.99),
    remark: Joi.string().min(0).max(255),
    CategoryId: Joi.number().integer().min(1),
}).min(1);


router.post("/", validateToken, async (req,res) => {
    const budget = req.body;
    const uid = req.user.id;
    const {error, value} = BSchema.validate(budget);

    if (error) 
        return res.status(400).json({ error: error.details[0].message });

    try{
        const exist = await Budgets.findOne({
            where: { CategoryId: budget.CategoryId }
          });

        if(exist)
            return res.status(400).json({message: "Budget already created for this Category!"});

        await Budgets.create({
            amount: budget.amount,
            remark: budget.remark,
            CategoryId: budget.CategoryId,
            UserId: uid
        });

        res.status(201).json({ message: "Budgets Created Successfully!" }); 
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
});

router.get("/viewAll", validateToken, async (req, res) => {
    try {
        const uid = req.user.id;

        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(`${currentYear}-01-01`);
        const endOfYear = new Date(`${currentYear}-12-31`);

        const budgets = await Budgets.findAll({
            where: {
                UserId: uid,
            },
            include: [
                {
                    model: Categories,
                    include: [{ model: Icons }],
                },
            ],
        });

        if (!budgets || budgets.length === 0) {
            return res.status(404).json({ message: 'Budgets Not Found for the current year' });
        }

        const categoryIds = budgets.map(budget => budget.CategoryId);

        const transactions = await Transactions.findAll({
            attributes: [
                'CategoryId',
                [fn('SUM', col('amount')), 'totalAmount'],
            ],
            where: {
                UserId: uid, 
                CategoryId: {
                    [Op.in]: categoryIds, 
                },
                date: {
                    [Op.between]: [startOfYear, endOfYear], 
                },
            },
            group: [col('CategoryId')],
        });

        const totalBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);

        const totalAmount = await Transactions.sum('amount', {
            where: {
                UserId: uid, 
                CategoryId: {
                    [Op.in]: categoryIds, 
                },
                date: {
                    [Op.between]: [startOfYear, endOfYear],
                },
            },
        });
        

        const transactionsMap = {};
        transactions.forEach((transaction) => {
            transactionsMap[transaction.CategoryId] = parseFloat(transaction.dataValues.totalAmount);
        });

        const budgetTrans = budgets.map((budget) => {
            const categoryId = budget.Category ? budget.Category.id : null; 
            const totalSpent = transactionsMap[categoryId] || 0; 

            return {
                ...budget.toJSON(),
                totalSpent,
            };
        });

        res.status(200).json({
            totalBudget,
            totalAmount,
            budgetTrans,
        });
    } catch (error) {
        console.error("Error occurred while fetching budgets and transactions: ", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

router.delete("/dlt/:id", validateToken, async (req, res) => {
    try{
        const bgid = req.params.id;
        const budget = await Budgets.findByPk(bgid);
        
        if(!budget)
            return res.status(404).json({ message: 'Budgets Not Found' });
        
        await budget.destroy();
        res.status(200).json({message: "Success"});
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    };
});

router.patch("/edit/:id", validateToken, async (req,res) => {
    try{
        const bgid = req.params.id;
        const {amount, remark} = req.body;

        const {error, value} = BSchema.validate({amount, remark});

        if (error) 
            return res.status(400).json({ error: error.details[0].message });

        const budget = await Budgets.findByPk(bgid);

        if(!budget)
            return res.status(404).json({ message: 'Budgets Not Found' });

        if(amount !==undefined) budget.amount=amount;
        if(remark !==undefined) budget.remark=remark;
        
        await budget.save();

        res.status(200).json({ message: 'budgets updated successfully', budget });

    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    };

});


module.exports = router;