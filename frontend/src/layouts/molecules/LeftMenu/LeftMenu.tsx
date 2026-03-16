import { Link, useLocation } from "react-router-dom";
import { User } from "@/core/types/user";
import { LayoutDashboard, CalendarDays, Settings, LogOut } from "lucide-react";
import { useAuth } from "@hooks/useAuth";
import { STORAGE_KEY } from "@lib/directusClient";

import styles from "@modules/LeftMenu.module.css";

export default function LeftMenu({ user, onNavigate }: { user: User; onNavigate?: () => void }) {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const getInitials = () => {
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <div className={styles.sidebar}>
      <div>
        <div className={styles.logo} onClick={() => (window.location.href = "/dashboard")}>
          <div className={styles.logoIcon}>C</div>
          <span className={styles.logoText}>Compta</span>
        </div>

        <nav className={styles.nav}>
          <p className={styles.sectionLabel}>Budget</p>
          <ul>
            <li className={styles.navItem}>
              <Link to="/dashboard" className={isActive("/dashboard") ? styles.active : undefined} onClick={onNavigate}>
                <LayoutDashboard className={styles.navIcon} />
                Mensuel
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/dashboard/annuel" className={isActive("/dashboard/annuel") ? styles.active : undefined} onClick={onNavigate}>
                <CalendarDays className={styles.navIcon} />
                Annuel
              </Link>
            </li>
          </ul>

          <p className={styles.sectionLabel}>Compte</p>
          <ul>
            <li className={styles.navItem}>
              <Link to="/dashboard/parameters" className={isActive("/dashboard/parameters") ? styles.active : undefined} onClick={onNavigate}>
                <Settings className={styles.navIcon} />
                Parametres
              </Link>
            </li>
            <li className={styles.navItem}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
              >
                <LogOut className={styles.navIcon} />
                Deconnexion
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className={styles.userSection}>
        <div className={styles.userBadge}>
          {user.image ? (
            <img
              src={(() => {
                const directusUrl = import.meta.env.VITE_DIRECTUS_URL || "http://localhost:60005";
                const auth = localStorage.getItem(STORAGE_KEY);
                const token = auth ? JSON.parse(auth)?.access_token : "";
                return `${directusUrl}/assets/${user.image}?access_token=${token}&width=72&height=72&fit=cover`;
              })()}
              className={styles.userAvatar}
              style={{ objectFit: "cover" }}
              alt=""
            />
          ) : (
            <div className={styles.userAvatar}>{getInitials()}</div>
          )}
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {user.firstName} {user.lastName}
            </span>
            <span className={styles.userEmail}>{user.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
