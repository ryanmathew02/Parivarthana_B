const router = require('express').Router();

const product = require('../../models/product');

router.get('/getProducts', async (req,res)=>{
    try {
        const data = await product.find();
        console.log(data)
        return res.send((data))
    } catch (error) {
        res.status(500).json({message:error})
    }
})

module.exports = router