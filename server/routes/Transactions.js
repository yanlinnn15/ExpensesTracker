const express = require('express');
const router = express.Router();
const {Transactions, Categories, Icons} = require("../models");
const {validateToken} = require("../middlewares/authMW");
const Joi = require("joi");
const { Op, fn, col } = require('sequelize');


const ESchema = Joi.object({
    date: Joi.date().iso().custom((value, helpers) => {
        const dateString = value.toISOString().split('T')[0]; // Extracting only the date part
        if (dateString !== value.toISOString().split('T')[0]) {
            return helpers.error('any.invalid');
        }
        return value;
    }),
    amount: Joi.number()
                .precision(2)
                .min(0.01)
                .max(99999999999999999999.99),
    remark: Joi.string().min(0).max(255),
    CategoryId: Joi.number().integer().min(1),
    type: Joi.boolean(),
}).min(1);


//create Transactions
router.post("/", validateToken, async (req,res) => {
    const transaction = req.body;
    const uid = req.user.id;
    const {error, value} = ESchema.validate(transaction);

    if (error) 
        return res.status(400).json({ error: error.details[0].message });

    try{
        const trans = await Transactions.create({
            date:transaction.date,
            amount: transaction.amount,
            remark: transaction.remark,
            CategoryId: transaction.CategoryId,
            type:transaction.type,
            UserId: uid
        });
        

        res.status(201).json({ message: "Transactions Created Successfully!", trans });
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
});

//view transaction
router.get("/viewAll", validateToken, async (req, res) => {
    
    try{
        const mth = req.query.mth;
        const uid = req.user.id;

        const startDate = new Date(`${mth}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1); 
        endDate.setDate(0);

        let whereClause = { UserId: uid };
        
        whereClause = {
            ...whereClause,
            date :{  [Op.between]: [startDate, endDate]  },
        };

        const transaction = await Transactions.findAll({
            where: whereClause,
            include: [
                {
                    model: Categories,
                    include: [
                        {
                            model: Icons
                        },
                    ]
                },
            ],
            order: [['date', 'DESC']], 
        });

        const transactionLatest = await Transactions.findAll({
            where: { UserId: uid },
            include: [
                {
                    model: Categories,
                    include: [
                        {
                            model: Icons
                        },
                    ]
                },
            ],
            order: [['updatedAt', 'DESC']], 
            limit: 5,
        });

        if(!transaction)
            return res.status(400).json({ message: 'Transactions Not Found' });

        const ttlIncome = await Transactions.sum("amount", {
                where: {
                    ...whereClause, 
                    type:1
                }
            });
        
        const ttlExpense = await Transactions.sum("amount", {
            where: {
                ...whereClause, 
                type:0
            }
        });

        const monthly = await Transactions.findAll({
            attributes: [
              [fn('YEAR', col('date')), 'year'],
              [fn('MONTH', col('date')), 'month'],
              [fn('SUM', col('amount')), 'totalAmount'],
              [col('type'), 'type']
            ],
            where: { ...whereClause},
            group: [fn('YEAR', col("date")), fn('MONTH', col("date")), "CategoryId", 'type'],
            order: [
              [fn('YEAR', col('date')), 'DESC'], 
              [fn('MONTH', col('date')), 'DESC']
            ],
            include: [
                {
                    model: Categories,
                    include: [
                        {
                            model: Icons
                        },
                    ]
                },
            ],
          });

        res.status(200).json({
            monthly: monthly,
            transaction: transaction || [],
            ttlIncome: (ttlIncome !== null && ttlIncome !== undefined) ? ttlIncome.toFixed(2) : "0.00",
            ttlExpense: (ttlExpense !== null && ttlExpense !== undefined) ? ttlExpense.toFixed(2) : "0.00",
            latestTrans: transactionLatest || [],
        })
        }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    };

});

router.get("/viewMonth", validateToken, async (req, res) => {
    
    try{
        const uid = req.user.id;
        const year = new Date().getFullYear();

        let whereClause = { UserId: uid };
        
        whereClause = {
            ...whereClause,
            date :{  
                [Op.gte]: new Date(`${year}-01-01`), 
                [Op.lt]: new Date(`${year}-12-31`), 
             },
        };

        const monthlyE = await Transactions.findAll({
            attributes: [
                [fn('YEAR', col('date')), 'year'],
                [fn('MONTH', col('date')), 'month'],
                [fn('SUM', col('amount')), 'totalAmount']
            ],where: {... whereClause, type:0},
            group: [fn('YEAR', col("date")), fn('MONTH', col("date"))],
            order : [[fn('YEAR', col('date')), 'DESC'], 
                    [fn('MONTH', col('date')), 'DESC']]
        });

        const monthlyI = await Transactions.findAll({
            attributes: [
                [fn('YEAR', col('date')), 'year'],
                [fn('MONTH', col('date')), 'month'],
                [fn('SUM', col('amount')), 'totalAmount']
            ],where: {... whereClause, type:1},
            group: [fn('YEAR', col("date")), fn('MONTH', col("date"))],
            order : [[fn('YEAR', col('date')), 'DESC'], 
                    [fn('MONTH', col('date')), 'DESC']]
        });

        if(!monthlyE && !monthlyI)
            return res.status(400).json({ message: 'Transactions Not Found' });

        const ttlIncome = await Transactions.sum("amount", {
                where: {
                    ...whereClause, 
                    type:1
                }
            });
        
        const ttlExpense = await Transactions.sum("amount", {
            where: {
                ...whereClause, 
                type:0
            }
        });

        const surplus = ttlIncome - ttlExpense;

        res.status(200).json({
            monthlyE: monthlyE || [],
            monthlyI: monthlyI || [],
            ttlIncome: (ttlIncome !== null && ttlIncome !== undefined) ? ttlIncome.toFixed(2) : "0.00",
            ttlExpense: (ttlExpense !== null && ttlExpense !== undefined) ? ttlExpense.toFixed(2) : "0.00",
            surplus: (surplus !== null && surplus !== undefined) ? surplus.toFixed(2) : "0.00"
        })
        }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    };

});

router.get("/view/:id", validateToken, async (req, res) => {
    
    try{
        const uid = req.user.id;
        const eid = req.params.id;
        const transaction = await Transactions.findAll({
            where: {id:eid}, 
            include:[
                {model: Categories,
                    include:[{
                        model: Icons
                    },
                ]},
            ]});

        if(!transaction)
            return res.status(404).json({ message: 'Transactions Not Found' });

        res.status(200).json(transaction);
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    };

});


router.get("/count/:id", validateToken, async (req, res) => {
    
    try{
        const uid = req.user.id;
        const cateid = req.params.id;
        const { count, rows } = await Transactions.findAndCountAll({
            where: {
                UserId: uid,
                CategoryId: cateid
            },
            include: [
                {
                    model: Categories,
                    include: [
                        {
                            model: Icons
                        }
                    ]
                }
            ]
        });

        res.status(200).json({
            countT: count,
            cate:rows
        });
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    };

});

router.delete("/dlt/:id", validateToken, async (req, res) => {
    try{
        const eid = req.params.id;
        const transaction = await Transactions.findByPk(eid);
        
        if(!transaction)
            return res.status(404).json({ message: 'Transactions Not Found' });
        
        await transaction.destroy();
        return res.status(200).json({ message: 'Transaction deleted successfully' });
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    };
});


router.delete("/dltcate/:id", validateToken, async (req, res) => {
    try{
        const eid = req.params.id;
        const transaction = await Transactions.destroy({where: {CategoryId: eid}});
        
        return res.status(200).json({ message: 'Transaction deleted successfully' });
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    };
});

router.patch("/edit/:id", validateToken, async (req, res) => {
    try {
        const eid = req.params.id;
        const { date, amount, remark, CategoryId } = req.body;

        const { error, value } = ESchema.validate({ date, amount, remark, CategoryId });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const transaction = await Transactions.findByPk(eid);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction Not Found' });
        }

        let cate;
        if (CategoryId !== undefined) {
            cate = await Categories.findByPk(CategoryId);
            if (!cate) {
                return res.status(404).json({ message: 'Category Not Found' });
            }
        }

        if (date !== undefined) transaction.date = date;
        if (amount !== undefined) transaction.amount = amount;
        if (remark !== undefined) transaction.remark = remark;
        if (CategoryId !== undefined) {
            transaction.CategoryId = CategoryId;
            transaction.type = cate.is_income; // Assuming cate is valid at this point
        }

        await transaction.save();

        res.status(200).json({ message: 'Transaction updated successfully', transaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;