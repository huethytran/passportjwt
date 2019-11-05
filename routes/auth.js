const express = require('express');
const router  = express.Router();
const controller = require("../controller/auth");
/* POST login. */
router.post('/login', controller.login);

router.post('/register', controller.register);
    router.post('/changepassword',controller.validateToken, controller.changePassword);
    router.post('/updateinfo', controller.validateToken, controller.updateinfo);
    router.post('/forgotpassword', controller.forgotpassword);
    router.post('/uploadavatar', controller.validateToken, controller.avatar);
    router.get('/getinfo', controller.validateToken, controller.getinfo);
    router.post('/facebook', controller.loginFacebook );
    router.post('/google', controller.loginGoogle );
/*router.route('/auth/google')
    .post(passport.authenticate('google-token', {session: false}), function(req, res, next) {
        if (!req.user) {
            return res.send(401, 'User Not Authenticated');
        }
        req.auth = {
            id: req.user.id
        };

        next();
    }, generateToken, sendToken);*/


module.exports = router;