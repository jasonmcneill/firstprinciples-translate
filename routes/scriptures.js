var express = require("express");
var router = express.Router();

/* GET Scriptures page. */
router.get("/", function(req, res, next) {
  res.render("scriptures", { title: "Scriptures" });
});

module.exports = router;
