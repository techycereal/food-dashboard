import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const [sections, setSections] = useState([
    { name: "Inventory", path: "/", tutorial: false, key: "window" },
    { name: "Reports", path: "/reports", tutorial: false, key: "reports" },
    { name: "Offers", path: "/offers", tutorial: false, key: "offers" },
  ]);

  const tutorial = useSelector((state: RootState) => state.products.tutorial);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Update sections' tutorial flags from Redux state
    setSections((prev) =>
      prev.map((item) => ({ ...item, tutorial: tutorial[item.key] }))
    );

    if (tutorial["window"] === false) {
      setCollapsed(false);
    }
  }, [tutorial]);

  const linkClasses = (isActive: boolean) =>
    `
      flex items-center
      ${collapsed ? "justify-center" : "px-4"}
      py-2
      text-gray-800 font-medium
      transition
      hover:bg-gray-100
      ${isActive ? "underline underline-offset-4 font-semibold" : ""}
    `;

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/40 z-20 transition-opacity md:hidden ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
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
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() =>
              window.innerWidth < 768
                ? setMobileOpen(false)
                : setCollapsed((prev) => !prev)
            }
            className="p-1 rounded hover:bg-gray-100 absolute top-4 right-4"
          >
            {mobileOpen && window.innerWidth < 768 ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 flex flex-col space-y-4 mt-4 relative">
          {sections.map((section) => {
            const showReportsBubble = section.key === "reports" && tutorial["window"] === false && tutorial["reports"] == true;
            const showOffersBubble =
              section.key === "offers" &&
              tutorial["window"] === false &&
              tutorial["reports"] === false && tutorial["offers"] === true;

            return (
              <div key={section.name} className="relative">
                <NavLink
                  to={section.path}
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => linkClasses(isActive)}
                >
                  {collapsed ? section.name[0] : section.name}
                </NavLink>

                {/* Small Tutorial Bubble */}
                {!collapsed && (showReportsBubble || showOffersBubble) && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-40 p-2 bg-black/90 text-white text-xs rounded shadow-lg z-50 pointer-events-none">
                    {showReportsBubble
                      ? "Click here to Learn About Reports!"
                      : "Click here to Learn About What You Can Offer your Customers!"}
                    <div className="absolute w-2 h-2 bg-black/90 rotate-45 -left-1 top-1/2 -translate-y-1/2" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Settings */}
        <NavLink
          to="/settings"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `
              flex items-center
              ${collapsed ? "justify-center" : "px-4"}
              py-2 mb-4
              text-gray-800 font-medium
              transition
              hover:bg-gray-100
              ${isActive ? "underline underline-offset-4 font-semibold" : ""}
            `
          }
        >
          {collapsed ? "S" : "Settings"}
        </NavLink>
      </aside>
    </>
  );
}
