const path = require('path');
const multer = require('multer');


var Storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads/productImages')
    },
    filename: function(req, file, cb){
        let ext = path.extname(file.originalname)
        cb(null, Date.now() + ext)
    }
})


var upload = multer ({
    storage: Storage,
    fileFilter: function(req, file, callback) {
        if( file.mimetype == "image/png" ||
            file.mimetype == "image/jpg"
        ){
            callback(null, true)
        } else {
            console.log('Only jpg & png files supported!!')
            callback(null, false)
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 8
    }
})

module.exports = upload