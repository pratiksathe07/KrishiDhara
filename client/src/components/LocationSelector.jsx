/**
 * LocationSelector — Cascading State → District → Taluka → Village dropdowns.
 * Fetches each level from the API when the parent level changes.
 * Clears child selections when a parent changes.
 */
import { useState, useEffect } from "react";
import Select from "./ui/Select";
import { getStates, getDistricts, getTalukas, getVillages } from "../services/locationService";

const LocationSelector = ({ value = {}, onChange, errors = {} }) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [villages, setVillages] = useState([]);

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTalukas, setLoadingTalukas] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Load states on mount
  useEffect(() => {
    getStates()
      .then((res) => setStates(res.data.data))
      .catch(() => {});
  }, []);

  // Load districts when stateId changes
  useEffect(() => {
    if (!value.stateId) {
      setDistricts([]);
      setTalukas([]);
      setVillages([]);
      return;
    }
    setLoadingDistricts(true);
    getDistricts(value.stateId)
      .then((res) => setDistricts(res.data.data))
      .catch(() => setDistricts([]))
      .finally(() => setLoadingDistricts(false));
  }, [value.stateId]);

  // Load talukas when districtId changes
  useEffect(() => {
    if (!value.districtId) {
      setTalukas([]);
      setVillages([]);
      return;
    }
    setLoadingTalukas(true);
    getTalukas(value.districtId)
      .then((res) => setTalukas(res.data.data))
      .catch(() => setTalukas([]))
      .finally(() => setLoadingTalukas(false));
  }, [value.districtId]);

  // Load villages when talukaId changes
  useEffect(() => {
    if (!value.talukaId) {
      setVillages([]);
      return;
    }
    setLoadingVillages(true);
    getVillages(value.talukaId)
      .then((res) => setVillages(res.data.data))
      .catch(() => setVillages([]))
      .finally(() => setLoadingVillages(false));
  }, [value.talukaId]);

  const handleStateChange = (e) => {
    const stateId = e.target.value;
    const stateName = states.find((s) => s.id === stateId)?.name || "";
    onChange({
      stateId,
      state: stateName,
      districtId: "",
      district: "",
      talukaId: "",
      taluka: "",
      villageId: "",
      village: "",
    });
  };

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    const districtName = districts.find((d) => d.id === districtId)?.name || "";
    onChange({
      ...value,
      districtId,
      district: districtName,
      talukaId: "",
      taluka: "",
      villageId: "",
      village: "",
    });
  };

  const handleTalukaChange = (e) => {
    const talukaId = e.target.value;
    const talukaName = talukas.find((t) => t.id === talukaId)?.name || "";
    onChange({
      ...value,
      talukaId,
      taluka: talukaName,
      villageId: "",
      village: "",
    });
  };

  const handleVillageChange = (e) => {
    const villageId = e.target.value;
    const villageName = villages.find((v) => v.id === villageId)?.name || "";
    onChange({ ...value, villageId, village: villageName });
  };

  return (
    <div className="space-y-0">
      <Select
        id="state"
        label="State"
        placeholder="Select State"
        value={value.stateId || ""}
        onChange={handleStateChange}
        options={states.map((s) => ({ value: s.id, label: s.name }))}
        error={errors.stateId}
      />

      <Select
        id="district"
        label="District"
        placeholder={loadingDistricts ? "Loading..." : "Select District"}
        value={value.districtId || ""}
        onChange={handleDistrictChange}
        options={districts.map((d) => ({ value: d.id, label: d.name }))}
        disabled={!value.stateId || loadingDistricts}
        error={errors.districtId}
      />

      <Select
        id="taluka"
        label="Taluka (Sub District)"
        placeholder={loadingTalukas ? "Loading..." : "Select Taluka"}
        value={value.talukaId || ""}
        onChange={handleTalukaChange}
        options={talukas.map((t) => ({ value: t.id, label: t.name }))}
        disabled={!value.districtId || loadingTalukas}
        error={errors.talukaId}
      />

      <Select
        id="village"
        label="Village"
        placeholder={loadingVillages ? "Loading..." : "Select Village"}
        value={value.villageId || ""}
        onChange={handleVillageChange}
        options={villages.map((v) => ({ value: v.id, label: v.name }))}
        disabled={!value.talukaId || loadingVillages}
        error={errors.villageId}
      />
    </div>
  );
};

export default LocationSelector;
