import { ContactDto } from "@type/openapiTypes";
import { useEffect, useState } from "react";

interface ContactsCarouselProps {
  contacts: ContactDto[];
}

export default function ContactsCarousel({ contacts }: Readonly<ContactsCarouselProps>) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Array of big images from the internet
  //   const images = [
  //     "https://picsum.photos/id/237/1600/900",
  //     "https://picsum.photos/id/238/1600/900",
  //     "https://picsum.photos/id/239/1600/900",
  //     "https://picsum.photos/id/240/1600/900",
  //     "https://picsum.photos/id/241/1600/900",
  //   ];
  const images = [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?q=80&w=1966&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1508186225823-0963cf9ab0de?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextSlide();
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        prevSlide();
      } else if (event.key === "Enter") {
        console.log("Start call");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const nextSlide = () => setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);

  const prevSlide = () =>
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);

  return (
    <div className="relative max-w-4xl mx-auto overflow-hidden h-full w-full  bg-gray-100 rounded-lg">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 h-full w-full "
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="flex-shrink-0 h-full w-full  flex justify-center items-center"
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded hover:bg-gray-700 focus:outline-none"
        aria-label="Previous Slide"
      >
        Prev
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded hover:bg-gray-700 focus:outline-none"
        aria-label="Next Slide"
      >
        Next
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            role="button"
            tabIndex={0}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              index === currentIndex ? "bg-gray-200" : "bg-gray-500"
            } hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-300`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
