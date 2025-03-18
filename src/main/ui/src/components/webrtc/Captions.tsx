import { MutableRefObject, useEffect, useRef, useState } from "react";

export interface CaptionsProps {
  peerConnection: MutableRefObject<RTCPeerConnection | null>;
  className?: string;
}

export default function Captions({ peerConnection, className }: Readonly<CaptionsProps>) {
  const [remoteCaption, setRemoteCaption] = useState("");

  const dataChannel = useRef<RTCDataChannel | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognition = useRef<any | null>(null);

  useEffect(() => {
    if (!peerConnection.current) {
      console.log("Peer connection not initiated yet");
      return;
    } else {
      console.log("Peer connection initiated ");
    }

    // Create a DataChannel for sending captions (only initiator)
    if (!dataChannel.current) {
      dataChannel.current = peerConnection.current.createDataChannel("captions");

      // Handle sending local captions to the remote peer
      dataChannel.current.onopen = () => {
        console.log("Data channel open, ready to send captions.");
      };

      dataChannel.current.onclose = () => {
        console.log("Data channel closed.");
      };
    }

    // Handle receiving data channel for the non-initiator
    peerConnection.current.ondatachannel = (event: RTCDataChannelEvent) => {
      const channel = event.channel;
      if (channel.label === "captions") {
        channel.onmessage = (msgEvent: MessageEvent) => {
          setRemoteCaption(msgEvent.data); // Update remote captions
        };
      }
    };

    return () => {
      // Clean up the data channel when the component unmounts
      dataChannel.current?.close();
    };
  }, [peerConnection.current]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      console.error("SpeechRecognition API is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    recognition.current = new SpeechRecognition();
    recognition.current.continuous = true;
    recognition.current.lang = "fr-FR"; // Change as needed
    recognition.current.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.current.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      if (dataChannel.current?.readyState === "open") {
        dataChannel.current?.send(transcript); // Send caption if data channel is open
      }
    };

    recognition.current.start();

    return () => {
      recognition.current?.stop();
    };
  }, []);

  return (
    <div className={className ?? ""}>
      {remoteCaption !== "" && (
        <p className="bg-black/60 text-white text-4xl px-8 py-4 rounded-lg">{remoteCaption}</p>
      )}
    </div>
  );
}
