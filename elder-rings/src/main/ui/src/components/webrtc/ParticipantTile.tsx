import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { twMerge } from "tailwind-merge";
import PrimeSpinnerDotted from "~icons/prime/spinner-dotted";

import { apiClient } from "@openapi/zodiosClient";
import { ContactDto } from "@type/openapiTypes";
import { useAudioFilters } from "../../hooks/useAudioFilters";

export interface ParticipantTileProps {
  userId: string;
  stream: MediaStream | null;
  /** the last thing this participant was heard saying */
  caption?: string;
  className?: string;
}

/**
 * One remote participant of the call. The audio filters are applied here rather
 * than in the call page: a media element can only be routed once through the
 * audio graph, so each tile owns its own chain.
 */
export default function ParticipantTile({
  userId,
  stream,
  caption,
  className,
}: Readonly<ParticipantTileProps>) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { handlePlay } = useAudioFilters(videoRef);
  const [contact, setContact] = useState<ContactDto | null>(null);

  useEffect(() => {
    apiClient
      .getUser({ queries: { userId } })
      .then(setContact)
      .catch(() => setContact(null));
  }, [userId]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const name = contact ? `${contact.firstName} ${contact.lastName}` : "";

  return (
    <div className={twMerge("relative bg-black rounded-lg overflow-hidden", className)}>
      <video
        ref={videoRef}
        onPlay={handlePlay}
        autoPlay
        playsInline
        className={twMerge("h-full w-full object-contain", stream ? "" : "hidden")}
      />

      {!stream && (
        <div className="h-full w-full flex flex-col items-center justify-center gap-3 bg-gray-200">
          <PrimeSpinnerDotted className="animate-spin h-10 w-10 text-gray-600/80" />
          <p className="text-center font-semibold text-xl text-gray-700">
            {t("Pages.CallRoom.WaitingUserToJoin")}
          </p>
        </div>
      )}

      {name && (
        <p className="absolute top-2 left-2 bg-black/60 text-white rounded-full px-4 py-1 text-lg">
          {name}
        </p>
      )}

      {caption && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-[90%] bg-black/60 text-white text-3xl px-6 py-3 rounded-lg text-center">
          {caption}
        </p>
      )}
    </div>
  );
}
