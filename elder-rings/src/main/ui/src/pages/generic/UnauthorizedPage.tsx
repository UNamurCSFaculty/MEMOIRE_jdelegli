import Col from "@components/layout/Col";
import { useTranslation, Trans } from "react-i18next";
import { NavLink } from "react-router-dom";

export default function UnauthorizedPage() {
  const { t } = useTranslation();
  return (
    <Col className="h-full w-full gap-4 items-center justify-center bg-white">
      <div className="text-xl text-danger-800 font-semibold">
        {t("Pages.Generic.UnauthorizedPage.Title")}
      </div>
      <div className="font-semibold">{t("Pages.Generic.UnauthorizedPage.Message")}</div>
      <div>
        <Trans i18nKey={"Pages.Generic.UnauthorizedPage.Action"}>
          Go back to the
          <NavLink to="/" className="underline">
            home page
          </NavLink>
          .
        </Trans>
      </div>
    </Col>
  );
}
