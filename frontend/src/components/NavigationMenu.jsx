import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import FilterableBlog from "./FilterableBlogs";
import profilepic from "../assets/profile-user.png";
import GadgetsSubmenu from "./GadgetsSubmenu";
import { useNavigate } from "react-router-dom";

export default function NavigationMenu() {
  const [activeComponent, setActiveComponent] = useState(null);
  const [search, setSearch] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigateTo = useNavigate();
  const location = useLocation(); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const renderComponent = () => {
    switch (activeComponent) {
      case "FASHION":
        return <FilterableBlog />;
      case "GADGETS":
        return <GadgetsSubmenu />;
      default:
        return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigateTo("/");
  };

  const menuItems = ["NEWS", "FASHION", "GADGETS", "LIFESTYLE"];

  return (
    <nav className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex">
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {menuItems.map((item) => (
                <div
                  key={item}
                  onMouseEnter={() => setActiveComponent(item)}
                  onMouseLeave={() => setActiveComponent(null)}
                  className="group"
                >
                  <Link
                    to={
                      item === "NEWS" ? "/" : `/category/${item.toLowerCase()}`
                    }
                    className={`inline-flex items-center px-1 pt-1 pb-2 border-b-2 text-base font-semibold ${
                      location.pathname.includes(item.toLowerCase())
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {item}
                    {["FASHION", "GADGETS"].includes(item) && (
                      <svg
                        className="ml-2 h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </Link>
                  {activeComponent === item &&
                    ["FASHION", "GADGETS"].includes(item) && (
                      <div className="absolute left-0 w-full mt-1 p-4 border border-gray-300 rounded-lg bg-white shadow-lg z-[99999]">
                        {renderComponent()}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
          <div className="md:flex w-full items-center justify-end hidden relative">
            <button
              type="button"
              onClick={() => setSearch(!search)}
              className="p-1 rounded-full text-gray-400 w-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Search</span>
              <Search className="h-6 w-6" aria-hidden="true" />
            </button>

            {search && (
              <div className="absolute left-0 top-10 w-full mt-1 p-4 border border-gray-300 rounded-lg bg-white shadow-lg z-[99999]">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button className="hover:text-sky-600 duration-300">
                    Search
                  </button>
                </div>
              </div>
            )}

            <div className="relative">
              <img
                src={profilepic}
                alt="Profile"
                className="w-10 h-10 rounded-full cursor-pointer"
                onClick={() => setDropdownOpen((prev) => !prev)}
              />
              {dropdownOpen && (
                <div className="absolute right-0 w-48 mt-2 p-2 border border-gray-300 rounded-lg bg-white shadow-lg z-50">
                  {isLoggedIn ? (
                    <>
                      <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
                      <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Admin Dashboard</Link>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Logout</button>
                    </>
                  ) : (
                    <Link to="/signin" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Sign In</Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
