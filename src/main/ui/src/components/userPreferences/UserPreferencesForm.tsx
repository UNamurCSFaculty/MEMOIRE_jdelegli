import { apiClient } from "@openapi/zodiosClient";
import { UserPreferencesDto } from "@type/openapiTypes";
import { useState } from "react";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import AudioSampleTest from "./AudioSampleTest";

interface UserPreferencesFormProps {
  initialPreferences?: UserPreferencesDto;
}

export default function UserPreferencesForm({
  initialPreferences,
}: Readonly<UserPreferencesFormProps>) {
  const { userPreferences, refreshUserPreferences } = useUserPreferences();
  const [formData, setFormData] = useState<UserPreferencesDto>(
    initialPreferences ?? userPreferences
  );

  const handleChange = <
    Section extends keyof UserPreferencesDto,
    Value = NonNullable<UserPreferencesDto[Section]> extends infer SectionType
      ? SectionType extends object
        ? SectionType[keyof SectionType]
        : never
      : never
  >(
    section: Section,
    key: keyof NonNullable<UserPreferencesDto[Section]>,
    value: Value
  ) => {
    setFormData((prev) => {
      const currentSection = prev[section];

      return {
        ...prev,
        [section]: currentSection
          ? {
              ...currentSection,
              [key]: value,
            }
          : ({ [key]: value } as UserPreferencesDto[Section]),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.updateCurrentUserPreferences(formData);
      await refreshUserPreferences?.();
      alert("Preferences updated!");
    } catch (err) {
      console.error("Failed to update preferences", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* General */}
      <section>
        <h2 className="text-lg font-semibold mb-2">General</h2>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.general?.isPublic}
            onChange={(e) => handleChange("general", "isPublic", e.target.checked)}
          />
          Profil public
        </label>
        <label className="block mb-2">
          Langue
          <select
            value={formData.general?.lang}
            onChange={(e) => handleChange("general", "lang", e.target.value)}
            className="mt-1 block border border-gray-300 rounded p-1"
          >
            <option value="sm">Français</option>
            <option value="md">English</option>
            <option value="lg">Nederlands</option>
          </select>
        </label>
      </section>

      {/* Visual */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Visual</h2>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.visual?.readTextOnScreen}
            onChange={(e) => handleChange("visual", "readTextOnScreen", e.target.checked)}
          />
          Read text on screen
        </label>
        <label className="block mb-2">
          Text size
          <select
            value={formData.visual?.textSize}
            onChange={(e) => handleChange("visual", "textSize", e.target.value)}
            className="mt-1 block border border-gray-300 rounded p-1"
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">Extra Large</option>
            <option value="2xl">2X Large</option>
          </select>
        </label>
      </section>

      {/* Audio */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Audio Preferences</h2>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.audio?.noiseReduction}
            onChange={(e) => handleChange("audio", "noiseReduction", e.target.checked)}
          />
          Noise reduction
        </label>

        <h3 className="text-md font-semibold mb-2">Audio Filters</h3>
        {formData.audio?.filters?.map((filter, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="number"
              placeholder="Frequency (Hz)"
              value={filter.frequency}
              onChange={(e) => updateAudioFilter(index, "frequency", parseInt(e.target.value, 10))}
              className="w-32 border border-gray-300 rounded p-1"
            />
            <input
              type="number"
              placeholder="Gain"
              value={filter.gain}
              onChange={(e) => updateAudioFilter(index, "gain", parseFloat(e.target.value))}
              className="w-24 border border-gray-300 rounded p-1"
            />
            <button
              type="button"
              onClick={() => removeAudioFilter(index)}
              className="text-red-600 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addAudioFilter} className="text-blue-600 text-sm">
          + Add filter
        </button>

        <h3 className="text-md font-semibold mb-2">Test the configuration</h3>
        <AudioSampleTest
          eqBands={formData.audio?.filters ?? []}
          noiseReduction={formData.audio?.noiseReduction ?? false}
        />
      </section>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Save Preferences
      </button>
    </form>
  );

  function updateAudioFilter(index: number, field: "frequency" | "gain", value: number) {
    const updatedFilters = formData.audio?.filters ? [...formData.audio.filters] : [];
    updatedFilters[index] = { ...updatedFilters[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      audio: {
        ...prev.audio,
        filters: updatedFilters,
      },
    }));
  }

  function addAudioFilter() {
    setFormData((prev) => ({
      ...prev,
      audio: {
        ...prev.audio,
        filters: prev.audio?.filters
          ? [...prev.audio.filters, { frequency: 1000, gain: 0 }]
          : [{ frequency: 1000, gain: 0 }],
      },
    }));
  }

  function removeAudioFilter(index: number) {
    setFormData((prev) => ({
      ...prev,
      audio: {
        ...prev.audio,
        filters: prev.audio?.filters?.filter((_, i) => i !== index),
      },
    }));
  }
}
