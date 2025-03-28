import ContactsCarousel from "@components/carousel/ContactsCarousel";
import { apiClient } from "@openapi/zodiosClient";
import { ContactDto, ContactRequestDto } from "@type/openapiTypes";
import { useEffect, useState } from "react";
import LoadingPage from "./generic/LoadingPage";
import { useTranslation } from "react-i18next";
import Col from "@components/layout/Col";
import ContactRequestModal from "@components/addContact/ContactRequestModal";
import BackHomeButton from "@components/navigation/BackHomeButton";

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

  if (isLoading) {
    return <LoadingPage />;
  } else {
    return (
      <div className="flex items-center justify-center">
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
          <>
            <BackHomeButton
              size="lg"
              color="default"
              variant="solid"
              className="absolute top-4 left-4 z-10"
            />
            <ContactsCarousel contacts={contacts} />
          </>
        ) : (
          <Col className="h-full w-full items-center justify-center gap-4">
            <p className="text-center text-4xl text-white font-semibold ">
              {t("Pages.ContactPage.NoContactsFound")}
            </p>
            <BackHomeButton shortcuts={["Enter"]} size="lg" color="default" variant="solid" />
          </Col>
        )}
      </div>
    );
  }
}
