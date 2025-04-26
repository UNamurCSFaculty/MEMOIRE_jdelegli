import { IconLoader } from "@components/icons/favouriteIcons";
import Col from "@components/layout/Col";

interface LoadingOverlayProps {
  display: boolean;
  displayText?: string;
}

export default function LoadingOverlay({ display, displayText }: Readonly<LoadingOverlayProps>) {
  if (display) {
    return (
      <div className="fixed top-0 right-0 z-50 h-screen w-screen bg-black/10">
        <Col>
          {displayText ? (
            <div className="rounded-lg bg-black/60 px-8 text-xl text-white">{displayText}</div>
          ) : (
            <IconLoader className="animate-spin h-16 w-16 text-primary-600/80" />
          )}
        </Col>
      </div>
    );
  } else {
    return <></>;
  }
}
