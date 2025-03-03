import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EditableText } from './cms/EditableText';
import { EditableImage } from './cms/EditableImage';

interface CarouselSlide {
  title: string;
  content: string;
  image: string;
  imagePosition?: 'left' | 'right';
}

export function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<CarouselSlide[]>([
    {
      title: "KAPstone Clinics",
      content: "A professional association of ketamine clinics providing 'gold standard, ketamine assisted psychotherapy for mental health.",
      image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09",
      imagePosition: "right"
    },
    {
      title: "What is KAPstone Clinics?",
      content: "KAPstone Clinics is a 501(c)(6) professional non-profit association of clinics whose participation reflects each member clinic's commitment to the highest principles of ketamine assisted psychotherapy (KAP) for mental health treatment.",
      image: "https://images.unsplash.com/photo-1629909615957-be38d48fbbe4",
      imagePosition: "left"
    },
    {
      title: "Our Mission",
      content: "For far too long, the realm of ketamine treatment for mental health has operated in the shadows, lacking proper oversight and care for those seeking relief. KAPstone Clinics is committed to serving as a beacon of hope in this sea of uncertainty.",
      image: "https://images.unsplash.com/photo-1629909615678-20db842f2853",
      imagePosition: "right"
    }
  ]);

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative bg-gradient-to-br from-kapstone-purple/5 via-kapstone-sage/5 to-kapstone-purple/5 py-20">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`flex flex-col md:flex-row items-center gap-8 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'hidden'
            }`}
          >
            {/* Image Section */}
            <div className={`w-full md:w-1/2 ${slide.imagePosition === 'right' ? 'order-first md:order-last' : ''}`}>
              <EditableImage
                pageId="home"
                sectionId={`carousel-image-${index + 1}`}
                defaultSrc={slide.image}
                alt={slide.title}
                className="w-full h-[400px] object-cover rounded-lg shadow-lg"
              />
            </div>
            
            {/* Content Section */}
            <div className="w-full md:w-1/2 space-y-6">
              <EditableText
                pageId="home"
                sectionId={`carousel-title-${index + 1}`}
                defaultContent={slide.title}
                tag="h2"
                className="text-3xl font-bold text-kapstone-purple"
              />
              <EditableText
                pageId="home"
                sectionId={`carousel-content-${index + 1}`}
                defaultContent={slide.content}
                tag="p"
                className="text-lg text-gray-600"
              />
            </div>
          </div>
        ))}
        
        {/* Navigation Controls */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={goToPrevSlide}
            className="p-2 bg-kapstone-sage text-white rounded-full hover:bg-kapstone-sage-dark transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 w-3 rounded-full transition-all ${
                currentSlide === index ? 'bg-kapstone-sage' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
          </div>
          
          <button
            onClick={goToNextSlide}
            className="p-2 bg-kapstone-sage text-white rounded-full hover:bg-kapstone-sage-dark transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
}