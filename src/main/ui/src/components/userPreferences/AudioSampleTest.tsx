import { useRef } from "react";
import { UserFrequencyGainDto } from "@type/openapiTypes";
import { useAudioFilters } from "../../hooks/useAudioFilters";
import { basePath } from "../../../basepath.config";

interface AudioSampleTestProps {
  eqBands: UserFrequencyGainDto[];
  compression: boolean;
}

export default function AudioSampleTest({ eqBands, compression }: Readonly<AudioSampleTestProps>) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { handlePlay } = useAudioFilters(audioRef, eqBands, compression);

  return (
    <div className="flex">
      <audio ref={audioRef} controls onPlay={handlePlay} crossOrigin="anonymous">
        <source src={basePath + "/api/media/sounds/phoneconversationsample.mp3"} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
