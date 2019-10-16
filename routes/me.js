var express = require('express');
var router = express.Router();
/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(req);
  if (req.err || !req.user) {
    return next(req.err);
}
  else return res.status(200).send(req.user);
});


module.exports = router;