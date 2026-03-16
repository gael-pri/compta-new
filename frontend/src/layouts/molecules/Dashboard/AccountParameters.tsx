import { useState } from "react";
import { User } from "@/core/types/user";
import { backend } from "@/core/backend";
import { FiEye, FiEdit, FiTrash } from "react-icons/fi";

import AccountParameters from "@components/authentication/AccountParameters/AccountParameters";
import UserCrud from "@components/authentication/UserCrud/UserCrud";
import { useGetAllUsers } from "@hooks/useUsers";

import { presets } from "@styles/presets";
import styles from "@modules/DashboardLayout.module.css";

export default function AccountParameter({ user }: { user: User }) {

    const [reload, setReload] = useState(false);
    const { users } = useGetAllUsers(reload); // Ajout de reload comme dépendance

    const [currentMenu, setCurrentMenu] = useState("profil");
    const [action, setAction] = useState<"read" | "create" | "update" | "delete" | "reset" | "none">("read");
    const [isOpen, setIsOpen] = useState(false);
    const [userId, setUserId] = useState('');

    const [firstnameToUpdate, setFirstnameToUpdate] = useState('');
    const [lastnameToUpdate, setLastnameToUpdate] = useState('');
    const [usernameToUpdate, setUsernameToUpdate] = useState('');
    const [emailToUpdate, setEmailToUpdate] = useState('');
    const [roleToUpdate, setRoleToUpdate] = useState('');
    
    return (
        <div className={styles.main}>
            <h1>Paramètres</h1>

            <div className={styles.onglets}>
                <div 
                    className={styles.ongletElement} 
                    onClick={() => setCurrentMenu("profil")}
                    style={{ fontWeight: currentMenu === "profil" ? "bold" : "normal" }}
                >
                    <p>Mon profil</p>
                </div>
                <div 
                    className={styles.ongletElement} 
                    onClick={() => setCurrentMenu("admin")}
                    style={{ fontWeight: currentMenu === "admin" ? "bold" : "normal" }}
                >
                    <p>Admin profiles</p>
                </div>
            </div>
            <section className={styles.features}>
                {currentMenu === "profil" && (
                    <AccountParameters
                        user={{
                            id: String(user.id),
                            firstName: user.firstName ?? "",
                            lastName: user.lastName ?? "",
                            username: user.username ?? "",
                            email: user.email,
                            role: user.role ?? "",
                            image: user.image ?? ""
                        }}
                    />
                )}
                {currentMenu === "admin" && (
                    <div className={styles.adminProfils}>
                        <div className={styles.buttonDiv}>
                            <div className={styles.buttonItemDiv}>
                                <button onClick={() => { setAction("create"); setIsOpen(true); }} style={presets.buttons.primary as React.CSSProperties}>Nouvel utilisateur</button>
                            </div>
                        </div>

                        <div className={styles.table}>
                            <div className={styles.tableHeader}>
                                <div className={styles.rowlastName}>Nom</div>
                                <div className={styles.rowfirstName}>Prénom</div>
                                <div className={styles.rowuserName}>Nom d'utilisateur</div>
                                <div className={styles.rowEmail}>Email</div>
                                <div className={styles.rowActions}>Actions</div>
                            </div>

                            <div className={styles.tableContent}>
                                {users.map((u) => (
                                    <div key={u.id} className={styles.rowContent}>
                                        <div className={styles.rowlastName}>{u.lastName}</div>
                                        <div className={styles.rowfirstName}>{u.firstName}</div>
                                        <div className={styles.rowEmail}>{u.username}</div>
                                        <div className={styles.rowuserName}>{u.email}</div>
                                        <div className={styles.rowActions}>
                                            <button className={styles.rowButton} onClick={() => { 
                                                setAction("read"); 
                                                setIsOpen(true); 
                                                setUserId(String(u.id));
                                                setFirstnameToUpdate(u.firstName || '');
                                                setLastnameToUpdate(u.lastName || '');
                                                setUsernameToUpdate(u.username || '');
                                                setEmailToUpdate(u.email);
                                                setRoleToUpdate(u.role || '');
                                            }}>
                                                <FiEye />
                                            </button>
                                            <button className={styles.rowButton} onClick={() => { 
                                                setAction("update"); 
                                                setIsOpen(true); 
                                                setUserId(String(u.id));
                                                setFirstnameToUpdate(u.firstName || '');
                                                setLastnameToUpdate(u.lastName || '');
                                                setUsernameToUpdate(u.username || '');
                                                setEmailToUpdate(u.email);
                                                setRoleToUpdate(u.role || '');
                                            }}>
                                                <FiEdit />
                                            </button>
                                            <button className={styles.rowButton} onClick={() => { setAction("delete"); setIsOpen(true); setUserId(String(u.id)); setEmailToUpdate(u.email);}}>
                                                <FiTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                
                            </div>
                        </div>
                        <UserCrud
                            userService={backend.user}
                            action={action}
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                            userId={userId}
                            firstnameToUpdate={firstnameToUpdate}
                            lastnameToUpdate={lastnameToUpdate}
                            usernameToUpdate={usernameToUpdate}
                            emailToUpdate={emailToUpdate}
                            roleToUpdate={roleToUpdate}
                            onSuccess={() => setReload(!reload)}
                        />
                    </div>
                    
                )}
            </section>
        </div>
    );
}