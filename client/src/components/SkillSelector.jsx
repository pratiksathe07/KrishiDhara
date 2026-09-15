import { useState } from "react";
import { LABOR_SKILLS } from "../constants/laborSkills";

/**
 * SkillSelector — multi-select chip grid for labor skills.
 * Shows selected count. All chips are touch-friendly.
 */
const SkillSelector = ({ value = [], onChange, error }) => {
  const [search, setSearch] = useState("");

  const filtered = LABOR_SKILLS.filter((skill) =>
    skill.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (skill) => {
    if (value.includes(skill)) {
      onChange(value.filter((s) => s !== skill));
    } else {
      onChange([...value, skill]);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="input-label mb-0">Select Skills</span>
        <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
          {value.length} selected
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Choose the skills you want to assign to your profile.
      </p>

      {/* Search filter */}
      <input
        type="text"
        placeholder="Search skills..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-field mb-3 text-sm py-2"
        aria-label="Search skills"
      />

      <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-0.5 rounded-xl border border-surface-200 bg-surface-50 p-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 py-2 w-full text-center">No skills found.</p>
        ) : (
          filtered.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggle(skill)}
              aria-pressed={value.includes(skill)}
              className={`chip ${value.includes(skill) ? "chip-selected" : "chip-unselected"}`}
            >
              {value.includes(skill) && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {skill}
            </button>
          ))
        )}
      </div>

      {value.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-red-500 hover:text-red-600 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {error && <p className="error-text" role="alert">{error}</p>}
    </div>
  );
};

export default SkillSelector;
