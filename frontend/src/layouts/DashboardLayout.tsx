import { ReactNode } from "react";
import LeftMenu from "./molecules/LeftMenu/LeftMenu";
import { User } from "@/core/types/user";

import styles from "@modules/DashboardLayout.module.css";

interface Props {
  children?: ReactNode;
  user: User;
}

export default function DashboardLayout({ children, user }: Props) {
  return (
    <div className={styles.container}>
      <LeftMenu user={user} />
      <div className={styles.content}>
        <main>{children}</main>
      </div>
    </div>
  );
}
