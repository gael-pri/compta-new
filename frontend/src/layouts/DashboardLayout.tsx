import { ReactNode, useState } from "react";
import LeftMenu from "./molecules/LeftMenu/LeftMenu";
import { User } from "@/core/types/user";
import { Menu, X } from "lucide-react";

import styles from "@modules/DashboardLayout.module.css";

interface Props {
  children?: ReactNode;
  user: User;
}

export default function DashboardLayout({ children, user }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <span className={styles.mobileLogo}>Compta</span>
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
}
