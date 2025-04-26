import { IconLoader } from "@components/icons/favouriteIcons";
import Col from "@components/layout/Col";
import { twMerge } from "tailwind-merge";

interface LoadingPageProps {
  message?: string;
  fullScreen?: boolean; // this is because this page can be used as an Outlet in some cases
}

export default function LoadingPage({ fullScreen, message }: Readonly<LoadingPageProps>) {
  return (
    <Col
      className={twMerge(
        "gap-4 items-center content-center justify-center bg-white",
        fullScreen === true ? "w-screen h-screen" : "h-full"
      )}
    >
      {message && <p>{message}</p>}
      <IconLoader className="animate-spin h-16 w-16 text-primary-600/80" />
    </Col>
  );
}
