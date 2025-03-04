import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { ForProfessionals } from './pages/ForProfessionals';
import { ForPatients } from './pages/ForPatients';
import { ClinicDirectory } from './pages/ClinicDirectory';
import { ClinicPage } from './pages/clinic/ClinicPage';
import { NewClinicForm } from './pages/clinic/NewClinicForm';
import { Team } from './pages/Team';
import { TeamMember } from './pages/team/TeamMember';
import { MemberHub } from './pages/MemberHub';
import { Forum } from './pages/member/Forum';
import { ForumPost } from './pages/member/ForumPost';
import { ForumEdit } from './pages/member/ForumEdit';
import { NewForumPost } from './pages/member/NewForumPost';
import { CaseReports } from './pages/member/CaseReports';
import { CaseReportDetail } from './pages/member/CaseReportDetail';
import { CaseReportEdit } from './pages/member/CaseReportEdit';
import { NewCaseReport } from './pages/member/NewCaseReport';
import { Resources } from './pages/member/Resources';
import { ReferralsHub } from './pages/member/ReferralsHub';
import { ReferralDetail } from './pages/member/ReferralDetail';
import { ReferralEdit } from './pages/member/ReferralEdit';
import { NewReferral } from './pages/member/NewReferral';
import { Announcements } from './pages/member/Announcements';
import { AnnouncementDetail } from './pages/member/AnnouncementDetail';
import { AnnouncementEdit } from './pages/member/AnnouncementEdit';
import { NewAnnouncement } from './pages/member/NewAnnouncement';
import { Contact } from './pages/Contact';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { BlogEditor } from './pages/admin/BlogEditor';
import { CheckoutSuccess } from './pages/checkout/Success';
import { CheckoutCancel } from './pages/checkout/Cancel';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminOverlay } from './components/cms/AdminOverlay';
import PaymentPlan from './pages/PaymentPlan';

function App() {
  return (
    <Router>
      <AdminOverlay>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navigation />
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/for-professionals" element={<ForProfessionals />} />
              <Route path="/for-patients" element={<ForPatients />} />
              <Route path="/clinic-directory" element={<ClinicDirectory />} />
              <Route path="/clinic-directory/new" element={<NewClinicForm />} />
              <Route path="/clinic/:id" element={<ClinicPage />} />
              <Route path="/team" element={<Team />} />
              <Route path="/team/:slug" element={<TeamMember />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/blog/new" element={<BlogEditor />} />
              <Route path="/blog/edit/:id" element={<BlogEditor />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/checkout" element={<PaymentPlan />} />
              <Route path="/checkout/cancel" element={<CheckoutCancel />} />
              <Route
                path="/member-hub"
                element={
                  <ProtectedRoute>
                    <MemberHub />
                  </ProtectedRoute>
                }
              >
                <Route path="forum" element={<Forum />} />
                <Route path="forum/new" element={<NewForumPost />} />
                <Route path="forum/:id" element={<ForumPost />} />
                <Route path="forum/edit/:id" element={<ForumEdit />} />
                <Route path="referrals" element={<ReferralsHub />} />
                <Route path="referrals/:id" element={<ReferralDetail />} />
                <Route path="referrals/edit/:id" element={<ReferralEdit />} />
                <Route path="referrals/new" element={<NewReferral />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="announcements/:id" element={<AnnouncementDetail />} />
                <Route path="announcements/edit/:id" element={<AnnouncementEdit />} />
                <Route path="announcements/new" element={<NewAnnouncement />} />
                <Route path="case-reports" element={<CaseReports />} />
                <Route path="case-reports/new" element={<NewCaseReport />} />
                <Route path="case-reports/:id" element={<CaseReportDetail />} />
                <Route path="case-reports/edit/:id" element={<CaseReportEdit />} />
                <Route path="resources" element={<Resources />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </AdminOverlay>
    </Router>
  );
}

export default App;