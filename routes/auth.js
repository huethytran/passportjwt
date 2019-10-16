const express = require('express');
const router  = express.Router();
const jwt = require('jsonwebtoken');
const passport = require("passport");
var UserDB = require("../models/user");
/* POST login. */
router.post('/login', function (req, res, next) {
    
    passport.authenticate('local', (err, user, info) => {
        if (err || !user) {
            return next(err);
        }
       req.login(user, (err) => {
           var result = {};
           if (err) {
            return next(err);
           }
           
           // generate a signed son web token with the contents of user object and return it in the response
           const token = jwt.sign(user.toJSON(), process.env.SECRET_KEY, {
            expiresIn: 20
          });

           return res.status(200).send({user, token});
        });
    })(req, res, next);
       
});


function UserRegisterValidation(data, cb) {
    UserDB.getFromUsername(data.username, function (err, data){
        if (err)  return cb("Lỗi không xác định, vui lòng đăng ký lại!");
        if (data) return cb("Username này đã được đăng ký, vui lòng sử dụng username khác!");
        cb(null);
    });
}

router.post('/register',function (req, res, next) {
    var data = {
        username: req.body.username,
        password: req.body.password,
        name: req.body.name,
        age: req.body.age,
        gender: req.body.gender
        
    };

    var result = {};
    var status = 200;
    UserRegisterValidation(data, function (msg) {
        if (msg == null) {
            UserDB.create(data, function (err, id) {
                if (err) {
                    console.log("[UserController] Failed to add user to database: " + err);
                    status = 500;
                    result.status = status;
                    result.error = "Có lỗi trong quá trình tạo cơ sở dữ liệu, vui lòng thử lại!"
                    res.status(status).send(result);
                } else {
                    console.log("[UserController] Success create user with ID: " + id);
                    status = 200;
                    result.status = status;
                    result.id = id;
                    res.status(status).send(result);
                }
            });
        } else {
            status = 406;
            result.status = status;
            result.error = msg
            res.status(status).send(result);
        }
    })
});



module.exports = router;