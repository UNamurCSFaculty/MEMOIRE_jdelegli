import Col from "@components/layout/Col";
import { useTranslation, Trans } from "react-i18next";

export default function NotConnectedPage() {
  const { t } = useTranslation();
  return (
    <Col className="h-full w-full gap-4 items-center justify-center bg-white">
      <div className="text-4xl text-danger-800 font-semibold">
        {t("Pages.Generic.NotConnectedPage.Title")}
      </div>
      <div className="font-semibold">{t("Pages.Generic.NotConnectedPage.Message")}</div>
      <div>
        <Trans i18nKey={"Pages.Generic.NotConnectedPage.Action"}>
          Go back to the
          <a href="/" className="underline">
            home page
          </a>
          .
        </Trans>
      </div>
    </Col>
  );
}
