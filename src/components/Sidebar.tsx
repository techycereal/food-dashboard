import { Menu, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { TutorialBubble } from "./TutorialBubble";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const location = useLocation();
  const [sections, setSections] = useState([
    { name: "Inventory", path: "/", tutorial: false, key: "window" },
    { name: "Reports", path: "/reports", tutorial: false, key: "reports" },
    { name: "Offers", path: "/offers", tutorial: false, key: "offers" },
  ]);

  const tutorial = useSelector((state: RootState) => state.products.tutorial);
  const [collapsed, setCollapsed] = useState(false);

  const isReportingPhase =
    tutorial["window"] === false &&
    tutorial["reports"] === true &&
    location.pathname !== "/reports";

  const isOffersPhase =
    tutorial["window"] === false &&
    tutorial["reports"] === false &&
    tutorial["offers"] === true &&
    location.pathname !== "/offers";

  useEffect(() => {
    setSections((prev) => prev.map((item) => ({ ...item, tutorial: tutorial[item.key] })));
    if (tutorial["window"] === false) setCollapsed(false);
  }, [tutorial]);

  const linkClasses = (isActive: boolean) =>
    `flex items-center ${collapsed ? "justify-center" : "px-4"} py-2 text-gray-800 font-medium transition hover:bg-gray-100 ${isActive ? "underline underline-offset-4 font-semibold" : ""}`;

  return (
    <>
      {/* --- SINGLE MOBILE TRIGGER CONTAINER --- */}
      {/* This ensures only one button can ever exist on mobile */}
      {!mobileOpen && (
        <div className="fixed top-4 left-4 md:hidden z-50">
          {(isReportingPhase || isOffersPhase) ? (
            <TutorialBubble
              show={true}
              text={isReportingPhase ? "Open menu to learn about Reporting!" : "Open menu to learn about Offers!"}
              position="bottom-left"
              condition={false}
              additionalStyle="ml-4"
            >
              <button
                onClick={() => setMobileOpen(true)}
                className="p-3 bg-white rounded-xl shadow-lg border border-teal-100"
              >
                <Menu className="w-6 h-6 text-teal-600" />
              </button>
            </TutorialBubble>
          ) : (
            <button
              onClick={() => setMobileOpen(true)}
              className="p-3 bg-white rounded-xl shadow-lg border border-teal-100"
            >
              <Menu className="w-6 h-6 text-teal-600" />
            </button>
          )}
        </div>
      )}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-20 transition-opacity md:hidden ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`
          ${collapsed ? "w-16" : "w-48"} 
          bg-[#FCFCF9] h-full flex flex-col shadow-md
          fixed left-0 top-0 z-30
          transform transition-all duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          font-sora
        `}
      >
        {/* Top Control Section */}
        <div className="flex items-center justify-end px-4 py-4 relative h-14">
          {/* Mobile Close Button (Visible only when menu is open) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Desktop Collapse Button (Hidden on Mobile) */}
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="hidden md:block p-1 rounded hover:bg-gray-100 absolute top-4 right-4"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col space-y-4 mt-4 relative">
          {sections.map((section) => {
            const isReportsStep = section.key === "reports" && isReportingPhase;
            const isOffersStep = section.key === "offers" && isOffersPhase;

            return (
              <div key={section.name} className="relative">
                <TutorialBubble
                  show={!collapsed && (isReportsStep || isOffersStep)}
                  text={isReportsStep ? "Click here to Learn About Reports!" : "Click here to Learn About Offers!"}
                  position="right"
                  condition={false}
                  additionalStyle="ml-2 !w-48 hidden sm:block"
                >
                  <NavLink
                    to={section.path}
                    end
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => linkClasses(isActive)}
                  >
                    {collapsed ? section.name[0] : section.name}
                  </NavLink>
                </TutorialBubble>
              </div>
            );
          })}
        </nav>

        <NavLink to="/settings" onClick={() => setMobileOpen(false)} className={({ isActive }) => linkClasses(isActive) + " mb-4"}>
          {collapsed ? "S" : "Settings"}
        </NavLink>
      </aside>
    </>
  );
}