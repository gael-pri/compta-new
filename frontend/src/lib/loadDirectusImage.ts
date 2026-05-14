import { STORAGE_KEY } from "@lib/directusClient";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const directusUrl = import.meta.env.VITE_DIRECTUS_URL || "http://localhost:60005";

export function getDirectusAssetUrl(fileId: string, params?: string): string {
  const auth = localStorage.getItem(STORAGE_KEY);
  const token = auth ? JSON.parse(auth)?.access_token : "";
  return `${directusUrl}/assets/${fileId}?access_token=${token}${params ? `&${params}` : ""}`;
}

export async function loadImageAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Convert a PDF data URL to an array of page image data URLs */
export async function pdfToImages(dataUrl: string, scale = 2): Promise<string[]> {
  const raw = atob(dataUrl.split(",")[1]);
  const uint8 = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) uint8[i] = raw.charCodeAt(i);

  const pdf = await pdfjsLib.getDocument({ data: uint8 }).promise;
  const images: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    images.push(canvas.toDataURL("image/jpeg", 0.85));
  }

  return images;
}
