var express = require("express");
var router = express.Router();

/* GET Pages page. */
router.get("/", function(req, res, next) {
  res.render("pages");
});

module.exports = router;
