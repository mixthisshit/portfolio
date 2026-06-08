import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import {
  ImageRun,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  AlignmentType,
  HeightRule,
  VerticalAlign,
} from "docx";

type PhotoType = "jpg" | "png" | "gif" | "bmp";

const PHOTO_CANDIDATES = ["photo.jpg", "photo.jpeg", "photo.png", "photo.webp"];

const EXT_TO_TYPE: Record<string, PhotoType> = {
  jpg: "jpg",
  jpeg: "jpg",
  png: "png",
  webp: "png", // fallback — docx не знает webp, в Word редко импортируют webp
};

export type Photo = { buffer: Buffer; type: PhotoType };

/**
 * Ищет public/photo.{jpg,jpeg,png,webp}. Возвращает Buffer + тип для ImageRun.
 * Если файла нет — null, тогда шаблон вставит плейсхолдер.
 */
export function loadPhoto(): Photo | null {
  const publicDir = path.join(process.cwd(), "public");
  for (const name of PHOTO_CANDIDATES) {
    const p = path.join(publicDir, name);
    if (existsSync(p)) {
      const ext = name.split(".").pop()!.toLowerCase();
      return { buffer: readFileSync(p), type: EXT_TO_TYPE[ext] ?? "png" };
    }
  }
  return null;
}

/**
 * Параграф с фото (если есть) или с центрированной надписью «Фото».
 * Используется внутри табличной ячейки фиксированного размера в шаблонах.
 */
export function photoParagraph(photo: Photo | null, sizePx: number): Paragraph {
  if (photo) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new ImageRun({
          data: photo.buffer,
          transformation: { width: sizePx, height: sizePx },
          type: photo.type,
        }),
      ],
    });
  }
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "Фото",
        size: 18,
        color: "999999",
        font: "Calibri",
      }),
    ],
  });
}

/**
 * Готовая ячейка нужного размера с фото или плейсхолдером.
 * width/height в pt (1pt = 20 twips).
 */
export function photoCell(
  photo: Photo | null,
  options: { widthPt: number; heightPt?: number; borderColor?: string; fillIfEmpty?: string },
): TableCell {
  const { widthPt, borderColor = "D8D3C8", fillIfEmpty = "F3F1EC" } = options;
  const borderProps = photo
    ? { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }
    : { style: BorderStyle.SINGLE, size: 8, color: borderColor };
  return new TableCell({
    width: { size: widthPt * 20, type: WidthType.DXA },
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    verticalAlign: VerticalAlign.CENTER,
    shading: photo
      ? undefined
      : { type: ShadingType.CLEAR, color: "auto", fill: fillIfEmpty },
    borders: {
      top: borderProps,
      bottom: borderProps,
      left: borderProps,
      right: borderProps,
    },
    children: [photoParagraph(photo, Math.round(widthPt * 1.33))],
  });
}

/**
 * Полностью готовый «островок» фото — таблица 1×1 фиксированного размера.
 * Удобно вставлять рядом с текстом через layout=alongside (через wrap).
 * Возвращает Table (можно положить рядом с параграфами).
 */
export function photoTable(
  photo: Photo | null,
  options: {
    widthPt: number;
    heightPt: number;
    borderColor?: string;
    fillIfEmpty?: string;
  },
): Table {
  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  return new Table({
    width: { size: options.widthPt * 20, type: WidthType.DXA },
    columnWidths: [options.widthPt * 20],
    borders: {
      top: noBorder,
      bottom: noBorder,
      left: noBorder,
      right: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [
      new TableRow({
        height: { value: options.heightPt * 20, rule: HeightRule.EXACT },
        children: [photoCell(photo, options)],
      }),
    ],
  });
}
