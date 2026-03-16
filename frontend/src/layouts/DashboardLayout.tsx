import { ReactNode, useState } from "react";
import { useLocation } from "react-router-dom";
import LeftMenu from "./molecules/LeftMenu/LeftMenu";
import { User } from "@/core/types/user";
import { Menu, X } from "lucide-react";

import styles from "@modules/DashboardLayout.module.css";

interface Props {
  children?: ReactNode;
  user: User;
}

const PAGE_INFO: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Budget mensuel", subtitle: "Suivi des revenus et depenses" },
  "/dashboard/annuel": { title: "Vue annuelle", subtitle: "Totaux par organisme" },
  "/dashboard/parameters": { title: "Parametres", subtitle: "Configurer l'application" },
};

export default function DashboardLayout({ children, user }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const page = PAGE_INFO[location.pathname] || PAGE_INFO["/dashboard"];

  return (
    <div className={styles.container}>
      <LeftMenu user={user} />

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className={styles.overlay} onClick={() => setMobileMenuOpen(false)}>
          <div className={`${styles.mobileMenu} mobileMenuWrapper`} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setMobileMenuOpen(false)}>
              <X size={24} />
            </button>
            <LeftMenu user={user} onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className={styles.content}>
        {/* Mobile header bar */}
        <div className={styles.mobileHeader}>
          <button className={styles.hamburger} onClick={() => setMobileMenuOpen(true)}>
            <Menu size={22} />
          </button>
          <div>
            <div className={styles.mobileTitle}>{page.title}</div>
            <div className={styles.mobileSubtitle}>{page.subtitle}</div>
          </div>
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
}
