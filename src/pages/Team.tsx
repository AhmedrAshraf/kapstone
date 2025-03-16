import React, { useEffect, useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { slugify } from '../utils/string';

// Store scroll position in session storage when navigating away
const storeScrollPosition = () => {
  sessionStorage.setItem('teamScrollPosition', window.scrollY.toString());
};

export function Team() {
  const location = useLocation();

  // Disable browser's native scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Handle scroll restoration when returning to team page
  useLayoutEffect(() => {
    if (location.pathname === '/team') {
      const savedPosition = sessionStorage.getItem('teamScrollPosition');
      if (savedPosition !== null) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedPosition));
          // Only remove after successful restoration
          sessionStorage.removeItem('teamScrollPosition');
        });
      }
    }
  }, [location]);

  const boardMembers = [
    {
      name: "Peter Corbett, LICSW",
      image: "/team/peter-corbett.webp",
      bio: "Peter Corbett, LICSW KAPstone Clinics founder and Executive Director, Mr. Corbett has worked in the mental health field for 35 years. He has 2 post grad degrees, a Masters in Counseling and Consulting Psychology from Harvard University; the other, an MSW from Smith College. He has extensive training in holistic mental health and transpersonal psychology, having completed 3 major programs in Psychosynthesis and another in the Interface Graduate Program in Holistic Studies. Corbett has held therapist jobs in many settings from Psych Hospitals, community mental health agencies, batterers treatment, emergency outreach, and had a thriving private practice for the 30+ years in Northampton, MA."
    },
    {
      name: "Gita Vaid, MD",
      image: "/team/gita-vaid.webp",
      bio: "Gita Vaid is a Board Certified Psychiatrist and psychoanalyst practicing in New York City. Dr. Vaid completed her residency training at NYU Medical Center and her psychoanalytic training at the Psychoanalytic Association of New York affiliated with NYU. Her early biological and research background includes a completed fellowship in clinical psychopharmacology and neurophysiology at New York Medical College and a research fellowship at NYU Medical Center."
    },
    {
      name: "Bessel van der Kolk, MD",
      image: "/team/bessel-van-der-kolk.webp",
      bio: "Dr. van der Kolk conducted the first studies on the effects of SSRIs on PTSD; he was a member of the first neuroimaging team to investigate how trauma changes brain processes, and did the first research linking BPD and deliberate self-injury to trauma and neglect. Much of his research has focused on how trauma has a different impact at different stages of development, and on how disruptions in care-giving systems have additional deleterious effects that need to be addressed for effective intervention."
    },
    {
      name: "Eva Altobelli, MD",
      image: "/team/eva-altobelli.webp",
      bio: "Dr. Eva Altobelli is the founder of Home-LA, a holistic wellness center integrating psychiatry, psychotherapy, and the transformative realm of psychedelic healing. She began her professional journey in New York City as an artist. Driven by a passion for holistic well-being she delved into mindfulness, yoga, neuroscience, and expanded states of consciousness."
    },
    {
      name: "Mark Braunstein, MD",
      image: "/team/mark-braunstein.webp",
      bio: "Dr. Braunstein is a holistic psychiatrist who has over 25 years of clinical experience and study in psychedelic psychiatry . He completed his residency in general psychiatry and his Fellowship in child and adolescent psychiatry in 1997, after which he delved into exploring the use of psychoactive plant-based medicines for treating various psychiatric conditions in both children and adults."
    },
    {
      name: "Terry Mollner, Ed.D.",
      image: "/team/terry-mollner.webp",
      bio: "Dr. Terry Mollner, Ed.D, is a founder and Chair of Stakeholders Capital, Inc. in Amherst, MA, a socially responsible asset management firm and the home of \"common good investing,\" investing in companies that give priority to the common good and second priority to the financial return to shareholders."
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section with Radial Gradient */}
      <section className="relative text-white min-h-[45vh] flex items-center pt-28">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca"
            alt="Team collaboration"
            className="w-full h-full object-cover brightness-100"
          />
          <div className="absolute inset-0 bg-gray-900/10" />
        </div>
        <div className="relative w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold sm:text-5xl text-shadow-lg">Our Leadership Team</h1>
              <p className="mt-6 max-w-3xl mx-auto text-xl text-shadow">
                Meet the experienced professionals leading the advancement of ketamine-assisted psychotherapy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Board Members Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12">
            {boardMembers.map((member) => (
              <div 
                key={member.name}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/3">
                      <div className="aspect-w-3 aspect-h-4 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="lg:w-2/3">
                      <h2 className="text-3xl font-bold text-kapstone-purple mb-6">
                        {member.name}
                      </h2>

                      <div className="prose prose-lg max-w-none mb-6">
                        <p className="text-gray-600">{member.bio}</p>
                      </div>

                      <Link
                        to={`/team/${slugify(member.name)}`}
                        onClick={storeScrollPosition}
                        className="inline-flex items-center text-kapstone-sage hover:text-kapstone-sage-dark font-medium"
                      >
                        Learn More <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}