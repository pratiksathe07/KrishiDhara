/**
 * Authoritative list of allowed labour skills.
 * All skill submissions from frontend are validated against this list.
 * Never trust the frontend skill list.
 */
const ALLOWED_SKILLS = [
  "Plowing",
  "Harrowing",
  "Land Leveling",
  "Field Cleaning",
  "Seed Sowing",
  "Seedling Transplanting",
  "Planting",
  "Irrigation Management",
  "Watering Crops",
  "Fertilizer Application",
  "Organic Manure Application",
  "Compost Application",
  "Weeding",
  "Thinning",
  "Hoeing",
  "Pest Control",
  "Disease Control",
  "Crop Monitoring",
  "Pruning",
  "Harvesting",
  "Fruit Picking",
  "Vegetable Picking",
  "Crop Cutting",
  "Threshing",
  "Grain Drying",
  "Grain Cleaning",
  "Sorting and Grading",
  "Weighing and Packing",
  "Loading and Unloading",
  "Livestock Feeding",
  "Livestock Herding",
  "Animal Shed Cleaning",
  "Fence Repair",
  "Farm Equipment Maintenance",
  "Tractor Operation",
  "Agricultural Produce Transportation",
];

module.exports = { ALLOWED_SKILLS };
