import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const sections = [
    { name: "Inventory", path: "/" },
    { name: "Reports", path: "/reports" },
    { name: "Offers", path: "/offers" },
  ];

  const [collapsed, setCollapsed] = useState(false);

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
        <nav className="flex-1 flex flex-col space-y-4 mt-4">
          {sections.map((section) => (
            <NavLink
              key={section.name}
              to={section.path}
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => linkClasses(isActive)}
            >
              {collapsed ? section.name[0] : section.name}
            </NavLink>
          ))}
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
