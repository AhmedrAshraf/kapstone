import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { slugify } from '../../utils/string';

const teamMembers = {
  [slugify("Peter Corbett, LICSW")]: {
    name: "Peter Corbett, LICSW",
    image: "/team/peter-corbett.webp",
    contact: {
      address: "2 Strong Avenue, Northampton, MA 01060",
      email: "petercorb2@gmail.com",
      phone: "(413) 586-5882"
    },
    bio: [
      "Peter Corbett, LICSW KAPstone Clinics founder and Executive Director, Mr. Corbett has worked in the mental health field for 35 years. He has 2 post grad degrees, a Masters in Counseling and Consulting Psychology from Harvard University; the other, an MSW from Smith College. He has extensive training in holistic mental health and transpersonal psychology, having completed 3 major programs in Psychosynthesis and another in the Interface Graduate Program in Holistic Studies. Corbett has held therapist jobs in many settings from Psych Hospitals, community mental health agencies, batterers treatment, emergency outreach, and had a thriving private practice for the 30+ years in Northampton, MA.",
      "Corbett was a community organizer in Burlington, VT following his undergraduate studies at UVM, during the early years when Bernie Sanders was Mayor of Burlington, VT. Corbett has always maintained an interest in social issues and politics and its interface with mental health issues and continues to remain involved in progressive political movements. Always attentive to the growing edge of mental health work, after completing Ketamine Assisted Psychotherapy (KAP) training with Dr. Phil Wolfson, Peter joined the Ketamine Training Center faculty, and became co-director of Ketamine Psychotherapy Associates. He has completed the California Institute for Integral Studies program in Psychedelic Studies and Research. Peter is the founder/part owner and Clinical Director of The Center for Healing Journeys, a KAP clinic in western Massachusetts. He is the founder of Kapstone Clinics."
    ]
  },
  [slugify("Gita Vaid, MD")]: {
    name: "Gita Vaid, MD",
    image: "/team/gita-vaid.webp",
    contact: {
      address: "80 University Place, 4th Floor, New York, NY",
      email: "gvaidmd@gmail.com",
      phone: "(646) 361-4221"
    },
    bio: [
      "Gita Vaid is a Board Certified Psychiatrist and psychoanalyst practicing in New York City. Dr. Vaid completed her residency training at NYU Medical Center and her psychoanalytic training at the Psychoanalytic Association of New York affiliated with NYU. Her early biological and research background includes a completed fellowship in clinical psychopharmacology and neurophysiology at New York Medical College and a research fellowship at NYU Medical Center.",
      "Dr. Vaid serves as the International Course Director for Mind Medicine Australia's Certificate in Psychedelic-Assisted Therapies Training Program. Dr Vaid is a leader in ketamine assisted psychotherapy which she practices in New York City. She serves as a lead instructor at The Ketamine Training Center with psychedelic psychotherapy pioneer, Dr. Phil Wolfson. Dr Vaid serves as the Director of Psychedelic Awareness and Consciousness research at The Chopra Foundation. She is a co-founder of the Center for Natural Intelligence — a multidisciplinary laboratory dedicated to psychedelic psychotherapy innovation and research."
    ]
  },
  [slugify("Bessel van der Kolk, MD")]: {
    name: "Bessel van der Kolk, MD",
    image: "/team/bessel-van-der-kolk.webp",
    contact: {
      address: "Boston, MA",
      email: "info@traumaresearchfoundation.org",
      phone: "(617) 232-1303"
    },
    bio: [
      "Dr. van der Kolk conducted the first studies on the effects of SSRIs on PTSD; he was a member of the first neuroimaging team to investigate how trauma changes brain processes, and did the first research linking BPD and deliberate self-injury to trauma and neglect. Much of his research has focused on how trauma has a different impact at different stages of development, and on how disruptions in care-giving systems have additional deleterious effects that need to be addressed for effective intervention.",
      "He is the author of over 150 peer reviewed scientific articles and several books including the New York Times bestseller 'The Body Keeps the Score: Brain, Mind, and Body in the Treatment of Trauma'. His work integrates developmental, neurobiological, psychodynamic, and interpersonal aspects of the impact of trauma and its treatment."
    ]
  },
  [slugify("Eva Altobelli, MD")]: {
    name: "Eva Altobelli, MD",
    image: "/team/eva-altobelli.webp",
    contact: {
      address: "Los Angeles, CA",
      email: "info@home-la.com",
      phone: "(310) 555-0123"
    },
    bio: [
      "Dr. Eva Altobelli is the founder of Home-LA, a holistic wellness center integrating psychiatry, psychotherapy, and the transformative realm of psychedelic healing. She began her professional journey in New York City as an artist. Driven by a passion for holistic well-being she delved into mindfulness, yoga, neuroscience, and expanded states of consciousness.",
      "Her approach combines traditional psychiatric methods with cutting-edge psychedelic therapies, creating a unique treatment model that addresses both the symptoms and root causes of mental health challenges. Dr. Altobelli is dedicated to advancing the field of integrative psychiatry and making these innovative treatments more accessible to those in need."
    ]
  },
  [slugify("Mark Braunstein, MD")]: {
    name: "Mark Braunstein, MD",
    image: "/team/mark-braunstein.webp",
    contact: {
      address: "San Francisco, CA",
      email: "dr.braunstein@kapstone.com",
      phone: "(415) 555-0199"
    },
    bio: [
      "Dr. Braunstein is a holistic psychiatrist who has over 25 years of clinical experience and study in psychedelic psychiatry. He completed his residency in general psychiatry and his Fellowship in child and adolescent psychiatry in 1997, after which he delved into exploring the use of psychoactive plant-based medicines for treating various psychiatric conditions in both children and adults.",
      "His pioneering work in integrating traditional psychiatric approaches with psychedelic therapies has helped establish new paradigms in mental health treatment. Dr. Braunstein is particularly interested in the application of ketamine therapy for treatment-resistant depression and anxiety disorders."
    ]
  },
  [slugify("Terry Mollner, Ed.D.")]: {
    name: "Terry Mollner, Ed.D.",
    image: "/team/terry-mollner.webp",
    contact: {
      address: "Amherst, MA",
      email: "tmollner@stakeholderscapital.com",
      phone: "(413) 555-0177"
    },
    bio: [
      "Dr. Terry Mollner, Ed.D, is a founder and Chair of Stakeholders Capital, Inc. in Amherst, MA, a socially responsible asset management firm and the home of \"common good investing,\" investing in companies that give priority to the common good and second priority to the financial return to shareholders.",
      "His work in socially responsible business practices and ethical investment strategies has helped shape the landscape of modern sustainable business. Dr. Mollner brings this expertise to KAPstone Clinics, ensuring that our organization maintains the highest standards of ethical practice while serving the greater good of mental health care."
    ]
  }
};

export function TeamMember() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const member = teamMembers[slug as keyof typeof teamMembers];

  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-kapstone-purple mb-4">Member Not Found</h1>
          <Link to="/team" className="text-kapstone-sage hover:text-kapstone-sage-dark">
            Return to Team
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <Link
          to="/team"
          className="inline-flex items-center text-kapstone-sage hover:text-kapstone-sage-dark mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Team
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3">
                <div className="aspect-w-3 aspect-h-4 rounded-lg overflow-hidden bg-gray-100 mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-4">
                  {member.contact.address && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-kapstone-sage mr-2 mt-1 flex-shrink-0" />
                      <p className="text-gray-600">{member.contact.address}</p>
                    </div>
                  )}
                  {member.contact.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-kapstone-sage mr-2 flex-shrink-0" />
                      <a
                        href={`mailto:${member.contact.email}`}
                        className="text-kapstone-purple hover:text-kapstone-sage"
                      >
                        {member.contact.email}
                      </a>
                    </div>
                  )}
                  {member.contact.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-kapstone-sage mr-2 flex-shrink-0" />
                      <a
                        href={`tel:${member.contact.phone}`}
                        className="text-kapstone-purple hover:text-kapstone-sage"
                      >
                        {member.contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:w-2/3">
                <h1 className="text-3xl font-bold text-kapstone-purple mb-6">
                  {member.name}
                </h1>

                <div className="prose prose-lg max-w-none space-y-6">
                  {member.bio.map((paragraph, index) => (
                    <p key={index} className="text-gray-600">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}