const express = require("express")
const router = express.Router();
const {Icons} = require("../models");

//create categories
router.post("/", async (req, res) => {
    const icons = req.body;
    try{
        await Icons.create({
            icon_name: icons.icon_name,
            icon_class: icons.icon_class
        });

        res.status(201).json("Created Successful!");

    }catch(error){
        res.status(500).json({message: "Server Error"});
    }

});

router.get("/view", async (req, res) => {
    try{
        const icon = await Icons.findAll({
        });
        res.status(201).json(icon);
    }catch(error){
        res.status(500).json({message: "Server Error"});
    }
});

module.exports = router;