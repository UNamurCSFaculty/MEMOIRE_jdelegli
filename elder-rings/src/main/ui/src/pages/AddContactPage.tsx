import { apiClient } from "@openapi/zodiosClient";
import { ContactDto } from "@type/openapiTypes";
import { useEffect, useState } from "react";
import LoadingPage from "./generic/LoadingPage";
import { useTranslation } from "react-i18next";
import Col from "@components/layout/Col";
import VisibleUserTable from "@components/addContact/VisibleUserTable";

export default function AddContactPage() {
  const { t } = useTranslation();

  const [visibleUsers, setVisibleUsers] = useState<ContactDto[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    apiClient
      .getVisibleUsers()
      .then((resp) => setVisibleUsers(resp))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  } else if (visibleUsers && visibleUsers.length > 0) {
    return <VisibleUserTable visibleUsers={visibleUsers} />;
  } else {
    return (
      <Col className="h-full w-full items-center justify-center">
        <p className="text-center text-xl text-default-500 text-semibold">
          {t("Pages.AddContactPage.NoVisibleUserFound")}
        </p>
      </Col>
    );
  }
}
