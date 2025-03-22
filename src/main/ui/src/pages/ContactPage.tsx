import ContactsCarousel from "@components/carousel/ContactsCarousel";
import { apiClient } from "@openapi/zodiosClient";
import { ContactDto, ContactRequestDto } from "@type/openapiTypes";
import { useEffect, useState } from "react";
import LoadingPage from "./generic/LoadingPage";
import { useTranslation } from "react-i18next";
import Col from "@components/layout/Col";
import ContactRequestModal from "@components/addContact/ContactRequestModal";

export default function ContactPage() {
  const { t } = useTranslation();

  const [contacts, setContacts] = useState<ContactDto[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [contactRequests, setContactRequests] = useState<ContactRequestDto[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);

  useEffect(() => {
    apiClient
      .getContact()
      .then((resp) => setContacts(resp))
      .finally(() => {
        setIsLoading(false);
      });
    apiClient.getPendingRequests().then((resp) => setContactRequests(resp));
  }, []);

  console.log("contactRequests :", contactRequests);
  console.log("isModalOpen :", isModalOpen);

  if (isLoading) {
    return <LoadingPage />;
  } else {
    return (
      <>
        {contactRequests !== null && contactRequests.length > 0 && (
          <ContactRequestModal
            requests={contactRequests}
            removeRequest={(requestId) =>
              setContactRequests((prev) =>
                prev !== null ? prev.filter((p) => p.id !== requestId) : prev
              )
            }
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
          />
        )}
        {contacts && contacts.length > 0 ? (
          <ContactsCarousel contacts={contacts} />
        ) : (
          <Col className="h-full w-full items-center justify-center">
            <p className="text-center text-xl text-default-500 text-semibold">
              {t("Pages.ContactPage.NoContactsFound")}
            </p>
          </Col>
        )}
      </>
    );
  }
}
