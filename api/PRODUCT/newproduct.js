const { response } = require('express');
const product = require('../../models/product');

const router = require('express').Router();


router.post('/register', (req, res) => {
        console.log(req.body);
        let newProduct = new product({
            name: req.body.pname,
            images: req.body.ImgeUrls,
            // inStock: req.body.inStock,
            // des: req.body.des,
            // cost: req.body.cost,
            // category: req.body.category
        })
        // if(req.files){
        //     let path = ''
        //     req.files.forEach(function(files, index, arr){
        //         path = path + files.path + ','
        //     })
        //     path = path.substring(0, path.lastIndexOf(","))
        //     newProduct.image = path
        // }
        newProduct.save()
            .then( response => {
                res.json({
                    status: true,
                    message: "New Product added successfully!!"
                })
            })
            .catch(error => {
                console.log(error);
                res.json({
                    status: false,
                    message: "An Error occured while uploading the new product!!"
                })
            })

})

module.exports = router;