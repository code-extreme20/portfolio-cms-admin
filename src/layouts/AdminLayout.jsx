import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Code2,
  FolderKanban,
  Briefcase,
  Wrench,
  MessageSquareQuote,
  FileText,
  Images,
  Mail,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "About", path: "/about", icon: User },
  { label: "Skills", path: "/skills", icon: Code2 },
  { label: "Projects", path: "/projects", icon: FolderKanban },
  { label: "Experience", path: "/experience", icon: Briefcase },
  { label: "Services", path: "/services", icon: Wrench },
  {
    label: "Testimonials",
    path: "/testimonials",
    icon: MessageSquareQuote,
  },
  { label: "Blogs", path: "/blogs", icon: FileText },
  { label: "Media", path: "/media", icon: Images },
  { label: "Messages", path: "/messages", icon: Mail },
];

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <div className="flex min-h-screen min-w-0 max-w-full overflow-x-hidden bg-[#020617] text-slate-100">
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 min-w-0 flex-col
          border-r border-[#1e293b]
          bg-[#0f172a]
          transition-transform duration-300
          lg:static lg:z-auto lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* LOGO */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#1e293b] px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">
              <LayoutDashboard size={19} className="text-white" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-white">
                Portfolio CMS
              </h1>

              <p className="truncate text-[11px] text-slate-500">
                Admin Panel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeMobileSidebar}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-[#17243b] hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3">
          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/dashboard"}
                  onClick={closeMobileSidebar}
                  className={({ isActive }) =>
                    `
                    group flex min-w-0 items-center gap-2.5
                    rounded-lg px-3 py-2.5
                    text-[14px] font-medium
                    transition
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                        : "text-slate-400 hover:bg-[#17243b] hover:text-white"
                    }
                  `
                  }
                >
                  <Icon size={18} className="shrink-0" />

                  <span className="min-w-0 flex-1 truncate">
                    {item.label}
                  </span>

                  <ChevronRight
                    size={14}
                    className="shrink-0 opacity-0 transition group-hover:opacity-100"
                  />
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* USER */}
        <div className="shrink-0 border-t border-[#1e293b] p-3">
          <div className="mb-2 flex min-w-0 items-center gap-2.5 rounded-lg bg-[#111c31] p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
              <User size={17} className="text-blue-400" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {user?.name || "Admin"}
              </p>

              <p className="truncate text-[10px] text-slate-500">
                {user?.email || "Administrator"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={17} className="shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex min-h-screen min-w-0 max-w-full flex-1 flex-col overflow-x-hidden">
        {/* MOBILE HEADER */}
        <header className="flex h-14 shrink-0 items-center border-b border-[#1e293b] bg-[#0f172a] px-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-300 transition hover:bg-[#17243b]"
          >
            <Menu size={20} />
          </button>

          <div className="ml-2.5 min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              Portfolio CMS
            </p>
          </div>
        </header>

        {/* PAGE */}
        <main className="min-w-0 max-w-full flex-1 overflow-x-hidden">
          <div className="admin-compact min-w-0 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;