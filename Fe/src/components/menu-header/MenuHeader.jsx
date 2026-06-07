import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import EventIcon from "@mui/icons-material/Event";
import HomeIcon from "@mui/icons-material/Home";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ClassIcon from "@mui/icons-material/Class";
import { NavLink, useLocation } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

function MenuHeader() {
  const location = useLocation();
  const { user } = useAuthStore();

  const isRouteActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const menuItems = [
    { label: "Trang chủ",      path: "/",               icon: <HomeIcon fontSize="medium" /> },
    // Student
    { label: "Khóa học",       path: "/courses",        role: "student", icon: <MenuBookIcon fontSize="medium" /> },
    { label: "Lớp của tôi",    path: "/my-classes",     role: "student", icon: <ClassIcon fontSize="medium" /> },
    { label: "Luyện tập",      path: "/practice",       role: "student", icon: <SchoolIcon fontSize="medium" /> },
    // Teacher
    { label: "Lớp dạy",        path: "/my-teaching",    role: "teacher", icon: <ClassIcon fontSize="medium" /> },
    { label: "Quản lý tài liệu", path: "/manage-document", role: "teacher", icon: <LibraryBooksIcon fontSize="medium" /> },
    // Admin
    { label: "Admin",          path: "/admin",          role: "admin",   icon: <AdminPanelSettingsIcon fontSize="medium" /> },
  ];

  const VISIBLE_ROLE = user?.role;

  return (
    <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-[14px] font-semibold select-none">
      {menuItems
        .filter((item) => !item.role || VISIBLE_ROLE === item.role)
        .map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              [
                "flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400",
                isActive
                  ? "text-red-700 bg-red-50 shadow-sm font-bold"
                  : "text-stone-700 hover:text-red-600 hover:bg-red-50",
              ].join(" ")
            }
            aria-current={isRouteActive(item.path) ? "page" : undefined}
            title={item.label}
          >
            <span className={`text-base ${isRouteActive(item.path) ? "text-red-600" : "text-red-400"}`}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
    </nav>
  );
}

export default MenuHeader;
