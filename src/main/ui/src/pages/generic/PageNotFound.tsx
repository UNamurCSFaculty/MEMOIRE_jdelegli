import Col from "@components/layout/Col";
import { Trans, useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

export default function PageNotFound() {
  const { t } = useTranslation();
  return (
    <Col className="h-full w-full gap-4 items-center justify-center bg-white">
      <div className="text-4xl text-secondary-500 font-bold">404</div>
      <div className="text-xl text-primary-800 font-semibold">
        {t("Pages.Generic.PageNotFound.Title")}
      </div>
      <div className="font-semibold">{t("Pages.Generic.PageNotFound.Message")}</div>
      <div>
        <Trans i18nKey={"Pages.Generic.PageNotFound.Action"}>
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
