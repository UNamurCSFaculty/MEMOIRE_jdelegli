import ContactsCarousel from "@components/carousel/ContactsCarousel";
import { apiClient } from "@openapi/zodiosClient";
import { ContactDto } from "@type/openapiTypes";
import { useEffect, useState } from "react";
import LoadingPage from "./generic/LoadingPage";
import { useTranslation } from "react-i18next";
import Col from "@components/layout/Col";

export default function ContactPage() {
  const { t } = useTranslation();

  const [contacts, setContacts] = useState<ContactDto[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    apiClient
      .getContact()
      .then((resp) => setContacts(resp))
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  } else if (contacts) {
    return <ContactsCarousel contacts={contacts} />;
  } else {
    return (
      <Col className="h-full w-full items-center justify-center">
        <p className="text-center text-xl text-default-500 text-semibold">
          {t("Pages.ContactPage.NoContactsFound")}
        </p>
      </Col>
    );
  }
}
