import ContactsCarousel from "@components/carousel/ContactsCarousel";
import { apiClient } from "@openapi/zodiosClient";
import { ContactDto } from "@type/openapiTypes";
import { useEffect, useState } from "react";
import LoadingPage from "./generic/LoadingPage";
import { useTranslation } from "react-i18next";
import Col from "@components/layout/Col";
import ContactRequestModal, {
  ContactRequestWithUser,
} from "@components/addContact/ContactRequestModal";
import BackHomeButton from "@components/navigation/BackHomeButton";

export default function ContactPage() {
  const { t } = useTranslation();

  const [contacts, setContacts] = useState<ContactDto[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [requestsWithUsers, setRequestsWithUsers] = useState<ContactRequestWithUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedContacts, contactRequests] = await Promise.all([
          apiClient.getContact(),
          apiClient.getPendingRequests(),
        ]);

        setContacts(fetchedContacts);

        const enriched = await Promise.all(
          contactRequests.map(async (request) => {
            const requester = await apiClient.getUser({
              queries: { userId: request.requesterId },
            });
            return { request, requester };
          })
        );

        setRequestsWithUsers(enriched);
      } catch (err) {
        console.error("Error fetching contact or request data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  } else {
    return (
      <div className="flex items-center justify-center">
        {requestsWithUsers !== null && requestsWithUsers.length > 0 && (
          <ContactRequestModal
            requests={requestsWithUsers}
            removeRequest={(requestId) =>
              setRequestsWithUsers((prev) =>
                prev !== null ? prev.filter((p) => p.request.id !== requestId) : prev
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
