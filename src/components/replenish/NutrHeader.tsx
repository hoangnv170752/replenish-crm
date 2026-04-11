import { Link, matchPath, useLocation } from "react-router";
import { RefreshButton } from "@/components/admin/refresh-button";
import { ThemeModeToggle } from "@/components/admin/theme-mode-toggle";
import { UserMenu } from "@/components/admin/user-menu";

import { useConfigurationContext } from "@/components/atomic-crm/root/ConfigurationContext";

const tabs: { path: string; label: string }[] = [
  { path: "/", label: "Dashboard" },
  { path: "/customers", label: "Customers" },
  { path: "/support_sessions", label: "Support" },
  { path: "/subscriptions", label: "Subscriptions" },
  { path: "/payments", label: "Payments" },
  { path: "/subscription_plans", label: "Plans" },
  { path: "/scans", label: "Scans" },
  { path: "/reviews", label: "Reviews" },
];

export const NutrHeader = () => {
  const { title } = useConfigurationContext();
  const location = useLocation();

  return (
    <nav className="grow">
      <header className="bg-secondary">
        <div className="px-4">
          <div className="flex justify-between items-center flex-1">
            <Link
              to="/"
              className="flex items-center text-secondary-foreground no-underline shrink-0"
            >
              <h1 className="text-xl font-semibold">{title}</h1>
            </Link>
            <div className="min-w-0 overflow-x-auto">
              <nav className="flex">
                {tabs.map(({ path, label }) => {
                  const isActive =
                    path === "/"
                      ? !!matchPath({ path: "/", end: true }, location.pathname)
                      : !!matchPath(
                          { path: `${path}/*`, end: false },
                          location.pathname,
                        );
                  return (
                    <NavigationTab
                      key={path}
                      label={label}
                      to={path}
                      isActive={isActive}
                    />
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center shrink-0">
              <ThemeModeToggle />
              <RefreshButton />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>
    </nav>
  );
};

const NavigationTab = ({
  label,
  to,
  isActive,
}: {
  label: string;
  to: string;
  isActive: boolean;
}) => (
  <Link
    to={to}
    className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
      isActive
        ? "text-secondary-foreground border-secondary-foreground"
        : "text-secondary-foreground/70 border-transparent hover:text-secondary-foreground/80"
    }`}
  >
    {label}
  </Link>
);
