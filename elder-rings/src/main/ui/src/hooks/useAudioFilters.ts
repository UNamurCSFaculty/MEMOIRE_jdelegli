import { useEffect, useRef } from "react";
import { useUserPreferences } from "./useUserPreferences";
import { UserFrequencyGainDto } from "@type/openapiTypes";

/**
 * A media element can be connected to a MediaElementAudioSourceNode only once,
 * for its whole lifetime and whatever the context, so both the context and the
 * source nodes are shared instead of being rebuilt by each caller. One context
 * for the page also keeps us away from the handful a browser allows, which
 * matters now that a call shows one tile, and one filter chain, per participant.
 */
interface SharedAudioState {
  context: AudioContext | null;
  sources: WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>;
}

type GlobalWithAudio = typeof globalThis & { __elderRingsAudio?: SharedAudioState };

/**
 * Kept on globalThis rather than in a module variable so that reloading this
 * module in development does not lose track of the elements already routed,
 * which would then fail to be routed a second time.
 */
function sharedState(): SharedAudioState {
  const scope = globalThis as GlobalWithAudio;
  scope.__elderRingsAudio ??= { context: null, sources: new WeakMap() };
  return scope.__elderRingsAudio;
}

/**
 * Created once and never closed on purpose: the source nodes are bound both to
 * their element and to this context for good, so replacing it would leave them
 * connected to a dead one, and rebuilding them is impossible.
 */
function getAudioContext(): AudioContext {
  const state = sharedState();
  state.context ??= new AudioContext();
  return state.context;
}

function getSourceNode(
  element: HTMLMediaElement,
  context: AudioContext,
): MediaElementAudioSourceNode {
  const state = sharedState();
  const existing = state.sources.get(element);
  if (existing) {
    return existing;
  }
  const source = context.createMediaElementSource(element);
  state.sources.set(element, source);
  return source;
}

function disconnect(node: AudioNode | null) {
  try {
    node?.disconnect();
  } catch (e) {
    console.error("Error while disconecting filters : ", e);
  }
}

export function useAudioFilters(
  audioRef: React.RefObject<HTMLMediaElement>,
  eqBands?: UserFrequencyGainDto[],
  compression?: boolean
) {
  const { userPreferences } = useUserPreferences();
  const eqBandsFinal = eqBands ?? userPreferences?.audio?.filters;
  const compressionFinal = compression ?? userPreferences?.audio?.compression;
  const audioContext = useRef<AudioContext | null>(null);
  const sourceNode = useRef<MediaElementAudioSourceNode | null>(null);
  const filterNodes = useRef<BiquadFilterNode[]>([]);
  const lastNode = useRef<AudioNode | null>(null);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    // Initialize AudioContext and source once
    audioContext.current = getAudioContext();
    sourceNode.current = getSourceNode(audioEl, audioContext.current);

    const ctx = audioContext.current;
    const source = sourceNode.current;

    // Disconnect previous filter chain. Cutting the source first is what
    // actually detaches the old chain: it removes every output of this element
    // and touches nothing another tile built
    disconnect(source);
    filterNodes.current.forEach(disconnect);
    disconnect(lastNode.current);

    // Build EQ filters
    const filters = eqBandsFinal?.map(({ frequency, gain }) => {
      const filter = ctx.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = frequency!;
      filter.gain.value = gain!;
      return filter;
    });
    // assigned even when empty, otherwise clearing the bands would keep the
    // previous nodes alive for the lifetime of the tile
    filterNodes.current = filters ?? [];

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

    if (compressionFinal) {
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -50;
      compressor.knee.value = 40;
      compressor.ratio.value = 12;
      compressor.attack.value = 0;
      compressor.release.value = 0.25;

      lastNode.current.connect(compressor);
      compressor.connect(ctx.destination);
      lastNode.current = compressor;
    } else {
      lastNode.current.connect(ctx.destination);
    }
  }, [audioRef, eqBandsFinal, compressionFinal]);

  // The shared context outlives the component, but the chain built for this
  // element must not keep feeding it once the tile is gone
  useEffect(() => {
    return () => {
      disconnect(sourceNode.current);
      filterNodes.current.forEach(disconnect);
      disconnect(lastNode.current);
      filterNodes.current = [];
      lastNode.current = null;
    };
  }, []);

  const handlePlay = () => {
    if (audioContext.current?.state === "suspended") {
      audioContext.current.resume();
    }
  };

  return { handlePlay };
}
