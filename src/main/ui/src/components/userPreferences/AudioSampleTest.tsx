import { useRef } from "react";
import { UserFrequencyGainDto } from "@type/openapiTypes";
import { useAudioFilters } from "../../hooks/useAudioFilters";

interface AudioSampleTestProps {
  eqBands: UserFrequencyGainDto[];
  noiseReduction: boolean;
}

export default function AudioSampleTest({
  eqBands,
  noiseReduction,
}: Readonly<AudioSampleTestProps>) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { handlePlay } = useAudioFilters(audioRef, eqBands, noiseReduction);

  return (
    <div className="flex">
      <audio ref={audioRef} controls onPlay={handlePlay} crossOrigin="anonymous">
        {/* <source src={basePath + "/sample/phonecall.mp3"} type="audio/mp3" />*/}
        <source src={"http://127.0.0.1:5173/elder-rings/sample/phonecall.mp3"} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
