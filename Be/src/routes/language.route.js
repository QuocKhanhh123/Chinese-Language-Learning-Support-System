const router = require("express").Router();
const languageController = require("../controllers/language.controller");

router.post("/translate/vi-to-zh", languageController.translateViToZh);
router.post("/dictionary/lookup", languageController.lookupDictionary);

module.exports = router;
