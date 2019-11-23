var express = require("express");
var router = express.Router();

/* GET Global Content page. */
router.get("/", function(req, res, next) {
  res.render("globals", { title: "Global Content" });
});

module.exports = router;
