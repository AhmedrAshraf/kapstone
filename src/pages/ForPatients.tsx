import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Accordion } from '../components/Accordion';
import { EditableText } from '../components/cms/EditableText';
import { EditableImage } from '../components/cms/EditableImage';
import { useScrollToTop } from '../hooks/useScrollToTop';

export function ForPatients() {
  // Add scroll to top functionality
  useScrollToTop();

  const faqItems = [
    {
      title: <EditableText
        pageId="for-patients"
        sectionId="faq-1-title"
        defaultContent="What is ketamine?"
        tag="span"
        className="text-xl font-semibold"
        disableButton={true}
      />,
      content: (
        <EditableText
          pageId="for-patients"
          sectionId="faq-1-content"
          defaultContent="Ketamine is a medication used historically to date as a 'dissociative anesthetic', often given to patients in emergency rooms to calm them and to induce a sense of availability to receive treatments such as stitches, minor surgeries, etc… It has been commonly administered to children in emergency rooms at much higher doses than is used therapeutically for mental health treatment. It was widely administered as a field medication for wounded soldiers in the army, both in Viet Nam and the conflicts in the Middle East. It is considered VERY safe at the doses administered typically recommended for mental treatment using the Kapstone clinic model. Its use has very recently expanded because research has shown it is highly successful in having a positive impact on difficult to treat, neuro-rigidified psychiatric disorders. Lighter dosing regimens have been found to facilitate other treatment modalities such as group therapy, couples therapy, and individual therapy with imagery, and somatic work."
          tag="p"
          className="text-gray-700"
        />
      )
    },
    {
      title: <EditableText
        pageId="for-patients"
        sectionId="faq-2-title"
        defaultContent="How is ketamine used to treat Psychiatric Disorders?"
        tag="span"
        className="text-xl font-semibold"
        disableButton={true}
      />,
      content: (
        <EditableText
          pageId="for-patients"
          sectionId="faq-2-content"
          defaultContent="Research over the past 15-20 years has shown that ketamine has a rapid and robust anti-depressant effect and there've been an array of studies showing ketamine is particularly effective in treating a broad range of disorders we might call neuro-rigidified disorders…people who experience thought, feeling and behavior patterns in a very stuck or rutted form. Some of the major disorders that fall into this category include treatment resistant depression, chronic suicidal ideation, ruminative anxieties, post traumatic stress disorder, obsessive-compulsive disorder, immobilizing fears of death in the terminally ill, and many of the addiction disorders."
          tag="p"
          className="text-gray-700"
        />
      )
    },
    {
      title: <EditableText
        pageId="for-patients"
        sectionId="faq-3-title"
        defaultContent="More specifically, how does ketamine work?"
        tag="span"
        className="text-xl font-semibold"
        disableButton={true}
      />,
      content: (
        <EditableText
          pageId="for-patients"
          sectionId="faq-3-content"
          defaultContent="Ketamine is a glutamate modulator. Glutamate is one of the more pervasive neurotransmitters in your brain and therefore, induces fairly widespread activation of neurons. If you think of the psychedelic experience as chemically induced neuronal stimulation or over-firing (… why we 'see or hear things that aren't there' … that are a result of internal, chemically generated stimuli.), and combine this with the learning principal 'What fires, wires!', then you can see how ketamine might induce a broad array of revitalized neuronal connections. Ketamine researchers are observing broad acting neuronal reactivation, … and ultimately actual measurable synaptic and dendritic growth has been observed, possibly reversing years of neuronal degeneration from things like alcohol abuse or the 'shutting down' associated with trauma history or depressive entrenchment."
          tag="p"
          className="text-gray-700"
        />
      )
    },
    {
      title: <EditableText
        pageId="for-patients"
        sectionId="faq-4-title"
        defaultContent="What mental disorders does ketamine improve and how might it help me?"
        tag="span"
        className="text-xl font-semibold"
        disableButton={true}
      />,
      content: (
        <EditableText
          pageId="for-patients"
          sectionId="faq-4-content"
          defaultContent="As indicated earlier, the mental disorders most commonly associated with a sense of feeling 'stuck' are the ones most effectively treated by ketamine. These include disorders such as treatment resistant depression, ruminative anxiety disorders, obsessive-compulsive disorder, post traumatic stress disorder, suicidal ideation, moodiness, and hopelessness."
          tag="p"
          className="text-gray-700"
        />
      )
    },
    {
      title: <EditableText
        pageId="for-patients"
        sectionId="faq-5-title"
        defaultContent="What types of therapy benefit the most from ketamine's effects?"
        tag="span"
        className="text-xl font-semibold"
        disableButton={true}
      />,
      content: (
        <EditableText
          pageId="for-patients"
          sectionId="faq-5-content"
          defaultContent="To date, most of the research with ketamine has been using it for classic individual therapy. However, more recently, there has been a greater recognition of its benefits using different dosing regimens. Ketamine is being used at very light doses to induce a sense of peaceful calm repose making it easier to consciously reflect on life's struggles while being able to talk during and shortly after the medicine's most acute effects begin to wear off in the session. Ketamine has also been found to induce an openness to connect and feel a sense of commonality and bond with others both in couples and group therapy. Some populations where group therapy with ketamine is showing powerful positive results include PTSD work with veterans, groups for people with terminal illnesses, or end of life depression and anxiety."
          tag="p"
          className="text-gray-700"
        />
      )
    },
    {
      title: <EditableText
        pageId="for-patients"
        sectionId="faq-6-title"
        defaultContent="What does it feel like to be 'inside' the ketamine experience?"
        tag="span"
        className="text-xl font-semibold"
        disableButton={true}
      />,
      content: (
        <div className="space-y-6">
          <div className="border-l-4 border-kapstone-sage pl-4">
            <EditableText
              pageId="for-patients"
              sectionId="faq-6-light-title"
              defaultContent="Light Dose"
              tag="h4"
              className="font-semibold text-kapstone-purple mb-2"
            />
            <EditableText
              pageId="for-patients"
              sectionId="faq-6-light-content"
              defaultContent="You may feel light headed, deeply relaxed, groggy, able to talk, and in a more open way."
              tag="p"
              className="text-gray-700"
            />
          </div>
          <div className="border-l-4 border-kapstone-sage pl-4">
            <EditableText
              pageId="for-patients"
              sectionId="faq-6-medium-title"
              defaultContent="Medium Dose"
              tag="h4"
              className="font-semibold text-kapstone-purple mb-2"
            />
            <EditableText
              pageId="for-patients"
              sectionId="faq-6-medium-content"
              defaultContent="A more significant 'trance state' even while still maintaining a sense of self. Speech remains possible within the session and therapeutic insight can occur as we engage with our therapist. Often memories, hopes, regrets, and intentions are activated. It is not unusual to experience some vivid internally generated visual patterns & images. Though some anticipate these with fear, we find the context of a comfortable office environment combined with our supportive presence, the hallucinatory properties of ketamine are at least, curious and interesting, and at best, experienced as quite enjoyable; often euphoric."
              tag="p"
              className="text-gray-700"
            />
          </div>
          <div className="border-l-4 border-kapstone-sage pl-4">
            <EditableText
              pageId="for-patients"
              sectionId="faq-6-high-title"
              defaultContent="Higher Dose"
              tag="h4"
              className="font-semibold text-kapstone-purple mb-2"
            />
            <EditableText
              pageId="for-patients"
              sectionId="faq-6-high-content"
              defaultContent="People are fairly quiet, internally focused. The experience truly can feel like a 'journey', and though most people cannot recall specific elements of the experience with clarity, it is commonly felt to be transformative or mystical in nature."
              tag="p"
              className="text-gray-700"
            />
          </div>
        </div>
      )
    },
    {
      title: <EditableText
        pageId="for-patients"
        sectionId="faq-7-title"
        defaultContent="How long does it take to recover from the treatment, after the sessions?"
        tag="span"
        className="text-xl font-semibold"
        disableButton={true}
      />,
      content: (
        <EditableText
          pageId="for-patients"
          sectionId="faq-7-content"
          defaultContent="Directly following a session, we take precautions to insure you feel well enough to go home. In other words, that you are alert and present. While the medicine has sedating and dissociating effects, we make sure these have subsided before you leave. Usually people are ready to leave between 2-3 hours after their session begins. It is similar to the recovery process following minor day medical procedures such as dental work or a colonoscopy. You must have someone (a responsible friend, spouse, etc…) drive you home. If this is not possible, you should talk to us first, before scheduling a treatment with the medicine. Expect feeling a bit hazy, perhaps unsteady on your feet, for a few hours. All patients receiving the medicine must agree (sign a contract) that they will not operate a motor vehicle within 8 hours after a treatment, and that they will be brought home by a responsible adult."
          tag="p"
          className="text-gray-700"
        />
      )
    },
    {
      title: <EditableText
        pageId="for-patients"
        sectionId="faq-8-title"
        defaultContent="What are the broader effects I might feel?"
        tag="span"
        className="text-xl font-semibold"
        disableButton={true}
      />,
      content: (
        <EditableText
          pageId="for-patients"
          sectionId="faq-8-content"
          defaultContent="Many report rapid relief of symptoms after ketamine treatments. It seems to induce in people a broad sense of openness, expansiveness, and a sense of no longer being weighed down by recurring anxieties, worries, fears, or thought patterns. There is often an openness to entertain new ways of thinking or make different choices. These feelings are thought to be a direct result of ketamine's chemically induced neuro-plasticity; a rekindled propensity for learning."
          tag="p"
          className="text-gray-700"
        />
      )
    },
    {
      title: <EditableText
        pageId="for-patients"
        sectionId="faq-9-title"
        defaultContent="What are my chances of being helped with this treatment?"
        tag="span"
        className="text-xl font-semibold"
        disableButton={true}
      />,
      content: (
        <EditableText
          pageId="for-patients"
          sectionId="faq-9-content"
          defaultContent="People who've been in therapy for years, whose treatment has been characterized as 'maintenance oriented' are finding themselves to be 70-80% responsive to ketamine assisted psychotherapy. With the protocol we offer at the Center for Healing Journeys, combining psychotherapy with this powerful medicine, we bring the best tools available to help you optimize your chances for positive change."
          tag="p"
          className="text-gray-700"
        />
      )
    },
    {
      title: <EditableText
        pageId="for-patients"
        sectionId="faq-10-title"
        defaultContent="Are there any negatives to using ketamine as a medicine? Is it addictive? Are there any long term negative side effects?"
        tag="span"
        className="text-xl font-semibold"
        disableButton={true}
      />,
      content: (
        <EditableText
          pageId="for-patients"
          sectionId="faq-10-content"
          defaultContent="Ketamine has stood the test of time in the medical system. There has been no evidence of long term negative consequences at the frequency and dosages we are prescribing at the Center for Healing Journeys. At this level of use, it is safe, predictable, and effective. It is NOT considered to be a physically addictive medication. And though many people enjoy the experience under the influence of the medicine, it is difficult to become psychologically addicted, even if so inclined. Using it often is not particularly appealing to most people. Additionally, it is a controlled substance that is not commonly prescribed outside of the highly supervised setting of hospitals, clinics, or offices. While some clinics do write scripts at very low dosages for home use in very conscribed circumstances, it is not particularly common. And when it has been appropriate, instances of addiction are extremely rare."
          tag="p"
          className="text-gray-700"
        />
      )
    },
    {
      title: <EditableText
        pageId="for-patients"
        sectionId="faq-11-title"
        defaultContent="How is the Kapstone Clinics different than other ketamine clinics?"
        tag="span"
        className="text-xl font-semibold"
        disableButton={true}
      />,
      content: (
        <div className="space-y-6">
          <EditableText
            pageId="for-patients"
            sectionId="faq-11-content-1"
            defaultContent="Most existing clinics that offer ketamine treatment, do NOT offer the full support of Ketamine Assisted Psychotherapy (KAP). They are primarily medicine infusion programs run by anesthesiologists or medical doctors, without psychotherapists on staff. That method avails itself of the pharmacological benefits of the medicine alone. While Kapstone Clinics sees that approach as beneficial…to a point, we believe the best approach combines psychotherapy with the ketamine treatments so that we can take full taking advantage of ketamine's potential for healing."
            tag="p"
            className="text-gray-700"
          />
          <EditableText
            pageId="for-patients"
            sectionId="faq-11-content-2"
            defaultContent="The ketamine opens your neuronal network in a way that enables the patient to learn new patterns. Without combining this with therapy you are left to continue living inside the same restrictive assumptions and environment that you experienced prior to treatment. When you receive ketamine treatments, there is finite window of opportunity in which we can most easily cultivate more enduring change. The period of time just after a treatment with ketamine is a critical time to commit to establishing new life patterns guided by your deepest hopes and dreams. It is a time when people feel open and more connected to their willingness to shed old patterns and reset one's sights on trying things you may have given up on."
            tag="p"
            className="text-gray-700"
          />
          <EditableText
            pageId="for-patients"
            sectionId="faq-11-content-3"
            defaultContent="Ketamine offers people a revitalized capacity to learn. The Kapstone Clinic model is designed to help you reconnect to your deepest self and align your day to day life with goals that are both realistic and more connected to your highest aspirations. With KAP, you will want to focus on establishing specific new patterns such as practicing to be more social, reconnect with your body through nutrition, exercise, dance, or yoga. We will help you consider these new possibilities so you can take your best 'right sized steps' to optimize feelings of progress and success in your life."
            tag="p"
            className="text-gray-700"
          />
        </div>
      )
    },
    {
      title: <EditableText
        pageId="for-patients"
        sectionId="faq-12-title"
        defaultContent="What if I am not interested in therapy but, just want to try the medicine as a pharmacological intervention?"
        tag="span"
        className="text-xl font-semibold"
        disableButton={true}
      />,
      content: (
        <EditableText
          pageId="for-patients"
          sectionId="faq-12-content"
          defaultContent="Yes, some people may choose only to receive the ketamine treatments without 'integration therapy'. We will discuss your needs and hopes for ketamine treatment at the intake session and help you decide what is right for you. Even those choosing the more basic pharmacological option receive some integration therapy at the end of each ketamine session. We feel it's an essential part of effective treatment. Some patients already have their own therapists and we will find ways to work with your current therapy providers. While research shows high levels of improvement with the medicine alone (approx. 70%) early data from newer studies are showing stronger and more enduring results (80%+) by adding integration therapy to the mix. We feel it's important for you to know the full psychological healing potential of this medicine and the ways you can use it. We will encourage all our patients to find their own way of optimizing the full range of biological, psychological, and transcendent benefits. Ultimately we deeply respect your work and your choices and we look forward to collaborating with you to come up with a plan that works best for you."
          tag="p"
          className="text-gray-700"
        />
      )
    }
  ];

  const scrollToFAQ = () => {
    document.getElementById('learn-more')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section with Radial Gradient */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <EditableImage
            pageId="for-patients"
            sectionId="hero-image"
            defaultSrc="https://images.unsplash.com/photo-1447752875215-b2761acb3c5d"
            alt="Peaceful forest in morning light"
            className="w-full h-full object-cover brightness-100"
          />
          <div className="absolute inset-0 bg-gray-900/10" />
        </div>
        <div className="relative w-full mt-[100px] mb-[100px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <EditableText
                pageId="for-patients"
                sectionId="hero-title"
                defaultContent="Begin Your Journey to Healing"
                tag="h1"
                className="text-4xl font-bold sm:text-5xl md:text-6xl text-white text-shadow-lg"
              />
              <EditableText
                pageId="for-patients"
                sectionId="hero-subtitle"
                defaultContent="Thank you for taking this important step in learning more about ketamine treatment. We understand that seeking help for mental health challenges requires courage, and we're here to provide you with clear, comprehensive information about how Ketamine-Assisted Psychotherapy (KAP) might help you or your loved ones."
                tag="p"
                className="mt-6 max-w-3xl mx-auto text-xl text-white text-shadow"
              />
              <div className="mt-12 flex justify-center gap-x-6">
                <Link
                  to="/clinic-directory"
                  className="rounded-md bg-kapstone-sage px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-kapstone-sage-dark"
                >
                  Find a Clinic
                </Link>
                <button
                  onClick={scrollToFAQ}
                  className="rounded-md bg-white px-8 py-3 text-lg font-semibold text-kapstone-purple shadow-sm hover:bg-gray-100"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="learn-more" className="py-20 bg-gradient-to-b from-kapstone-sage/5 to-kapstone-sage/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EditableText
            pageId="for-patients"
            sectionId="faq-title"
            defaultContent="Frequently Asked Questions"
            tag="h2"
            className="text-3xl font-bold text-kapstone-purple text-center mb-16"
          />
          <div className="max-w-4xl mx-auto">
            <Accordion items={faqItems} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 min-h-[45vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"
            alt="Mountain path"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <EditableText
            pageId="for-patients"
            sectionId="cta-title"
            defaultContent="Ready to Take the Next Step?"
            tag="h2"
            className="text-4xl font-bold sm:text-5xl text-white text-shadow-lg mb-8"
          />
          <EditableText
            pageId="for-patients"
            sectionId="cta-subtitle"
            defaultContent="Find a KAPstone Clinic near you and begin your journey toward healing and growth."
            tag="p"
            className="text-xl text-white text-shadow mb-8 max-w-2xl mx-auto"
          />
          <div className="inline-flex items-center">
            <Link
              to="/clinic-directory"
              className="inline-flex items-center rounded-md bg-kapstone-sage px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-kapstone-sage-dark"
            >
              Find a Clinic
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}