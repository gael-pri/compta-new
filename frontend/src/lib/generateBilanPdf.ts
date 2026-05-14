import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BudgetProEntry, BudgetProType } from "@/core/types/budget-pro";

/* ─── Constants ─── */

const TYPE_LABELS: Record<BudgetProType, string> = {
  recette: "Recette",
  depense: "Depense",
  dividendes: "Dividendes",
  impots: "Impots",
};

const TYPE_COLORS: Record<BudgetProType, { r: number; g: number; b: number }> = {
  recette: { r: 34, g: 197, b: 94 },    // #22c55e
  depense: { r: 239, g: 68, b: 68 },    // #ef4444
  dividendes: { r: 245, g: 158, b: 11 }, // #f59e0b
  impots: { r: 139, g: 92, b: 246 },    // #8b5cf6
};

const TYPE_BG: Record<BudgetProType, { r: number; g: number; b: number }> = {
  recette: { r: 240, g: 253, b: 244 },
  depense: { r: 254, g: 242, b: 242 },
  dividendes: { r: 255, g: 251, b: 235 },
  impots: { r: 245, g: 243, b: 255 },
};

const moisLabels = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

const FISCAL_MONTHS = [11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const MARGIN = 14;
const RADIUS = 3;

/* ─── Types ─── */

interface Attachment {
  dataUrl: string;
  organisme: string;
  note: string;
  date: string;
}

interface PdfOptions {
  annee: number;
  entries: BudgetProEntry[];
  tvaCumul: number;
  logoDataUrl: string;
  attachments: Attachment[];
}

interface AggregatedRow {
  type: BudgetProType;
  organisme: string;
  montant_ht: number;
  tva_total: number;
  montant_ttc: number;
  count: number;
  moisCount: number;
}

/* ─── Helpers ─── */

const fmt = (n: number) => {
  return Math.round(n).toLocaleString("fr-FR").replace(/\u202F|\u00A0/g, " ");
};

function hexToRgb(r: number, g: number, b: number): [number, number, number] {
  return [r, g, b];
}

function getY(doc: jsPDF): number {
  return (doc as any).lastAutoTable?.finalY ?? MARGIN;
}

function ensureSpace(doc: jsPDF, needed: number, currentY: number): number {
  if (currentY + needed > doc.internal.pageSize.getHeight() - MARGIN) {
    doc.addPage();
    return MARGIN + 5;
  }
  return currentY;
}

/** Draw a rounded rectangle card outline */
function drawCard(doc: jsPDF, x: number, y: number, w: number, h: number, borderColor?: { r: number; g: number; b: number }) {
  doc.setDrawColor(borderColor?.r ?? 228, borderColor?.g ?? 228, borderColor?.b ?? 228);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, RADIUS, RADIUS, "S");
}

/** Draw a card header bar (rounded top only via clip) */
function drawCardHeader(doc: jsPDF, x: number, y: number, w: number, h: number, color: { r: number; g: number; b: number }) {
  doc.setFillColor(color.r, color.g, color.b);
  // Draw full rounded rect then cover bottom corners with a plain rect
  doc.roundedRect(x, y, w, h + RADIUS, RADIUS, RADIUS, "F");
  // No need - the table body will cover the bottom rounded corners
}

/** Draw a separator line */
function drawSeparator(doc: jsPDF, x: number, y: number, w: number) {
  doc.setDrawColor(228, 228, 228);
  doc.setLineWidth(0.2);
  doc.line(x, y, x + w, y);
}

/* ─── Bilan computation (mirrors BudgetProBilan.tsx) ─── */

function computeBilan(entries: BudgetProEntry[], tvaCumul: number) {
  const recettes = entries.filter((e) => e.type === "recette");
  const depenses = entries.filter((e) => e.type === "depense");
  const dividendesEntries = entries.filter((e) => e.type === "dividendes");
  const impotsEntries = entries.filter((e) => e.type === "impots");

  const totalRecettesHT = recettes.reduce((s, e) => s + e.montant_ht, 0);
  const totalDepensesHT = depenses.reduce((s, e) => s + e.montant_ht, 0);
  const totalDividendes = dividendesEntries.reduce((s, e) => s + e.montant_ht, 0);
  const totalImpotsPaies = impotsEntries.reduce((s, e) => s + e.montant_ht, 0);
  const totalArgentAvance = entries.reduce((s, e) => s + (e.argent_avance || 0), 0);

  const tvaCollectee = recettes.reduce((s, e) => s + (e.montant_ttc - e.montant_ht), 0);
  const tvaDeductible = depenses.reduce((s, e) => s + (e.montant_ttc - e.montant_ht), 0);
  const tvaNetteMois = tvaCollectee - tvaDeductible;
  const tvaAPayer = tvaCumul > 0 ? tvaCumul : 0;
  const tvaReportable = tvaCumul < 0 ? Math.abs(tvaCumul) : 0;

  const resultatFiscal = totalRecettesHT - totalDepensesHT;
  const impots15 = Math.min(Math.max(resultatFiscal, 0), 42500) * 0.15;
  const impots25 = Math.max(resultatFiscal - 42500, 0) * 0.25;
  const totalIS = impots15 + impots25;
  const benefices = resultatFiscal - totalIS;
  const flatTax = totalDividendes * 0.30;
  const equilibre = benefices - tvaNetteMois - totalDividendes;

  return {
    totalRecettesHT, totalDepensesHT, totalDividendes, totalImpotsPaies,
    totalArgentAvance, tvaCollectee, tvaDeductible, tvaNetteMois,
    tvaAPayer, tvaReportable, resultatFiscal, impots15, impots25,
    totalIS, benefices, flatTax, equilibre,
  };
}

/* ─── Aggregation (mirrors BudgetProAnnuel.tsx) ─── */

function aggregate(entries: BudgetProEntry[]): AggregatedRow[] {
  const map = new Map<string, AggregatedRow & { moisSet: Set<number> }>();
  entries.forEach((e) => {
    const key = `${e.type}__${e.organisme}`;
    const existing = map.get(key);
    const tvaAmount = e.montant_ttc - e.montant_ht;
    if (existing) {
      existing.montant_ht += e.montant_ht;
      existing.tva_total += tvaAmount;
      existing.montant_ttc += e.montant_ttc;
      existing.count += 1;
      existing.moisSet.add(e.mois);
    } else {
      map.set(key, {
        type: e.type, organisme: e.organisme,
        montant_ht: e.montant_ht, tva_total: tvaAmount, montant_ttc: e.montant_ttc,
        count: 1, moisSet: new Set([e.mois]), moisCount: 0,
      });
    }
  });
  return Array.from(map.values()).map(({ moisSet, ...row }) => ({
    ...row, moisCount: moisSet.size,
  })).sort((a, b) => b.montant_ht - a.montant_ht);
}

/* ─── Page 1: Cover ─── */

function addCoverPage(doc: jsPDF, annee: number, logoDataUrl: string) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Subtle background
  doc.setFillColor(249, 250, 251);
  doc.rect(0, 0, pageW, pageH, "F");

  // Logo
  try {
    const logoW = 50;
    const logoH = 50;
    doc.addImage(logoDataUrl, "PNG", (pageW - logoW) / 2, pageH * 0.22, logoW, logoH);
  } catch { /* skip */ }

  // Title
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("Bilan Annuel", pageW / 2, pageH * 0.48, { align: "center" });

  // Subtitle in a rounded pill
  const sub = `Nov ${annee}  —  Oct ${annee + 1}`;
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  const subW = doc.getTextWidth(sub) + 16;
  const subX = (pageW - subW) / 2;
  const subY = pageH * 0.54;
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(subX, subY - 5, subW, 10, 5, 5, "F");
  doc.setTextColor(75, 85, 99);
  doc.text(sub, pageW / 2, subY + 1, { align: "center" });

  // Date
  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175);
  doc.text(`Genere le ${new Date().toLocaleDateString("fr-FR")}`, pageW / 2, pageH * 0.62, { align: "center" });
  doc.setTextColor(0, 0, 0);
}

/* ─── Bilan financier (drawn manually with rounded cards) ─── */

function addBilanPage(doc: jsPDF, entries: BudgetProEntry[], tvaCumul: number, title: string, startY?: number): number {
  const bilan = computeBilan(entries, tvaCumul);
  const pageW = doc.internal.pageSize.getWidth();
  const contentW = pageW - MARGIN * 2;

  let y = startY ?? MARGIN + 5;

  // Title
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text(title, MARGIN, y);
  y += 6;

  // Card outline
  const cardH = 72;
  y = ensureSpace(doc, cardH + 10, y);
  drawCard(doc, MARGIN, y, contentW, cardH);

  // Header bar
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(MARGIN, y, contentW, 8, RADIUS, RADIUS, "F");
  // Cover bottom corners of header
  doc.rect(MARGIN, y + 5, contentW, 3, "F");

  const colW = contentW / 2;
  const leftX = MARGIN + 4;
  const rightX = MARGIN + colW + 4;
  const valLeftX = MARGIN + colW - 4;
  const valRightX = MARGIN + contentW - 4;
  const rowH = 5.5;

  // Column headers
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(107, 114, 128);
  doc.text("RESULTAT & IS", leftX, y + 5.5);
  doc.text("TVA & DIVIDENDES", rightX, y + 5.5);

  // Vertical separator
  doc.setDrawColor(228, 228, 228);
  doc.setLineWidth(0.2);
  doc.line(MARGIN + colW, y + 8, MARGIN + colW, y + cardH);

  y += 12;

  // Helper to draw a bilan row
  const drawRow = (x: number, valX: number, label: string, value: string, rowY: number, opts?: { bold?: boolean; color?: [number, number, number] }) => {
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(label, x, rowY);
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    if (opts?.color) doc.setTextColor(...opts.color);
    else doc.setTextColor(31, 41, 55);
    doc.text(value, valX, rowY, { align: "right" });
    doc.setTextColor(31, 41, 55);
  };

  const drawHr = (x: number, hrY: number, w: number) => {
    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.15);
    doc.line(x, hrY, x + w - 8, hrY);
  };

  // Left column
  let ly = y;
  drawRow(leftX, valLeftX, "Total recettes HT", `${fmt(bilan.totalRecettesHT)} €`, ly, { color: [34, 197, 94] });
  ly += rowH;
  drawRow(leftX, valLeftX, "Total depenses HT", `${fmt(bilan.totalDepensesHT)} €`, ly, { color: [239, 68, 68] });
  ly += rowH;
  drawRow(leftX, valLeftX, "Resultat fiscal", `${fmt(bilan.resultatFiscal)} €`, ly, { bold: true });
  ly += rowH - 1;
  drawHr(leftX, ly, colW);
  ly += rowH;
  drawRow(leftX, valLeftX, "IS a 15%", `${fmt(bilan.impots15)} €`, ly, { color: [139, 92, 246] });
  ly += rowH;
  drawRow(leftX, valLeftX, "IS a 25%", `${fmt(bilan.impots25)} €`, ly, { color: [139, 92, 246] });
  ly += rowH;
  drawRow(leftX, valLeftX, "Total IS estime", `${fmt(bilan.totalIS)} €`, ly, { bold: true, color: [139, 92, 246] });
  ly += rowH - 1;
  drawHr(leftX, ly, colW);
  ly += rowH;
  drawRow(leftX, valLeftX, "Benefices apres IS", `${fmt(bilan.benefices)} €`, ly, { bold: true, color: [34, 197, 94] });

  // Right column
  let ry = y;
  drawRow(rightX, valRightX, "TVA collectee", `${fmt(bilan.tvaCollectee)} €`, ry);
  ry += rowH;
  drawRow(rightX, valRightX, "TVA deductible", `-${fmt(bilan.tvaDeductible)} €`, ry);
  ry += rowH;
  drawRow(rightX, valRightX, "TVA nette", `${fmt(bilan.tvaNetteMois)} €`, ry);
  ry += rowH - 1;
  drawHr(rightX, ry, colW);
  ry += rowH;
  const tvaLabel = bilan.tvaAPayer > 0 ? "Solde TVA a payer" : "Solde TVA reportable";
  const tvaColor: [number, number, number] = bilan.tvaAPayer > 0 ? [239, 68, 68] : [59, 130, 246];
  drawRow(rightX, valRightX, tvaLabel, `${fmt(bilan.tvaAPayer > 0 ? bilan.tvaAPayer : bilan.tvaReportable)} €`, ry, { bold: true, color: tvaColor });
  ry += rowH - 1;
  drawHr(rightX, ry, colW);
  ry += rowH;
  drawRow(rightX, valRightX, "Dividendes verses", `${fmt(bilan.totalDividendes)} €`, ry, { color: [245, 158, 11] });
  ry += rowH;
  drawRow(rightX, valRightX, "Flat tax (30%)", `${fmt(bilan.flatTax)} €`, ry, { color: [245, 158, 11] });
  ry += rowH - 1;
  drawHr(rightX, ry, colW);
  ry += rowH;
  drawRow(rightX, valRightX, "Argent avance", `${fmt(bilan.totalArgentAvance)} €`, ry);
  ry += rowH;
  const eqColor: [number, number, number] = bilan.equilibre >= 0 ? [34, 197, 94] : [239, 68, 68];
  drawRow(rightX, valRightX, "Equilibre", `${bilan.equilibre >= 0 ? "+" : ""}${fmt(bilan.equilibre)} €`, ry, { bold: true, color: eqColor });

  return y + cardH + 8;
}

/* ─── Styled table with colored header ─── */

function addStyledTable(
  doc: jsPDF,
  startY: number,
  title: string,
  totalLabel: string,
  color: { r: number; g: number; b: number },
  head: string[],
  body: string[][],
  rightAlignFrom: number,
): number {
  const pageW = doc.internal.pageSize.getWidth();
  const contentW = pageW - MARGIN * 2;

  // Estimate table height: header(10) + title(10) + rows * 8
  const estimatedH = 25 + body.length * 8;
  startY = ensureSpace(doc, estimatedH, startY);

  // Header background (white, rounded top)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(MARGIN, startY, contentW, 10, RADIUS, RADIUS, "F");

  // Accent left bar with rounded top-left corner only
  const barW = 3.5;
  const barR = 3.5;
  doc.setFillColor(color.r, color.g, color.b);
  // Draw a wide rounded rect to get the top-left rounding
  doc.roundedRect(MARGIN, startY, barW + barR, 10, barR, barR, "F");
  // Cover right side (removes top-right & bottom-right rounding)
  doc.setFillColor(255, 255, 255);
  doc.rect(MARGIN + barW, startY, barR + 1, 10, "F");
  // Cover bottom-left rounding
  doc.rect(MARGIN, startY + 10 - barR, barW, barR + 1, "F");
  // Redraw the bar body below the rounded corner
  doc.setFillColor(color.r, color.g, color.b);
  doc.rect(MARGIN, startY + barR, barW, 10 - barR, "F");

  // Title text
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text(title, MARGIN + 8, startY + 6.5);

  // Total on right
  doc.setTextColor(color.r, color.g, color.b);
  doc.text(totalLabel, MARGIN + contentW - 4, startY + 6.5, { align: "right" });
  doc.setTextColor(31, 41, 55);

  // Border bottom of header
  drawSeparator(doc, MARGIN, startY + 10, contentW);

  // Column styles: right-align numeric columns
  const colStyles: Record<number, any> = {};
  for (let i = rightAlignFrom; i < head.length; i++) {
    colStyles[i] = { halign: "right" };
  }

  autoTable(doc, {
    startY: startY + 10,
    margin: { left: MARGIN, right: MARGIN },
    head: [head],
    body,
    theme: "plain",
    styles: {
      fontSize: 8.5,
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
      textColor: [55, 65, 81],
      lineColor: [240, 240, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [249, 250, 251],
      textColor: [107, 114, 128],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: colStyles,
    didDrawPage: () => {
      // Draw card border on each page the table spans
    },
    tableLineColor: [228, 228, 228],
    tableLineWidth: 0.3,
  });

  const finalY = getY(doc);

  // Bottom border of card
  doc.setDrawColor(228, 228, 228);
  doc.setLineWidth(0.3);
  // Draw side and bottom borders
  const tableH = finalY - startY;
  drawCard(doc, MARGIN, startY, contentW, tableH);

  return finalY + 8;
}

/* ─── Monthly bilan (compact) ─── */

function addMonthlyBilan(doc: jsPDF, entries: BudgetProEntry[], startY: number): number {
  const bilan = computeBilan(entries, 0);
  const pageW = doc.internal.pageSize.getWidth();
  const contentW = pageW - MARGIN * 2;
  const cardH = 24;

  startY = ensureSpace(doc, cardH + 5, startY);
  drawCard(doc, MARGIN, startY, contentW, cardH);

  const colW = contentW / 3;
  const rowH = 5;
  let y = startY + 6;

  const drawItem = (x: number, label: string, value: string, color?: [number, number, number]) => {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(label, x, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    if (color) doc.setTextColor(...color);
    else doc.setTextColor(31, 41, 55);
    doc.text(value, x, y + rowH);
    doc.setTextColor(31, 41, 55);
  };

  drawItem(MARGIN + 4, "Recettes HT", `${fmt(bilan.totalRecettesHT)} €`, [34, 197, 94]);
  drawItem(MARGIN + 4 + colW, "Depenses HT", `${fmt(bilan.totalDepensesHT)} €`, [239, 68, 68]);

  const solde = bilan.resultatFiscal;
  drawItem(MARGIN + 4 + colW * 2, "Solde", `${solde >= 0 ? "+" : ""}${fmt(solde)} €`, solde >= 0 ? [34, 197, 94] : [239, 68, 68]);

  // Second row: TVA
  y += rowH * 2 + 2;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(156, 163, 175);
  doc.text(`TVA: collectee ${fmt(bilan.tvaCollectee)} € | deductible ${fmt(bilan.tvaDeductible)} € | nette ${fmt(bilan.tvaNetteMois)} €`, MARGIN + 4, y);
  doc.setTextColor(31, 41, 55);

  return startY + cardH + 5;
}

/* ─── Page assembly ─── */

function addAggregatedTables(doc: jsPDF, entries: BudgetProEntry[], startY: number): number {
  const types: { key: BudgetProType; label: string }[] = [
    { key: "recette", label: "Recettes" },
    { key: "depense", label: "Depenses" },
    { key: "dividendes", label: "Dividendes" },
    { key: "impots", label: "Impots" },
  ];

  let y = startY;

  for (const t of types) {
    const typeEntries = entries.filter((e) => e.type === t.key);
    if (typeEntries.length === 0) continue;

    const rows = aggregate(typeEntries);
    const totalHT = rows.reduce((s, r) => s + r.montant_ht, 0);

    y = addStyledTable(
      doc, y,
      t.label,
      `${fmt(totalHT)} € HT`,
      TYPE_COLORS[t.key],
      ["Type", "Organisme", "Entrees", "HT", "Mensuel HT", "TVA total", "TTC total"],
      rows.map((r) => [
        TYPE_LABELS[r.type],
        r.organisme.charAt(0).toUpperCase() + r.organisme.slice(1),
        r.count.toString(),
        `${fmt(r.montant_ht)} €`,
        `${fmt(Math.round(r.montant_ht / r.moisCount))} €`,
        `${fmt(Math.round(r.tva_total))} €`,
        `${fmt(r.montant_ttc)} €`,
      ]),
      3,
    );
  }
  return y;
}

function addMonthlyPages(doc: jsPDF, entries: BudgetProEntry[], annee: number) {
  const pageW = doc.internal.pageSize.getWidth();

  const types: { key: BudgetProType; label: string }[] = [
    { key: "recette", label: "Recettes" },
    { key: "depense", label: "Depenses" },
    { key: "dividendes", label: "Dividendes" },
    { key: "impots", label: "Impots" },
  ];

  for (const m of FISCAL_MONTHS) {
    const monthEntries = entries.filter((e) => e.mois === m);
    if (monthEntries.length === 0) continue;

    doc.addPage();

    const year = m >= 11 ? annee : annee + 1;

    // Month title with pill background
    const titleText = `${moisLabels[m - 1]} ${year}`;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text(titleText, MARGIN, 18);

    // Underline
    const titleW = doc.getTextWidth(titleText);
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.8);
    doc.line(MARGIN, 20, MARGIN + titleW, 20);

    // Bilan summary card
    let y = addMonthlyBilan(doc, monthEntries, 24);

    // Detail tables by type
    for (const t of types) {
      const typeEntries = monthEntries.filter((e) => e.type === t.key);
      if (typeEntries.length === 0) continue;

      const totalHT = typeEntries.reduce((s, e) => s + e.montant_ht, 0);

      y = addStyledTable(
        doc, y,
        t.label,
        `${fmt(totalHT)} € HT`,
        TYPE_COLORS[t.key],
        ["Type", "Organisme", "Note", "HT", "TVA%", "TTC"],
        typeEntries.map((e) => [
          TYPE_LABELS[e.type],
          e.organisme.charAt(0).toUpperCase() + e.organisme.slice(1),
          e.note || "—",
          `${fmt(e.montant_ht)} €`,
          `${e.tva}%`,
          `${fmt(e.montant_ttc)} €`,
        ]),
        3,
      );
    }
  }
}

function addAttachmentPages(doc: jsPDF, attachments: Attachment[]) {
  if (attachments.length === 0) return;

  // Annexes cover page
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  doc.addPage();
  doc.setFillColor(249, 250, 251);
  doc.rect(0, 0, pageW, pageH, "F");

  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("Annexes", pageW / 2, pageH * 0.42, { align: "center" });

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Factures", pageW / 2, pageH * 0.48, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175);
  doc.text(`${attachments.length} piece${attachments.length > 1 ? "s" : ""} jointe${attachments.length > 1 ? "s" : ""}`, pageW / 2, pageH * 0.53, { align: "center" });
  doc.setTextColor(0, 0, 0);
  const maxW = pageW - MARGIN * 2;
  const maxH = pageH - 60;

  for (const att of attachments) {
    doc.addPage();

    // Caption card
    const captionH = 14;
    drawCard(doc, MARGIN, MARGIN, maxW, captionH);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(MARGIN, MARGIN, maxW, captionH, RADIUS, RADIUS, "F");
    drawCard(doc, MARGIN, MARGIN, maxW, captionH);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text(att.organisme, MARGIN + 5, MARGIN + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    const caption = [att.note, att.date].filter(Boolean).join(" — ");
    if (caption) doc.text(caption, MARGIN + 5, MARGIN + 10.5);
    doc.setTextColor(0, 0, 0);

    try {
      const format = att.dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
      const img = new Image();
      img.src = att.dataUrl;

      let imgW = maxW;
      let imgH = maxH;
      if (img.naturalWidth && img.naturalHeight) {
        const ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
        imgW = img.naturalWidth * ratio;
        imgH = img.naturalHeight * ratio;
      }

      const x = (pageW - imgW) / 2;
      const imgY = MARGIN + captionH + 5;

      // Image border
      drawCard(doc, x - 1, imgY - 1, imgW + 2, imgH + 2);
      doc.addImage(att.dataUrl, format, x, imgY, imgW, imgH);
    } catch {
      doc.setFontSize(10);
      doc.setTextColor(239, 68, 68);
      doc.text("Impossible de charger l'image", MARGIN + 5, MARGIN + captionH + 15);
      doc.setTextColor(0, 0, 0);
    }
  }
}

/* ─── Main export ─── */

export async function generateBilanPdf(options: PdfOptions) {
  const { annee, entries, tvaCumul, logoDataUrl, attachments } = options;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Page 1: Cover
  addCoverPage(doc, annee, logoDataUrl);

  // Page 2+: Bilan financier
  doc.addPage();
  let y = addBilanPage(doc, entries, tvaCumul, "Bilan annuel");

  // Aggregated tables
  y = addAggregatedTables(doc, entries, y);

  // Monthly pages
  addMonthlyPages(doc, entries, annee);

  // Attachments
  addAttachmentPages(doc, attachments);

  doc.save(`bilan-annuel-${annee}-${annee + 1}.pdf`);
}
