import {
  FileText,
  Home,
  LoaderCircle,
  MessageSquareText,
  Network,
  Settings,
  Upload,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../i18n/translations";

const items = [
  { key: "navDashboard", path: "/",               icon: Home },
  { key: "navUpload",    path: "/upload",          icon: Upload },
  { key: "navIndexing",  path: "/indexing/demo",   icon: LoaderCircle },
  { key: "navChat",      path: "/chat",            icon: MessageSquareText },
  { key: "navViewer",    path: "/viewer",          icon: FileText },
  { key: "navGraph",     path: "/graph",           icon: Network },
  { key: "navSettings",  path: "/settings",        icon: Settings },
] as const;

export const SidebarNav = () => {
  const { language } = useLanguage();
  const text = translations[language];
  const location = useLocation();

  const addRipple = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    const ripple = document.createElement("span");
    const rect = el.getBoundingClientRect();
    ripple.className = "ripple";
    ripple.style.left = `${e.clientX - rect.left - 5}px`;
    ripple.style.top = `${e.clientY - rect.top - 5}px`;
    el.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  };

  return (
    <aside className="left-sidebar" data-testid="main-left-sidebar">
      <div className="brand-block" data-testid="app-brand-block">
        <p className="brand-title" data-testid="brand-title">SMOT</p>
        <p className="brand-subtitle" data-testid="brand-subtitle">Smart Offline Archive</p>
      </div>
      <nav className="nav-stack" data-testid="main-navigation">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname === item.path ||
                location.pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.key}
              to={item.path}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={addRipple}
              data-testid={`nav-link-${item.key.toLowerCase()}`}
            >
              <Icon size={17} />
              <span data-testid={`nav-label-${item.key.toLowerCase()}`}>
                {text[item.key]}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
