import * as React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@hooks/useAuth";

import { useAlert } from "@context/AlertContext";
import { Badge, Avatar } from "@heroui/react";
import styles from "./ProfileBadge.module.css";

export interface ProfileBadgeProps {
  name: string;
  image: string;
  className?: string;
  badgeContent?: string;
  badgeColor?: "primary" | "success" | "warning" | "danger";
  avatarUrl?: string;
  connexionLogo?: string;
  avatarRadius?: "none" | "sm" | "md" | "lg" | "full";
  isConnected?: boolean;
  showName?: boolean;
}

function ProfileBadge_(props: ProfileBadgeProps, ref: React.Ref<HTMLDivElement>) {
  const {
    className,
    name,
    image,
    badgeContent = "1",
    badgeColor = "danger",
    avatarUrl = "https://i.pravatar.cc/150",
    connexionLogo = "",
    avatarRadius = "full",
    isConnected = false,
    showName = false,
  } = props;

  const { logout } = useAuth();

  const [isModalVisible, setModalVisible] = useState(false);
  const profileBadgeRef = useRef<HTMLDivElement | null>(null);

  const toggleModal = () => {
    setModalVisible((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      profileBadgeRef.current &&
      !profileBadgeRef.current.contains(event.target as Node)
    ) {
      setModalVisible(false);
    }
  };


  const { addAlert } = useAlert();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      addAlert("success", "Déconnexion réussie.");
      navigate("/");
    } catch (error) {
      addAlert("error", "Impossible de se déconnecter. Veuillez réessayer.");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const publicImages = import.meta.env.VITE_BACKEND_URL || "https://api.argostack.argoweb.fr"
  const profileImage = publicImages + "/profiles/" + image;

  return (
    <div
      className={`${styles.profileBadge} ${className}`}
      ref={(node) => {
        profileBadgeRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      onClick={toggleModal}
    >
      {isConnected && (
        <Badge color={badgeColor} content={badgeContent} shape="circle">
          <Avatar isBordered radius={avatarRadius} src={image ? profileImage :  avatarUrl} />
        </Badge>
      )}
      {!isConnected && (
        <Link to="/login">
          <Avatar isBordered radius={avatarRadius} src={connexionLogo} />
        </Link>
      )}

      {showName && isConnected && <div className={styles.text}>{name}</div>}

      {isModalVisible && (
        <>
          <div className={styles.modal}>
            <ul>
              <li><Link to="/dashboard/account-parameters" className={styles.lien}>Paramètres</Link></li>
              <li><Link to="#" onClick={handleLogout} className={styles.lien}>Déconnexion</Link></li>
            </ul>
          </div>
          <div className={styles.bulle1}></div>
          <div className={styles.bulle2}></div>
        </>
      )}
    </div>
  );
}

const ProfileBadge = React.forwardRef(ProfileBadge_);
export default ProfileBadge;
