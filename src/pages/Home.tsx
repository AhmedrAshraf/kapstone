import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, BookOpen } from 'lucide-react';
import { Carousel } from '../components/Carousel';
import { EditableText } from '../components/cms/EditableText';
import { EditableImage } from '../components/cms/EditableImage';

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section with Radial Gradient */}
      <section className="relative text-white min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <EditableImage
            pageId="home"
            sectionId="hero-image"
            defaultSrc="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
            alt="Peaceful mountain lake"
            className="w-full h-full object-cover brightness-100"
          />
          <div className="absolute inset-0 bg-gray-900/10" />
        </div>
        <div className="relative w-full pt-[150px] pb-[150px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <EditableText
                pageId="home"
                sectionId="hero-title"
                defaultContent="Expert Guidance in Ketamine-Assisted Psychotherapy"
                tag="h1"
                className="text-4xl font-bold sm:text-5xl md:text-6xl text-shadow-lg text-white drop-shadow-lg"
              />
              <EditableText
                pageId="home"
                sectionId="hero-subtitle"
                defaultContent="Connecting patients with trusted clinics and advancing the field through professional collaboration."
                tag="p"
                className="mt-6 max-w-md mx-auto text-xl sm:text-2xl md:mt-8 md:max-w-3xl text-shadow text-white drop-shadow-lg"
              />
              <div className="mt-12 flex justify-center gap-x-6">
                <Link
                  to="/clinic-directory"
                  className="rounded-md bg-kapstone-sage px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-kapstone-sage-dark"
                >
                  Find a Clinic
                </Link>
                <Link
                  to="/for-professionals"
                  className="rounded-md bg-white px-8 py-3 text-lg font-semibold text-kapstone-purple shadow-sm hover:bg-gray-100"
                >
                  Join Network
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <Carousel />

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-1 bg-kapstone-sage/20 rounded-full blur"></div>
                  <div className="relative bg-white p-4 rounded-full shadow-lg">
                    <div className="bg-gradient-to-br from-kapstone-sage to-kapstone-purple p-3 rounded-full">
                      <Search className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <EditableText
                pageId="home"
                sectionId="feature-1-title"
                defaultContent="Find Trusted Clinics"
                tag="h3"
                className="mt-6 text-xl font-semibold text-gray-900"
              />
              <EditableText
                pageId="home"
                sectionId="feature-1-content"
                defaultContent="Access our curated directory of verified ketamine-assisted psychotherapy clinics across the US."
                tag="p"
                className="mt-4 text-gray-600"
              />
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-1 bg-kapstone-sage/20 rounded-full blur"></div>
                  <div className="relative bg-white p-4 rounded-full shadow-lg">
                    <div className="bg-gradient-to-br from-kapstone-sage to-kapstone-purple p-3 rounded-full">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <EditableText
                pageId="home"
                sectionId="feature-2-title"
                defaultContent="Professional Network"
                tag="h3"
                className="mt-6 text-xl font-semibold text-gray-900"
              />
              <EditableText
                pageId="home"
                sectionId="feature-2-content"
                defaultContent="Connect with fellow practitioners, share experiences, and advance your practice through collaboration."
                tag="p"
                className="mt-4 text-gray-600"
              />
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-1 bg-kapstone-sage/20 rounded-full blur"></div>
                  <div className="relative bg-white p-4 rounded-full shadow-lg">
                    <div className="bg-gradient-to-br from-kapstone-sage to-kapstone-purple p-3 rounded-full">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <EditableText
                pageId="home"
                sectionId="feature-3-title"
                defaultContent="Educational Resources"
                tag="h3"
                className="mt-6 text-xl font-semibold text-gray-900"
              />
              <EditableText
                pageId="home"
                sectionId="feature-3-content"
                defaultContent="Access comprehensive resources, case studies, and latest research in ketamine-assisted psychotherapy."
                tag="p"
                className="mt-4 text-gray-600"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}