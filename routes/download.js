var express = require("express");
var router = express.Router();

/* GET Download page. */
router.get("/", function(req, res, next) {
  res.render("download");
});

module.exports = router;
