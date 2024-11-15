const express = require("express")
const router = express.Router();
const {Categories, Icons, Transactions, Budgets} = require("../models");
const {validateToken} = require("../middlewares/authMW");
const Joi = require('joi');
const {Op} = require('sequelize')

const CategoriesSchema = Joi.object({
    name: Joi.string().min(1).max(255),
    IconId: Joi.number().integer().min(1),
    is_income: Joi.boolean(),
}).min(1);

//create categories
router.post("/", validateToken, async (req, res) => {
    const categories = req.body;
    const uid = req.user.id;
    const {error, value} = CategoriesSchema.validate(categories);

    if (error) 
        return res.status(400).json({ error: error.details[0].message });

    try{
        await Categories.create({
            name:categories.name,
            IconId: categories.IconId,
            is_income: categories.is_income,
            UserId:uid
        });

        res.status(201).json({ message: "Category Created Successfully!" }); // Changed status to 201
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
});

//update
router.patch("/edit/:id", validateToken, async (req, res) => {

    const cid = req.params.id;
    const {name, IconId, is_income} = req.body;
    const {error, value} = CategoriesSchema.validate({name, IconId, is_income});

    if(error)
        return res.status(400).json({ error: error.details[0].message });

    try{
        const category = await Categories.findByPk(cid);

        if(!category)
            return res.status(404).json({ message: 'Category Not Found' });

        if(name !==undefined) category.name=name;
        if(IconId !==undefined) category.IconId =IconId;
        if(is_income !==undefined) category.is_income=is_income;

        await category.save();

        res.status(200).json({ message: 'Category updated successfully', category });
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    };
});

router.get("/viewAll", validateToken, async (req, res) => {

    try{
        const uid = req.user.id;
        const cate = await Categories.findAll({
            where: {UserId:uid}, 
            include: [{model: Icons}]
        });

        const cateincome = await Categories.findAll({
            where: {UserId:uid, is_income:1}, 
            include: [{model: Icons}]
        });

        const cateexpense = await Categories.findAll({
            where: {UserId:uid, is_income:0}, 
            include: [{model: Icons}]
        });

        const catebudget = await Categories.findAll({
            where: {
              UserId: uid,
              is_income: 0 
            },
            include: [
              {
                model: Icons
              },
              {
                model: Budgets,
                where: {
                  UserId: uid
                },
                required: false, 
              }
            ]
          });
          
          const filteredCatebudget = catebudget.filter(category => {
            return !category.Budgets || category.Budgets.length === 0;
          });
        
        if(!cate)
            return res.status(404).json({ message: 'Category Not Found' });
        
        res.status(200).json({cate, cateincome, cateexpense, catebudget:filteredCatebudget});
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    };
});

router.get("/view/:id", validateToken, async (req, res) => {

    const cid = req.params.id;

    try{
        const cate = await Categories.findOne({where:{id:cid}, include:[{model:Icons}]});
        if(!cate)
            return res.status(404).json({ message: 'Category Not Found' });

        res.status(200).json(cate);
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    };
});

router.get("/someCate/:id", validateToken, async (req, res) => {

    const cid = req.params.id;
    userId = req.user.id;

    try{
        const cate = await Categories.findOne({where:{id:cid}});

        const category = await Categories.findAll({where:{
                                                    is_income:cate.is_income,
                                                    id: { [Op.ne]: cid },
                                                    UserId:userId 
                                                }, include:[{model:Icons}]});
        
        if(!cate)
            return res.status(404).json({ message: 'Category Not Found' });

        res.status(200).json(category);
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    };
});

router.delete("/dlt/:id", validateToken, async (req, res) => {

    const cid = req.params.id;

    try{
        const cate = await Categories.findByPk(cid);
        if (!cate) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await Transactions.destroy(
            {where: {CategoryId: cid}}
        );

        await Budgets.destroy(
            {where: {CategoryId: cid}}
        );

        await cate.destroy();

        res.status(200).json({ message: 'Category deleted successfully' });
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    };
});



module.exports = router;