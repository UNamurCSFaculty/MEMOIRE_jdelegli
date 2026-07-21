import { ContactDto } from "@type/openapiTypes";
import { useCallback, useEffect, useState } from "react";
import { basePath } from "../../../basepath.config";
import { Button } from "@heroui/react";
import { IconChevonLeft, IconChevonRight, IconStartCall } from "@components/icons/favouriteIcons";
import { useTranslation } from "react-i18next";
import { useTTS } from "../../hooks/useTTS";
import { useStartCall } from "../../hooks/useStartCall";

interface ContactsCarouselProps {
  contacts: ContactDto[];
  doNotDisturbMap: Record<string, boolean>;
  onNavigateUp?: () => void;
}

export default function ContactsCarousel({
  contacts,
  doNotDisturbMap,
  onNavigateUp,
}: Readonly<ContactsCarouselProps>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation();

  const tts = useTTS();
  const callContact = useStartCall();

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % contacts.length);
  }, [contacts.length]);

  const prevSlide = useCallback(
    () => setCurrentIndex((prevIndex) => (prevIndex - 1 + contacts.length) % contacts.length),
    [contacts.length],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement !== document.body) {
        return;
      }
      if (event.key === "ArrowRight") {
        nextSlide();
      } else if (event.key === "ArrowLeft") {
        prevSlide();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        onNavigateUp?.();
      } else if (event.key === "Enter") {
        if (!doNotDisturbMap[contacts[currentIndex].id!]) {
          callContact(contacts[currentIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, contacts, nextSlide, prevSlide, doNotDisturbMap, callContact, onNavigateUp]);

  useEffect(() => {
    tts(contacts[currentIndex].firstName + " " + contacts[currentIndex].lastName);
  }, [contacts, currentIndex, tts]);

  return (
    <div className="relative max-w-4xl mx-auto overflow-hidden h-full w-full rounded-lg">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 h-full w-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {contacts.map((contact, index) => {
          return (
            <div
              key={index}
              className="relative shrink-0 h-full w-full flex justify-center items-center"
            >
              {/* Image */}
              <img
                src={
                  contact.picture
                    ? `data:image/*;base64,${contact.picture}`
                    : basePath + "/picture-user-default.jpg"
                }
                alt={t("Components.ContactsCarousel.ContactPictureAlt", {
                  name: `${contact.firstName} ${contact.lastName}`,
                })}
                className="max-w-full max-h-full object-contain"
              />

              {/* Call button */}
              <div className="absolute flex flex-col gap-4 items-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white p-2 text-center">
                <Button
                  variant="primary"
                  className="bg-success"
                  isIconOnly
                  size="lg"
                  isDisabled={doNotDisturbMap[contact.id!]}
                  onPress={() => callContact(contact)}
                  aria-label={t("Components.ContactsCarousel.CallContact", {
                    name: `${contact.firstName} ${contact.lastName}`,
                  })}
                >
                  <IconStartCall className="text-white" />
                </Button>
                {doNotDisturbMap[contact.id!] && (
                  <p className="inline-flex items-center gap-2 bg-black bg-opacity-60 py-1 px-3 rounded-full text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                    {t("Components.ContactsCarousel.ContactDoNotDisturbLabel")}
                  </p>
                )}
                <p className="capitalize inline-block bg-black bg-opacity-60 py-1 px-4 rounded-full text-4xl">
                  {contact.firstName} {contact.lastName}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <Button
        onPress={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2"
        aria-label={t("Components.ContactsCarousel.PreviousSlide")}
        isIconOnly
        isDisabled={contacts.length <= 1}
      >
        <IconChevonLeft />
      </Button>
      <Button
        onPress={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2"
        aria-label={t("Components.ContactsCarousel.NextSlide")}
        isIconOnly
        isDisabled={contacts.length <= 1}
      >
        <IconChevonRight />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {contacts.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            role="button"
            tabIndex={0}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              index === currentIndex ? "bg-gray-200" : "bg-gray-500"
            } hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-300`}
            aria-label={t("Components.ContactsCarousel.GoToSlide", { index: index + 1 })}
          />
        ))}
      </div>
    </div>
  );
}
