import { ContactDto } from "@type/openapiTypes";
import { useEffect, useState } from "react";
import { basePath } from "../../../basepath.config";
import { apiClient } from "@openapi/zodiosClient";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { IconChevonLeft, IconChevonRight, IconStartCall } from "@components/icons/favouriteIcons";
import { useTranslation } from "react-i18next";
import { useTTS } from "../../hooks/useTTS";

interface ContactsCarouselProps {
  contacts: ContactDto[];
}

export default function ContactsCarousel({ contacts }: Readonly<ContactsCarouselProps>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const tts = useTTS();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextSlide();
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        prevSlide();
      } else if (event.key === "Enter") {
        callContact(contacts[currentIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, contacts]);

  useEffect(() => {
    tts(contacts[currentIndex].firstName + " " + contacts[currentIndex].lastName);
  }, [currentIndex]);

  function callContact(contact: ContactDto) {
    apiClient.createCallRoom({ userIds: [contact.id!] }).then((resp) => {
      navigate("../call-room/" + resp.id);
    });
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % contacts.length);
  };

  const prevSlide = () =>
    setCurrentIndex((prevIndex) => (prevIndex - 1 + contacts.length) % contacts.length);

  return (
    <div className="relative max-w-4xl mx-auto overflow-hidden h-full w-full rounded-lg">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 h-full w-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {contacts.map((contact, index) => (
          <div
            key={index}
            className="relative flex-shrink-0 h-full w-full flex justify-center items-center"
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
            <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 text-white p-2 text-center w-full">
              <Button
                color="success"
                isIconOnly
                size="lg"
                onPress={() => callContact(contact)}
                aria-label={t("Components.ContactsCarousel.CallContact", {
                  name: `${contact.firstName} ${contact.lastName}`,
                })}
              >
                <IconStartCall className="text-white" />
              </Button>
            </div>

            {/* Name */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-white p-2 text-center w-full">
              <p className="capitalize inline-block bg-black bg-opacity-60 py-1 px-4 rounded-full text-4xl">
                {contact.firstName} {contact.lastName}
              </p>
            </div>
          </div>
        ))}
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
