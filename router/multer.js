var express = require('express');
const multer = require('multer');
var fs = require('fs');
var router = express.Router();

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/images/');
    },

    filename : function(req, file, cb){
        var testSn = req.body.TEST_SN;
        var qSn = req.body.Q_SN;

        var mimeType;

        switch(file.mimetype){
            case "image/jpeg":
                mimeType = "jpg";
                break;
            case "image/png":
                mimeType = "png";
                break;
            case "image/gif":
                mimeType = "gif";
                break;
            case "image/bmp":
                mimeType = "bmp";
                break;
            default:
                mimeType = "jpg";
                break;
        }
        cb(null, file.originalname);
        // cb(null, testSn + "_" + qSn + "."+ mimeType);
    }
})

var upload = multer({storage:storage});

router.post('/test/save', upload.array('IMG_FILE'), function (req, res) {
  
    var testSn = req.body.TEST_SN;
    var qSnArr = req.body.Q_SN;
    var imgFileArr = req.files; //파일 객체를 배열 형태로 리턴함.
    //var imgFile = req.file; //파일이 1개인 경우(upload.single()을 이용한 경우)
    console.log(req.body.TEST_SN);
    res.redirect('/');
});

router.post('/delete', function(req, res){
    var deleteList = req.body.img_chk;
    
    
    if(!Array.isArray(deleteList)){
        fs.unlink(`./public/images/${deleteList}`, function(err){
            console.log('file deleted');
        })
    }
    else{
        for(var i=0;i<deleteList.length;i++){
            fs.unlink(`./public/images/${deleteList[i]}`, function(err){
                console.log('file deleted');
            })
        }
    }
    
    res.redirect('/');
})

module.exports = router;