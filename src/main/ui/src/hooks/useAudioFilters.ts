import { useEffect, useRef } from "react";
import { useUserPreferences } from "./useUserPreferences";
import { UserFrequencyGainDto } from "@type/openapiTypes";

export function useAudioFilters(
  audioRef: React.RefObject<HTMLMediaElement>,
  eqBands?: UserFrequencyGainDto[],
  noiseReduction?: boolean
) {
  const { userPreferences } = useUserPreferences();
  const eqBandsFinal = eqBands ?? userPreferences?.audio?.filters;
  const noiseReductionFinal = noiseReduction ?? userPreferences?.audio?.noiseReduction;
  const audioContext = useRef<AudioContext | null>(null);
  const sourceNode = useRef<MediaElementAudioSourceNode | null>(null);
  const filterNodes = useRef<BiquadFilterNode[]>([]);
  const compressorNode = useRef<DynamicsCompressorNode | null>(null);
  const lowPassNode = useRef<BiquadFilterNode | null>(null);
  const lastNode = useRef<AudioNode | null>(null);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    // Initialize AudioContext and source once
    if (!audioContext.current) {
      const context = new AudioContext();
      audioContext.current = context;
      sourceNode.current = context.createMediaElementSource(audioEl);
    }

    const ctx = audioContext.current;
    const source = sourceNode.current!;

    // Disconnect previous filter chain
    try {
      if (lastNode.current) lastNode.current.disconnect();
    } catch (e) {
      console.error("Error while disconecting filters : ", e);
    }
    filterNodes.current.forEach((node) => {
      try {
        node.disconnect();
      } catch (e) {
        console.error("Error while disconecting filters : ", e);
      }
    });
    if (lowPassNode.current) {
      try {
        lowPassNode.current.disconnect();
      } catch (e) {
        console.error("Error while disconecting filters : ", e);
      }
      lowPassNode.current = null;
    }

    // Build EQ filters
    const filters = eqBandsFinal?.map(({ frequency, gain }) => {
      const filter = ctx.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = frequency!;
      filter.gain.value = gain!;
      return filter;
    });
    if (filters && filters.length > 0) {
      filterNodes.current = filters;
    }

    // Connect filter chain
    if (filters && filters.length > 0) {
      source.connect(filters[0]);
      for (let i = 0; i < filters.length - 1; i++) {
        filters[i].connect(filters[i + 1]);
      }
      lastNode.current = filters[filters.length - 1];
    } else {
      lastNode.current = source;
    }

    // Apply optional noise reduction
    if (noiseReductionFinal) {
      //
      // Simple solution with lowpass, not optimal as might overlapse with the other biquad filters we have
      //
      // const lowPass = ctx.createBiquadFilter();
      // lowPass.type = "lowpass";
      // lowPass.frequency.setValueAtTime(1000, ctx.currentTime);
      // lastNode.current.connect(lowPass);
      // lowPass.connect(ctx.destination);
      // lowPassNode.current = lowPass;
      // lastNode.current = lowPass;
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -50;
      compressor.knee.value = 40;
      compressor.ratio.value = 12;
      compressor.attack.value = 0;
      compressor.release.value = 0.25;

      lastNode.current.connect(compressor);
      compressor.connect(ctx.destination);
      compressorNode.current = compressor;
      lastNode.current = compressor;
    } else {
      lastNode.current.connect(ctx.destination);
    }
  }, [audioRef, eqBandsFinal, noiseReductionFinal]);

  const handlePlay = () => {
    if (audioContext.current?.state === "suspended") {
      audioContext.current.resume();
    }
  };

  return { handlePlay };
}
