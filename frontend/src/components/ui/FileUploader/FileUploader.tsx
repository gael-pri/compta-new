import React, { useRef, useState } from "react";
import { cn } from "@lib/utils";
import styles from "./FileUploader.module.css";
import { presets } from "@styles/presets";
import { FaTimes } from "react-icons/fa";
import { FaFilePdf, FaFileWord, FaFileExcel, FaFileAlt, FaFileArchive, FaFileImage, FaFileVideo, FaFileAudio, FaFile } from "react-icons/fa";
import { useAlert } from "@context/AlertContext";

interface FileUploaderProps {
  action?: "upload" | "delete" | "manage";
  state?: "default" | "hover" | "uploading" | "failed" | "complete" | "disabled";
  onFileSelect?: (file: File[]) => void;
  accept?: string;
  maxSize?: number;
  bucketName?: string;
  userId?: string;
  table1Name?: string;
  Table2Name?: string;
  client_id?: string;
  operation_id?: string;
  item_id?: string;
  uuid_timestamp?: string;
  maxFiles?: number;
}

const FileUploader = ({
  action = "upload",
  state = "default",
  onFileSelect,
  accept = "*/*",
  maxSize = 26214400,
  bucketName = "",
  userId = "",
  table1Name = "",
  Table2Name = "",
  client_id = "",
  operation_id = "",
  maxFiles = 15,
  item_id = "",
  uuid_timestamp = "",
}: FileUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [deleteState, setDeleteState] = useState<"idle" | "deleting" | "success" | "error">("idle");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const { addAlert } = useAlert();

  const inputRef = useRef<HTMLInputElement>(null);

  const [bucketFiles, setBucketFiles] = useState<any[]>([]);
  const [selectedToDelete, setSelectedToDelete] = useState<Set<string>>(new Set());
  const [loadingFiles, setLoadingFiles] = useState(false);

  const allSelected = bucketFiles.length > 0 && bucketFiles.every(file => selectedToDelete.has(file.name));
  const someSelected = bucketFiles.some(file => selectedToDelete.has(file.name));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedToDelete(new Set());
    } else {
      setSelectedToDelete(new Set(bucketFiles.map(file => file.name)));
    }
  };

  const fetchFiles = async () => {
    setLoadingFiles(true);
    setSelectedToDelete(new Set());
    try {
      // Si userId est vide, on utilise 'signalement' pour le GET
      const userIdForFetch = userId && userId !== '' ? userId : 'signalement';
      // Le bucket est toujours 'images', bucketName est le sous-dossier
      const res = await fetch(`/api/supabase/buckets?bucketName=${bucketName}&userId=${userIdForFetch}`);
      const data = await res.json();
      setBucketFiles(data.files || []);
    } catch (e) {
      setBucketFiles([]);
    }
    setLoadingFiles(false);
  };

  React.useEffect(() => {
    if (action === "manage") {
      fetchFiles();
    }
    // eslint-disable-next-line
  }, [action, bucketName, userId]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const handleFiles = (files: File[]) => {
    let newFiles = files.filter(
      (file) => file.size <= maxSize && !selectedFiles.some((f) => f.name === file.name)
    );
    if (selectedFiles.length + newFiles.length > maxFiles) {
      alert(`Vous pouvez sélectionner au maximum ${maxFiles} fichiers.`);
      newFiles = newFiles.slice(0, maxFiles - selectedFiles.length);
    }
    if (newFiles.length === 0) return;
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [
      ...prev,
      ...newFiles.map((file) => file.type.startsWith("image/") ? URL.createObjectURL(file) : "")
    ]);
    onFileSelect?.([...selectedFiles, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    onFileSelect?.(selectedFiles.filter((_, i) => i !== index));
  };

  const abortUpload = async () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    setUploadState("idle");
  };

  const uploadToSupabase = async () => {
    if (selectedFiles.length === 0) return;
    setUploadState("uploading");
    try {


  const formData = new FormData();
  selectedFiles.forEach((file) => formData.append("files", file));
  // Le bucket est toujours 'images', bucketName est le sous-dossier
  formData.append("bucketName", bucketName);
  formData.append("userId", userId);
  formData.append("table1Name", table1Name);
  formData.append("Table2Name", Table2Name);
  formData.append("client_id", client_id);
  formData.append("operation_id", operation_id);
  formData.append("item_id", item_id);
  if (uuid_timestamp) {
    formData.append("uuid_timestamp", uuid_timestamp);
  }

      const res = await fetch("/api/supabase/buckets", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Upload failed", errorData.error);
        setUploadState("error");
        addAlert("error", "Échec de l'envoi");
        return;
      }
      setUploadState("success");
      addAlert("success", "Fichiers envoyés avec succès");
      setSelectedFiles([]);
      setPreviewUrls([]);
      
      if (action === "manage") {
        fetchFiles();
      }
    } catch (error) {
      console.error("Upload error", error);
      setUploadState("error");
    }
  };

  const getStateClass = () => {
    if (state === "disabled") return styles["state-disabled"];
    if (state === "uploading") return styles["state-uploading"];
    if (state === "complete") return styles["state-complete"];
    if (state === "failed") return styles["state-failed"];
    if (dragActive) return styles["state-drag"];
    return styles["state-default"];
  };

  const toggleSelect = (filePath: string) => {
    setSelectedToDelete((prev) => {
      const copy = new Set(prev);
      if (copy.has(filePath)) copy.delete(filePath);
      else copy.add(filePath);
      return copy;
    });
  };

  const deleteSelectedFiles = async () => {
    if (selectedToDelete.size === 0) return;
    setDeleteState("deleting");
    try {
      // Le bucket est toujours 'images', bucketName est le sous-dossier
      const res = await fetch("/api/supabase/buckets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          bucketName,
          table1Name,
          Table2Name,
          userId,
          files: Array.from(selectedToDelete),
          item_id,
        }),
      });
      if (!res.ok) {
        setDeleteState("error");
        addAlert("error", "Échec de la suppression");
        return;
      }
      setDeleteState("success");
      addAlert("success", "Suppression réussie");
      fetchFiles();
    } catch (e) {
      setDeleteState("error");
    }
    setSelectedToDelete(new Set());
  };

  // const addAlert = (alert: Omit<AlertMessage, "id">) => {
  //   setAlerts((prev) => [
  //     ...prev,
  //     { ...alert, id: Math.random().toString(36).slice(2) },
  //   ]);
  // };

  const getFileIcon = (file: { type?: string; name: string }) => {
    const type = file.type || "";
    const ext = file.name.split(".").pop()?.toLowerCase() || "";

    if (type.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return <FaFileImage color="#60a5fa" size={32} />;
    if (type.startsWith("video/") || ["mp4", "mov", "avi", "webm"].includes(ext)) return <FaFileVideo color="#f59e42" size={32} />;
    if (type.startsWith("audio/") || ["mp3", "wav", "ogg"].includes(ext)) return <FaFileAudio color="#a78bfa" size={32} />;
    if (type === "application/pdf" || ext === "pdf") return <FaFilePdf color="#ef4444" size={32} />;
    if (
      type === "application/msword" ||
      type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ["doc", "docx"].includes(ext)
    ) return <FaFileWord color="#2563eb" size={32} />;
    if (
      type === "application/vnd.ms-excel" ||
      type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      ["xls", "xlsx"].includes(ext)
    ) return <FaFileExcel color="#22c55e" size={32} />;
    if (
      type === "application/zip" ||
      type === "application/x-7z-compressed" ||
      type === "application/x-rar-compressed" ||
      ["zip", "rar", "7z"].includes(ext)
    ) return <FaFileArchive color="#fbbf24" size={32} />;
    if (type.startsWith("text/") || ["txt", "md", "csv"].includes(ext)) return <FaFileAlt color="#64748b" size={32} />;
    return <FaFile color="#6b7280" size={32} />;
  };

  return (
    <div className={styles.bgWrapper}>
      {(action === "upload" || action === "manage") && (
        <>
          {/* Nouvelle zone de drop stylée */}
          {selectedFiles.length < maxFiles && (
            <div
              className={styles.dropZone}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              tabIndex={0}
              style={{ outline: "none" }}
              onKeyDown={e => {
                if (e.key === " " || e.key === "Enter") inputRef.current?.click();
              }}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={handleChange}
                accept={accept}
                disabled={state === "disabled"}
                multiple
                tabIndex={-1}
                style={{ display: "none" }}
              />
              <div className="text-center" style={{ width: "100%", height: "100%", cursor: "pointer" }}>
                <span style={{ fontWeight: "bold", color: "black" }}>
                  Importer ou déposer des fichiers
                </span>
                <br />
                <span className={styles.description}>
                  {maxFiles} fichiers max
                </span>
              </div>
            </div>
          )}

          {/* Liste des fichiers sélectionnés */}
          {selectedFiles.length > 0 && (
            <div>
              <div className={styles.fileList}>
                {selectedFiles.map((file, idx) => (
                  <div key={file.name} style={{ display: "flex", alignItems: "center", marginBottom: 8, gap: 8 }}>
                    {file.type.startsWith("image/") && previewUrls[idx] ? (
                      <img src={previewUrls[idx]} alt="Aperçu" style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 4, background: '#f3f4f6', display: 'block' }} />
                    ) : (
                      <span style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", borderRadius: 4 }}>
                        {getFileIcon(file)}
                      </span>
                    )}
                    <span style={{ flex: 1, fontSize: 14 }}>{file.name}</span>
                    <span style={{ fontSize: 12, color: "#6b7280", marginRight: 8 }}>
                      {file.size < 1024 * 1024
                        ? `${(file.size / 1024).toFixed(2)} Ko`
                        : `${(file.size / 1024 / 1024).toFixed(2)} Mo`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                      aria-label="Supprimer"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
              {/* Boutons pour tous les fichiers */}
              <div className={styles.actions}>
                <button
                  style={presets.buttons.secondary}
                  className={styles.sendAction}
                  onClick={uploadToSupabase}
                  disabled={uploadState === "uploading"}
                >
                  {uploadState === "uploading" ? "Envoi en cours..." : "Envoyer"}
                </button>
                <button
                  type="button"
                  onClick={abortUpload}
                  disabled={state === "disabled"}
                  style={presets.buttons.secondary}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {(action === "manage" && bucketFiles.length !== 0) && (
        <div className={styles.separator}></div>
      )}

      {(action === "delete" || action === "manage") && (
        <>
          {/* Si action === 'manage' et aucun fichier, ne rien afficher */}
          {!(action === "manage" && bucketFiles.length === 0) && (
            <div>
              <h3 className={styles.deleteTitle}>Mes fichiers</h3>
              {loadingFiles ? (
                <div>Chargement...</div>
              ) : (
                <div className={styles.deleteFileList}>
                  {bucketFiles.length === 0 && <div>Aucun fichier</div>}
                  {bucketFiles.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 8,
                        gap: 8,
                        cursor: "pointer",
                        fontWeight: 500,
                        userSelect: "none"
                      }}
                      onClick={toggleSelectAll}
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === " " || e.key === "Enter") toggleSelectAll();
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={el => {
                          if (el) el.indeterminate = !allSelected && someSelected;
                        }}
                        onChange={toggleSelectAll}
                        onClick={e => e.stopPropagation()}
                        style={{ marginRight: 8 }}
                      />
                      Tout sélectionner
                    </div>
                  )}
                  {bucketFiles.map((file) => (
                    <div
                      key={file.name}
                      style={{ display: "flex", alignItems: "center", marginBottom: 8, gap: 8, cursor: "pointer" }}
                      onClick={() => toggleSelect(file.name)}
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === " " || e.key === "Enter") toggleSelect(file.name);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedToDelete.has(file.name)}
                        onChange={() => toggleSelect(file.name)}
                        onClick={e => e.stopPropagation()}
                      />
                      {file.previewUrl && file.previewUrl !== "" ? (
                        <img src={file.previewUrl} alt="Aperçu" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                      ) : (
                        <span style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", borderRadius: 4 }}>
                          {getFileIcon({ type: file.type, name: file.name })}
                        </span>
                      )}
                      <span style={{ flex: 1, fontSize: 14 }}>{file.name}</span>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>
                        {file.size < 1024 * 1024
                          ? `${(file.size / 1024).toFixed(2)} Ko`
                          : `${(file.size / 1024 / 1024).toFixed(2)} Mo`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {bucketFiles.length > 0 && (
                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={deleteSelectedFiles}
                    disabled={selectedToDelete.size === 0 || deleteState === "deleting"}
                    style={presets.buttons.secondary}
                    className={styles.sendAction}
                  >
                    {deleteState === "deleting" ? "Suppression..." : "Supprimer la sélection"}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FileUploader;
