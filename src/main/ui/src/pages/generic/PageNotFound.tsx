import Col from "@components/layout/Col";
import BackHomeButton from "@components/navigation/BackHomeButton";
import { useTranslation } from "react-i18next";

export default function PageNotFound() {
  const { t } = useTranslation();
  return (
    <Col className="h-full w-full gap-4 items-center justify-center bg-white">
      <div className="text-4xl text-primary-500 font-bold">404</div>
      <div className="text-xl text-primary-800 font-semibold">
        {t("Pages.Generic.PageNotFound.Title")}
      </div>
      <div className="font-semibold">{t("Pages.Generic.PageNotFound.Message")}</div>
      <BackHomeButton shortcuts={["Enter"]} size="lg" color="primary" />
    </Col>
  );
}
