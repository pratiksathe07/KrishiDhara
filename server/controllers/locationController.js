const locationData = require("../data/locations.json");
const AppError = require("../utils/AppError");

/** GET /api/locations/states */
const getStates = (req, res) => {
  const states = locationData.states.map(({ id, name }) => ({ id, name }));
  res.json({ success: true, data: states });
};

/** GET /api/locations/states/:stateId/districts */
const getDistricts = (req, res, next) => {
  const { stateId } = req.params;
  const state = locationData.states.find((s) => s.id === stateId);
  if (!state) return next(new AppError("State not found.", 404));

  const districts = state.districts.map(({ id, name }) => ({ id, name }));
  res.json({ success: true, data: districts });
};

/** GET /api/locations/districts/:districtId/talukas */
const getTalukas = (req, res, next) => {
  const { districtId } = req.params;

  let district = null;
  for (const state of locationData.states) {
    district = state.districts.find((d) => d.id === districtId);
    if (district) break;
  }

  if (!district) return next(new AppError("District not found.", 404));

  const talukas = district.talukas.map(({ id, name }) => ({ id, name }));
  res.json({ success: true, data: talukas });
};

/** GET /api/locations/talukas/:talukaId/villages */
const getVillages = (req, res, next) => {
  const { talukaId } = req.params;

  let taluka = null;
  for (const state of locationData.states) {
    for (const district of state.districts) {
      taluka = district.talukas.find((t) => t.id === talukaId);
      if (taluka) break;
    }
    if (taluka) break;
  }

  if (!taluka) return next(new AppError("Taluka not found.", 404));

  // Villages are stored as strings — convert to {id, name} shape for consistency
  const villages = taluka.villages.map((v) => ({
    id: v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    name: v,
  }));
  res.json({ success: true, data: villages });
};

module.exports = { getStates, getDistricts, getTalukas, getVillages };
