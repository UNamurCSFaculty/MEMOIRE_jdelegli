import { useRef, useEffect } from "react";
import { UserFrequencyGainDto } from "@type/openapiTypes";

interface AudioSampleTestProps {
  eqBands: UserFrequencyGainDto[];
  noiseReduction: boolean;
}

export default function AudioSampleTest({
  eqBands,
  noiseReduction,
}: Readonly<AudioSampleTestProps>) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const sourceNode = useRef<MediaElementAudioSourceNode | null>(null);
  const filterNodes = useRef<BiquadFilterNode[]>([]);
  const lowPassFilterRef = useRef<BiquadFilterNode | null>(null);

  useEffect(() => {
    if (audioRef.current && !audioContext.current) {
      // Create AudioContext and MediaElementSource only once
      const context = new AudioContext();
      audioContext.current = context;

      const source = context.createMediaElementSource(audioRef.current);
      sourceNode.current = source;

      // Create filter nodes for each EQ band
      filterNodes.current = eqBands.map(({ frequency, gain }) => {
        const filter = context.createBiquadFilter();
        filter.type = "peaking";
        filter.frequency.value = frequency!;
        filter.gain.value = gain!;
        return filter;
      });

      // Connect filters
      source.connect(filterNodes.current[0]);
      filterNodes.current.forEach((node, index) => {
        if (filterNodes.current[index + 1]) {
          node.connect(filterNodes.current[index + 1]);
        } else {
          node.connect(context.destination); // Connect to speakers
        }
      });

      return () => {
        // context.close(); // Cleanup when component unmounts
      };
    }
  }, []); // Empty dependency array means this will only run once when the component mounts

  // Update filter nodes when eqBands or noiseReduction change
  useEffect(() => {
    if (audioContext.current && filterNodes.current.length > 0) {
      const ctx = audioContext.current;

      // Update EQ filter values
      eqBands.forEach((band, index) => {
        const filter = filterNodes.current[index];
        if (filter) {
          filter.frequency.setValueAtTime(band.frequency!, ctx.currentTime);
          filter.gain.setValueAtTime(band.gain!, ctx.currentTime);
        }
      });

      // Disconnect previous connections
      try {
        filterNodes.current[filterNodes.current.length - 1].disconnect();
      } catch {
        /* empty */
      }

      if (lowPassFilterRef.current) {
        try {
          lowPassFilterRef.current.disconnect();
        } catch {
          /* empty */
        }
        lowPassFilterRef.current = null;
      }

      const lastFilter = filterNodes.current[filterNodes.current.length - 1];

      if (noiseReduction) {
        const lowPass = ctx.createBiquadFilter();
        lowPass.type = "lowpass";
        lowPass.frequency.setValueAtTime(1000, ctx.currentTime);
        lastFilter.connect(lowPass);
        lowPass.connect(ctx.destination);
        lowPassFilterRef.current = lowPass;
      } else {
        lastFilter.connect(ctx.destination);
      }
    }
  }, [eqBands, noiseReduction]); // Dependencies: update filters when eqBands or noiseReduction change

  const handlePlay = () => {
    if (audioRef.current && audioContext.current) {
      if (audioContext.current.state === "suspended") {
        audioContext.current.resume(); // Resume context if it's suspended
      }
    }
  };

  return (
    <div className="flex">
      <audio
        ref={audioRef}
        controls
        onPlay={handlePlay} // Trigger the context resume when user presses play
        crossOrigin="anonymous"
      >
        {/* <source src={basePath + "/sample/phonecall.mp3"} type="audio/mp3" />*/}
        <source src={"http://127.0.0.1:5173/elder-rings/sample/phonecall.mp3"} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
