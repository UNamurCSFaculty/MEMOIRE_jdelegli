import BackHomeButton from "@components/navigation/BackHomeButton";

export interface CallEndedScreenProps {
  message: string;
}

export default function CallEndedScreen({ message }: Readonly<CallEndedScreenProps>) {
  return (
    <div className="flex flex-col w-full h-full items-center justify-center grow gap-8">
      <div className="text-white bg-black/40 text-4xl font-semibold p-8 rounded-lg">
        {message}
      </div>
      <BackHomeButton size="lg" shortcuts={["Enter"]} autoFocus />
    </div>
  );
}
