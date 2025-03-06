import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, LogIn, LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { LoginModal } from "./LoginModal";
import axios from "axios";
import { supabase } from "../lib/supabase";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const { signOut } = useAuthStore();
  const navigate = useNavigate();
  const resourcesTimeoutRef = useRef<NodeJS.Timeout>();
  const resourcesRef = useRef<HTMLDivElement>(null);
  const [cancelingLoading, setCancelingloading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        if (session) {
          const { data: userDetail, error: userErrror } = await supabase
            .from("users")
            .select("*")
            .maybeSingle()
            .eq("auth_id", session.user.id);

          if (userErrror) throw userErrror;

          if (userDetail) {
            setSubscriptionDetails(userDetail);
          }

          setUser(session.user);
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setIsScrolled(currentScrollPos > 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resourcesRef.current &&
        !resourcesRef.current.contains(event.target as Node)
      ) {
        setShowResources(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResourcesEnter = () => {
    if (resourcesTimeoutRef.current) {
      clearTimeout(resourcesTimeoutRef.current);
    }
    setShowResources(true);
  };

  const handleResourcesLeave = () => {
    resourcesTimeoutRef.current = setTimeout(() => {
      setShowResources(false);
    }, 300);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleLinkClick = () => {
    setShowResources(false);
    setIsOpen(false);
  };

  const handleCancelSubcription = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel your subscription?"
    );
    if (!confirmCancel) {
      return;
    }
    try {
      setCancelingloading(true);
      // const response = await axios.post('http://localhost:8300/api/cancel-payment', {
      const response = await axios.post(
        "https://kapstone-sandy.vercel.app/api/cancel-payment",
        {
          uid: user.id,
          subscriptionId: subscriptionDetails.subscription_id,
        }
      );

      console.log("response", response);

      const data = response.data;
      if (response.status !== 200) {
        alert(`Error: ${data.error || "An error occurred."}`);
        return;
      }
      setSubscriptionDetails((prev) => ({
        ...prev,
        subscription_status: "canceled",
      }));

      alert(data.message);
    } catch (error) {
      console.error("error", error);
      alert(
        "There was an issue canceling your subscription. Please try again later."
      );
    }
  };

  return (
    <>
      <nav
        className={`fixed w-full bg-white shadow-lg transition-all duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        } z-40`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex justify-between items-center transition-all duration-300 ${
              isScrolled ? "h-[80px]" : ""
            }`}
          >
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <img
                  className={`transition-all duration-300 ${
                    isScrolled ? "h-[60px]" : "h-[150px]"
                  } w-auto py-[10px]`}
                  src="/logo.svg"
                  alt="KAPstone Clinics"
                />
              </Link>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="flex space-x-4">
                <Link
                  to="/for-patients"
                  className="text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-sm font-medium"
                  onClick={handleLinkClick}
                >
                  For Patients
                </Link>
                <Link
                  to="/for-professionals"
                  className="text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-sm font-medium"
                  onClick={handleLinkClick}
                >
                  For Professionals
                </Link>
                <Link
                  to="/clinic-directory"
                  className="text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-sm font-medium"
                  onClick={handleLinkClick}
                >
                  Clinic Directory
                </Link>
                <div
                  ref={resourcesRef}
                  className="relative"
                  onMouseEnter={handleResourcesEnter}
                  onMouseLeave={handleResourcesLeave}
                >
                  <button className="text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-sm font-medium inline-flex items-center">
                    Resources
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  {showResources && (
                    <div className="absolute z-10 left-0 mt-0 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 animate-fadeIn">
                      <div className="h-2" />
                      <div className="py-1">
                        <Link
                          to="/team"
                          className="block px-4 py-2 text-sm text-gray-700 hover:text-kapstone-sage"
                          onClick={handleLinkClick}
                        >
                          Our Team
                        </Link>
                        <Link
                          to="/blog"
                          className="block px-4 py-2 text-sm text-gray-700 hover:text-kapstone-sage"
                          onClick={handleLinkClick}
                        >
                          Blog
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <Link
                  to="/contact"
                  className="text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-sm font-medium"
                  onClick={handleLinkClick}
                >
                  Contact
                </Link>

                {user ? (
                  <>
                    <Link
                      to="/member-hub"
                      className="text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-sm font-medium"
                      onClick={handleLinkClick}
                    >
                      Member Hub
                    </Link>
                    {/* <button
                      onClick={handleLogout}
                      className="text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-sm font-medium inline-flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Sign Out
                    </button> */}
                    {subscriptionDetails?.subscription_status === "active" && (
                      <button
                        onClick={handleCancelSubcription}
                        className="border border-red-600 text-sm text-red-600 p-3 rounded-lg"
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-sm font-medium inline-flex items-center"
                  >
                    <LogIn className="h-4 w-4 mr-1" />
                    Member Login
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-kapstone-purple hover:text-kapstone-sage"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/for-patients"
                className="block text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-base font-medium"
                onClick={handleLinkClick}
              >
                For Patients
              </Link>
              <Link
                to="/for-professionals"
                className="block text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-base font-medium"
                onClick={handleLinkClick}
              >
                For Professionals
              </Link>
              <Link
                to="/clinic-directory"
                className="block text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-base font-medium"
                onClick={handleLinkClick}
              >
                Clinic Directory
              </Link>
              <div className="space-y-1">
                <button
                  onClick={() => setShowResources(!showResources)}
                  className="w-full text-left text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-base font-medium"
                >
                  Resources
                </button>
                {showResources && (
                  <div className="pl-4">
                    <Link
                      to="/team"
                      className="block text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-base font-medium"
                      onClick={handleLinkClick}
                    >
                      Our Team
                    </Link>
                    <Link
                      to="/blog"
                      className="block text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-base font-medium"
                      onClick={handleLinkClick}
                    >
                      Blog
                    </Link>
                  </div>
                )}
              </div>
              <Link
                to="/contact"
                className="block text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-base font-medium"
                onClick={handleLinkClick}
              >
                Contact
              </Link>
              {user ? (
                <>
                  <Link
                    to="/member-hub"
                    className="block text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-base font-medium"
                    onClick={handleLinkClick}
                  >
                    Member Hub
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-base font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    handleLinkClick();
                  }}
                  className="w-full text-left text-kapstone-purple hover:text-kapstone-sage px-3 py-2 rounded-md text-base font-medium"
                >
                  Member Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </>
  );
}
