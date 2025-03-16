import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, BookOpen, Award, ArrowRight, Building2, Shield, Target, ChevronRight } from 'lucide-react';
import { EditableText } from '../components/cms/EditableText';
import { EditableImage } from '../components/cms/EditableImage';
import { useScrollToTop } from '../hooks/useScrollToTop';

export function ForProfessionals() {
  const navigate = useNavigate();
  
  // Add scroll to top functionality
  useScrollToTop();
  
  const scrollToContent = () => {
    document.getElementById('clinical-excellence')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleStartApplication = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      navigate('/clinic-directory/new');
    }, 500);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section with Radial Gradient */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <EditableImage
            pageId="for-professionals"
            sectionId="hero-image"
            defaultSrc="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4"
            alt="Professional team meeting"
            className="w-full h-full object-cover brightness-100"
          />
          <div className="absolute inset-0 bg-gray-900/10" />
        </div>
        <div className="relative w-full mt-[100px] mb-[100px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <EditableText
                pageId="for-professionals"
                sectionId="hero-title"
                defaultContent="Join the Gold Standard in Ketamine-Assisted Psychotherapy"
                tag="h1"
                className="text-4xl font-bold sm:text-5xl md:text-6xl text-white text-shadow-lg"
              />
              <EditableText
                pageId="for-professionals"
                sectionId="hero-subtitle"
                defaultContent="Joining Kapstone Clinics opens the door to a host of benefits for member clinics, creating a partnership rooted in excellence and innovation."
                tag="p"
                className="mt-6 max-w-3xl mx-auto text-xl text-white text-shadow"
              />
              <div className="mt-12 flex justify-center gap-x-6">
                <button
                  onClick={handleStartApplication}
                  className="rounded-md bg-kapstone-sage px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-kapstone-sage-dark"
                >
                  Apply Now
                </button>
                <button
                  onClick={scrollToContent}
                  className="rounded-md bg-white px-8 py-3 text-lg font-semibold text-kapstone-purple shadow-sm hover:bg-gray-100"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 bg-gradient-to-br from-kapstone-sage/5 via-kapstone-purple/5 to-kapstone-sage/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <EditableText
              pageId="for-professionals"
              sectionId="intro-1"
              defaultContent="As part of our network, your clinic becomes part of a community of dedicated professionals committed to raising the standard of mental health care by creating a collective voice for conscientious treatment with ketamine in a field that, to date risks."
              tag="p"
              className="text-lg text-gray-700"
            />
            <EditableText
              pageId="for-professionals"
              sectionId="intro-2"
              defaultContent="Members gain access to shared resources, cutting-edge treatment methods, and valuable opportunities for growth through collaborative training sessions and workshops."
              tag="p"
              className="text-lg text-gray-700"
            />
            <EditableText
              pageId="for-professionals"
              sectionId="intro-3"
              defaultContent="Kapstone Clinics also provides expert support in adopting evidence-based practices, ensuring your clinic remains a leader in mental health care advancements."
              tag="p"
              className="text-lg text-gray-700"
            />
            <EditableText
              pageId="for-professionals"
              sectionId="intro-4"
              defaultContent="Our strong reputation and proven expertise enhance your clinic's credibility, making it easier to attract patients seeking compassionate, high-quality care. Becoming a member of Kapstone Clinics isn't just an affiliation—it's a commitment to shared growth, improved care delivery, and making a lasting impact on the lives of those we serve."
              tag="p"
              className="text-lg text-gray-700"
            />
          </div>
        </div>
      </section>

      {/* Clinical Excellence Section */}
      <section id="clinical-excellence" className="py-20 bg-gradient-to-tr from-kapstone-purple/5 via-white to-kapstone-sage/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EditableText
            pageId="for-professionals"
            sectionId="clinical-excellence-title"
            defaultContent="Cultivating Clinical Competence, Growth, & Expertise"
            tag="h2"
            className="text-3xl font-bold text-kapstone-purple text-center mb-16"
          />
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <EditableText
                pageId="for-professionals"
                sectionId="supervision-model-title"
                defaultContent="Clinic Supervision Model"
                tag="h3"
                className="text-2xl font-semibold text-kapstone-purple mb-6"
              />
              <EditableText
                pageId="for-professionals"
                sectionId="supervision-model-intro"
                defaultContent="Our comprehensive bi-weekly case presentations within each clinic provide a structured environment for professional growth and clinical excellence. These sessions offer:"
                tag="p"
                className="text-gray-700 mb-6"
              />
              <ul className="space-y-4">
                {[
                  "In-depth analysis of treatment approaches and outcomes with peer feedback",
                  "Collaborative problem-solving for complex cases and challenging situations",
                  "Integration of multiple therapeutic modalities and treatment strategies",
                  "Opportunities for professional development and skill enhancement"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-kapstone-sage mr-2 flex-shrink-0 mt-1" />
                    <EditableText
                      pageId="for-professionals"
                      sectionId={`supervision-model-item-${index + 1}`}
                      defaultContent={item}
                      tag="span"
                      className="text-gray-700"
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <EditableText
                pageId="for-professionals"
                sectionId="kpa-membership-title"
                defaultContent="Ketamine Psychotherapy Association Membership"
                tag="h3"
                className="text-2xl font-semibold text-kapstone-purple mb-6"
              />
              <EditableText
                pageId="for-professionals"
                sectionId="kpa-membership-content"
                defaultContent="Participation in bi-weekly meetings with KPA, a national based KAP supervision group connected to the Ketamine Training Center. These meetings include case presentations, discussions on various themes related to KAP such as treatment strategies for various diagnostic constellations (addiction, disorganized personality types, neuro-rigidity, etc..), work with different populations such as end of life, transition to adulthood, LGBQT, Trauma, and featured Speakers with option for professional continuing education credits."
                tag="p"
                className="text-gray-700 mb-6"
              />
              <EditableText
                pageId="for-professionals"
                sectionId="kpa-membership-speakers"
                defaultContent="Featured Speakers at least bi-monthly with potential for professional continuing ed. credits."
                tag="p"
                className="text-gray-700"
              />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <EditableText
                pageId="for-professionals"
                sectionId="database-sharing-title"
                defaultContent="Database Sharing Program"
                tag="h3"
                className="text-2xl font-semibold text-kapstone-purple mb-6"
              />
              <EditableText
                pageId="for-professionals"
                sectionId="database-sharing-content-1"
                defaultContent="Develop user-friendly KAPstone wide treatment and outcomes database program (may commission for tracking effectiveness of wide array of treatment modalities) for potential research/comparison/refinement of effectiveness. Each clinic will be given access and taught how to use the program and each clinic will have the option to use it primarily for intra clinic outcomes assessments."
                tag="p"
                className="text-gray-700 mb-6"
              />
              <EditableText
                pageId="for-professionals"
                sectionId="database-sharing-content-2"
                defaultContent="They may also choose to share their clinic data (anonymously, of course) with the outcomes of the other KAPstone Clinics."
                tag="p"
                className="text-gray-700"
              />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <EditableText
                pageId="for-professionals"
                sectionId="goals-title"
                defaultContent="Goals of KAPstone Clinic Collaborative Support"
                tag="h3"
                className="text-2xl font-semibold text-kapstone-purple mb-6"
              />
              <ul className="space-y-4">
                {[
                  "Refinement of therapeutic attunement skills",
                  "Developing an ever widening repertoire of intervention strategies and techniques within the KAP model (IFS, AEDP, EMDR, ACT, Psychodrama, CBT, etc…)",
                  "Ability to work flexibly within multiple modalities such as cognitive, somatic/movement, emotional, spiritual, relational (couples and group therapy), & community based intervention strategies",
                  "Learning specific therapy skill sets related to the particularities of psychedelic medicines such as working with people who are disoriented and who may, at times in the session, feel like they are falling apart, scared, terrified, lost, etc…",
                  "In depth analysis of successes and failures with an eye at increasing ability to evoke transformative healing experiences for all patients",
                  "Building a broad base of therapeutic tools which might include computer based interventions, neurofeedback, neurostimulation, etc…always remembering the inherent value of social relatedness as intrinsic to meaning and happiness"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-kapstone-sage mr-2 flex-shrink-0 mt-1" />
                    <EditableText
                      pageId="for-professionals"
                      sectionId={`goals-item-${index + 1}`}
                      defaultContent={item}
                      tag="span"
                      className="text-gray-700"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Staff Collaboration Section */}
      <section className="py-20 bg-gradient-to-bl from-kapstone-sage/5 via-white to-kapstone-purple/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EditableText
            pageId="for-professionals"
            sectionId="staff-collab-title"
            defaultContent="Staff Collaboration & Resources"
            tag="h2"
            className="text-3xl font-bold text-kapstone-purple text-center mb-16"
          />
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <EditableText
                pageId="for-professionals"
                sectionId="sponsored-events-title"
                defaultContent="Sponsored Events & Development"
                tag="h3"
                className="text-2xl font-semibold text-kapstone-purple mb-6"
              />
              <EditableText
                pageId="for-professionals"
                sectionId="sponsored-events-content"
                defaultContent="Kapstone Clinic Sponsored Events such as speakers forums, in-person retreats for clinical, administration, team and community development to help each clinic grow together, refining capacity for smooth interdisciplinary collaboration and effective KAP treatment by offering administrative support and member sponsored trainings and workshops for member clinics."
                tag="p"
                className="text-gray-700"
              />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <EditableText
                pageId="for-professionals"
                sectionId="website-resources-title"
                defaultContent="Multi-use Website Resources"
                tag="h3"
                className="text-2xl font-semibold text-kapstone-purple mb-6"
              />
              <ul className="space-y-4">
                {[
                  "Shared clinic resources including website-based pre-written forms, consent forms, commonly used psychological assessment measures with online use tutorials, teaching modules, treatment education modules, and patient psychoeducational skill development modules",
                  "Website forum for sharing practice questions, dilemmas, successes, and promotional announcements by member clinics",
                  "Directory of member clinics with pinned map and database listings for referrals between members and publicly available",
                  "DIY Directory Pages: Each clinic has website linked access and member created provider pages"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-kapstone-sage mr-2 flex-shrink-0 mt-1" />
                    <EditableText
                      pageId="for-professionals"
                      sectionId={`website-resources-item-${index + 1}`}
                      defaultContent={item}
                      tag="span"
                      className="text-gray-700"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Association Benefits */}
      <section className="relative py-20 min-h-[45vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
            alt="Majestic mountains"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EditableText
            pageId="for-professionals"
            sectionId="benefits-title"
            defaultContent="Professional Association Benefits"
            tag="h2"
            className="text-4xl font-bold sm:text-5xl text-white text-center text-shadow-lg mb-16"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8">
              <EditableText
                pageId="for-professionals"
                sectionId="advocacy-title"
                defaultContent="Advocacy & Recognition"
                tag="h3"
                className="text-2xl font-semibold text-kapstone-purple mb-6"
              />
              <ul className="space-y-4">
                {[
                  "Promotion of KAPstone Clinic model as a 'gold standard' through profession-wide education and advocacy",
                  "Advocacy with big providers such as hospitals, insurance payors, and medical associations (APA, AMA)",
                  "KAPstone Clinic Seal indicates status as member in good standing"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-kapstone-sage mr-2 flex-shrink-0 mt-1" />
                    <EditableText
                      pageId="for-professionals"
                      sectionId={`advocacy-item-${index + 1}`}
                      defaultContent={item}
                      tag="span"
                      className="text-gray-700"
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8">
              <EditableText
                pageId="for-professionals"
                sectionId="marketing-title"
                defaultContent="Marketing & Visibility"
                tag="h3"
                className="text-2xl font-semibold text-kapstone-purple mb-6"
              />
              <ul className="space-y-4">
                {[
                  "Search Engine Optimization benefits through our interconnected network",
                  "Improved web presence and search engine rankings through network association",
                  "Display KAPstone Clinic Seal on website and advertising materials"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-kapstone-sage mr-2 flex-shrink-0 mt-1" />
                    <EditableText
                      pageId="for-professionals"
                      sectionId={`marketing-item-${index + 1}`}
                      defaultContent={item}
                      tag="span"
                      className="text-gray-700"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Administration & Compliance */}
      <section className="py-20 bg-gradient-to-tr from-kapstone-sage/10 via-white to-kapstone-purple/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EditableText
            pageId="for-professionals"
            sectionId="admin-compliance-title"
            defaultContent="Administration & Compliance"
            tag="h2"
            className="text-3xl font-bold text-kapstone-purple text-center mb-16"
          />
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <EditableText
                pageId="for-professionals"
                sectionId="record-keeping-title"
                defaultContent="Record Keeping & Compliance"
                tag="h3"
                className="text-2xl font-semibold text-kapstone-purple mb-6"
              />
              <ul className="space-y-4">
                {[
                  "Keep full records of KAPstone Member clinics including Association Member Agreement documents",
                  "Intermittent review of member clinic compliance with licensing regulations",
                  "Review of complaints and maintenance of membership standards"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-kapstone-sage mr-2 flex-shrink-0 mt-1" />
                    <EditableText
                      pageId="for-professionals"
                      sectionId={`record-keeping-item-${index + 1}`}
                      defaultContent={item}
                      tag="span"
                      className="text-gray-700"
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <EditableText
                pageId="for-professionals"
                sectionId="supervision-training-title"
                defaultContent="Supervision & Training Programs"
                tag="h3"
                className="text-2xl font-semibold text-kapstone-purple mb-6"
              />
              <ul className="space-y-4">
                {[
                  "Support for front line therapists, mental health clinicians and nursing staff",
                  "Skill development for clinical supervisors",
                  "Training programs for team development and optimal team structures"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-kapstone-sage mr-2 flex-shrink-0 mt-1" />
                    <EditableText
                      pageId="for-professionals"
                      sectionId={`supervision-training-item-${index + 1}`}
                      defaultContent={item}
                      tag="span"
                      className="text-gray-700"
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <EditableText
                pageId="for-professionals"
                sectionId="collective-benefits-title"
                defaultContent="Collective Benefits"
                tag="h3"
                className="text-2xl font-semibold text-kapstone-purple mb-6"
              />
              <ul className="space-y-4">
                {[
                  "Obtaining beneficial supply privileges/discounts with medical equipment and medication supply companies",
                  "Liability Insurance providers - Credibility with insurance carriers",
                  "Educating the marketplace and promoting the KAPstone Clinic Model"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-kapstone-sage mr-2 flex-shrink-0 mt-1" />
                    <EditableText
                      pageId="for-professionals"
                      sectionId={`collective-benefits-item-${index + 1}`}
                      defaultContent={item}
                      tag="span"
                      className="text-gray-700"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 min-h-[45vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1448375240586-882707db888b"
            alt="Serene forest"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <EditableText
            pageId="for-professionals"
            sectionId="cta-title"
            defaultContent="Ready to Join KAPstone Clinics?"
            tag="h2"
            className="text-4xl font-bold sm:text-5xl text-white text-shadow-lg mb-8"
          />
          <EditableText
            pageId="for-professionals"
            sectionId="cta-subtitle"
            defaultContent="Take the first step towards becoming part of a community dedicated to excellence in ketamine-assisted psychotherapy."
            tag="p"
            className="text-xl text-white text-shadow mb-8 max-w-2xl mx-auto"
          />
          <button
            onClick={handleStartApplication}
            className="inline-flex items-center rounded-md bg-kapstone-sage px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-kapstone-sage-dark"
          >
            Start Your Application
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}