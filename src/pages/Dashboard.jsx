import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FolderKanban,
  Code2,
  FileText,
  Mail,
  BriefcaseBusiness,
  Wrench,
  MessageSquareQuote,
  ArrowUpRight,
  Plus,
  RefreshCw,
} from "lucide-react";

import api from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    blogs: 0,
    messages: 0,
    experience: 0,
    services: 0,
    testimonials: 0,
  });

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        projectsResponse,
        skillsResponse,
        blogsResponse,
        messagesResponse,
        experienceResponse,
        servicesResponse,
        testimonialsResponse,
      ] = await Promise.all([
        api.get("/projects"),
        api.get("/skills"),
        api.get("/blogs"),
        api.get("/contact"),
        api.get("/experience"),
        api.get("/services"),
        api.get("/testimonials"),
      ]);

      const projects =
        projectsResponse.data?.data ||
        projectsResponse.data?.projects ||
        [];

      const skills =
        skillsResponse.data?.data ||
        skillsResponse.data?.skills ||
        [];

      const blogs =
        blogsResponse.data?.data ||
        blogsResponse.data?.blogs ||
        [];

      const contactMessages =
        messagesResponse.data?.data ||
        messagesResponse.data?.messages ||
        [];

      const experience =
        experienceResponse.data?.data ||
        experienceResponse.data?.experience ||
        [];

      const services =
        servicesResponse.data?.data ||
        servicesResponse.data?.services ||
        [];

      const testimonials =
        testimonialsResponse.data?.data ||
        testimonialsResponse.data?.testimonials ||
        [];

      setStats({
        projects: projects.length,
        skills: skills.length,
        blogs: blogs.length,
        messages: contactMessages.length,
        experience: experience.length,
        services: services.length,
        testimonials: testimonials.length,
      });

      setMessages(
        Array.isArray(contactMessages)
          ? contactMessages.slice(0, 5)
          : []
      );
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const statCards = [
    {
      title: "Projects",
      value: stats.projects,
      icon: FolderKanban,
      path: "/projects",
      description: "Portfolio projects",
    },
    {
      title: "Skills",
      value: stats.skills,
      icon: Code2,
      path: "/skills",
      description: "Technical skills",
    },
    {
      title: "Blogs",
      value: stats.blogs,
      icon: FileText,
      path: "/blogs",
      description: "Published articles",
    },
    {
      title: "Messages",
      value: stats.messages,
      icon: Mail,
      path: "/messages",
      description: "Contact messages",
    },
    {
      title: "Experience",
      value: stats.experience,
      icon: BriefcaseBusiness,
      path: "/experience",
      description: "Work experience",
    },
    {
      title: "Services",
      value: stats.services,
      icon: Wrench,
      path: "/services",
      description: "Services offered",
    },
    {
      title: "Testimonials",
      value: stats.testimonials,
      icon: MessageSquareQuote,
      path: "/testimonials",
      description: "Client testimonials",
    },
  ];

  const quickActions = [
    {
      title: "Add Project",
      description: "Create a new portfolio project",
      path: "/projects",
      icon: FolderKanban,
    },
    {
      title: "Add Skill",
      description: "Add a technical skill",
      path: "/skills",
      icon: Code2,
    },
    {
      title: "Write Blog",
      description: "Publish a new article",
      path: "/blogs",
      icon: FileText,
    },
    {
      title: "Add Service",
      description: "Create a new service",
      path: "/services",
      icon: Wrench,
    },
  ];

  const getMessageName = (message) => {
    return (
      message?.name ||
      message?.fullName ||
      message?.senderName ||
      "Unknown"
    );
  };

  const getMessageEmail = (message) => {
    return (
      message?.email ||
      message?.senderEmail ||
      ""
    );
  };

  const getMessageText = (message) => {
    return (
      message?.message ||
      message?.content ||
      "No message"
    );
  };

  return (
    <div className="min-w-0 space-y-4 p-4 lg:p-5">

      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Dashboard
          </h1>

          <p className="mt-1 text-xs text-slate-400">
            Manage your portfolio content from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />

          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              to={card.path}
              className="group rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900/80"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <Icon size={20} />
                </div>

                <ArrowUpRight
                  size={17}
                  className="text-slate-600 transition group-hover:text-blue-400"
                />
              </div>

              <div className="mt-3">
                <p className="text-2xl font-bold text-white">
                  {loading ? "—" : card.value}
                </p>

                <p className="mt-0.5 text-sm font-semibold text-slate-300">
                  {card.title}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {card.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid min-w-0 gap-4 xl:grid-cols-3">

        {/* Quick Actions */}
        <div className="min-w-0 xl:col-span-1">
          <div className="rounded-xl border border-slate-800 bg-slate-900">

            <div className="border-b border-slate-800 px-4 py-3">
              <h2 className="text-base font-semibold text-white">
                Quick Actions
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Quickly manage your portfolio
              </p>
            </div>

            <div className="space-y-2 p-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.title}
                    to={action.path}
                    className="group flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3 transition hover:border-blue-500/40 hover:bg-slate-800"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-200">
                        {action.title}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {action.description}
                      </p>
                    </div>

                    <Plus
                      size={16}
                      className="shrink-0 text-slate-600 transition group-hover:text-blue-400"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="min-w-0 xl:col-span-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900">

            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Recent Messages
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Latest messages from your portfolio
                </p>
              </div>

              <Link
                to="/messages"
                className="text-xs font-medium text-blue-400 transition hover:text-blue-300"
              >
                View all
              </Link>
            </div>

            <div className="divide-y divide-slate-800">

              {loading ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="p-7 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-500">
                    <Mail size={18} />
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-300">
                    No messages yet
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Contact messages will appear here.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={
                      message?._id ||
                      message?.id ||
                      index
                    }
                    className="flex gap-3 p-3 transition hover:bg-slate-950/60"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-semibold text-blue-400">
                      {getMessageName(message)
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col justify-between gap-1 sm:flex-row">
                        <p className="truncate text-sm font-semibold text-slate-200">
                          {getMessageName(message)}
                        </p>

                        <span className="text-[11px] text-slate-600">
                          {message?.createdAt
                            ? new Date(
                                message.createdAt
                              ).toLocaleDateString()
                            : ""}
                        </span>
                      </div>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {getMessageEmail(message)}
                      </p>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                        {getMessageText(message)}
                      </p>

                    </div>
                  </div>
                ))
              )}

            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="rounded-xl border border-slate-800 bg-slate-900">

        <div className="border-b border-slate-800 px-4 py-3">
          <h2 className="text-base font-semibold text-white">
            System Status
          </h2>
        </div>

        <div className="grid gap-2 p-3 sm:grid-cols-3">

          {/* API Server */}
          <div className="flex items-center justify-between rounded-lg bg-slate-950 px-3 py-2.5">
            <div>
              <p className="text-xs font-medium text-slate-300">
                API Server
              </p>

              <p className="mt-0.5 text-[11px] text-slate-600">
                Backend API
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Online
            </span>
          </div>

          {/* Database */}
          <div className="flex items-center justify-between rounded-lg bg-slate-950 px-3 py-2.5">
            <div>
              <p className="text-xs font-medium text-slate-300">
                Database
              </p>

              <p className="mt-0.5 text-[11px] text-slate-600">
                MongoDB
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Connected
            </span>
          </div>

          {/* Authentication */}
          <div className="flex items-center justify-between rounded-lg bg-slate-950 px-3 py-2.5">
            <div>
              <p className="text-xs font-medium text-slate-300">
                Authentication
              </p>

              <p className="mt-0.5 text-[11px] text-slate-600">
                JWT Security
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;