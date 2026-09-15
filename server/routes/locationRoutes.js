const express = require("express");
const { getStates, getDistricts, getTalukas, getVillages } = require("../controllers/locationController");

const router = express.Router();

router.get("/states", getStates);
router.get("/states/:stateId/districts", getDistricts);
router.get("/districts/:districtId/talukas", getTalukas);
router.get("/talukas/:talukaId/villages", getVillages);

module.exports = router;
