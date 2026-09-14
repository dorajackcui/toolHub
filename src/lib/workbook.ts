export interface ExcelColumnOption {
  index: number;
  key: string;
  label: string;
}

export interface ExcelSheetData {
  name: string;
  columns: ExcelColumnOption[];
  rows: string[][];
}

export interface ParsedWorkbook {
  fileName: string;
  sheets: ExcelSheetData[];
}

interface RawSheetData {
  name: string;
  rows: unknown[][];
}

const toCellText = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }

  return typeof value === "string" ? value : String(value);
};

export const getColumnLetter = (index: number) => {
  let current = index + 1;
  let label = "";

  while (current > 0) {
    const remainder = (current - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    current = Math.floor((current - 1) / 26);
  }

  return label;
};

export const buildWorkbookFromArrays = (
  fileName: string,
  sheets: RawSheetData[],
): ParsedWorkbook => {
  const parsedSheets = sheets
    .map(({ name, rows }) => {
      const normalizedRows = rows.map((row) => row.map(toCellText));
      const maxColumnCount = normalizedRows.reduce(
        (max, row) => Math.max(max, row.length),
        0,
      );
      const headerRow = normalizedRows[0] || [];

      const columns = Array.from({ length: maxColumnCount }, (_, index) => {
        const columnLetter = getColumnLetter(index);
        const header = (headerRow[index] || "").trim();

        return {
          index,
          key: `${name}-${index}`,
          label: header
            ? `${columnLetter} · ${header}`
            : `Column ${columnLetter}`,
        };
      });

      return {
        name,
        columns,
        rows: normalizedRows,
      };
    })
    .filter((sheet) => sheet.columns.length > 0);

  return {
    fileName,
    sheets: parsedSheets,
  };
};

export const buildComparisonTexts = (
  sheet: ExcelSheetData,
  leftColumnIndex: number,
  rightColumnIndex: number,
  useHeaderRow: boolean,
) => {
  const dataRows = sheet.rows.slice(useHeaderRow ? 1 : 0);

  let lastRelevantRow = dataRows.length - 1;
  while (lastRelevantRow >= 0) {
    const leftValue = dataRows[lastRelevantRow]?.[leftColumnIndex] || "";
    const rightValue = dataRows[lastRelevantRow]?.[rightColumnIndex] || "";

    if (leftValue || rightValue) {
      break;
    }

    lastRelevantRow -= 1;
  }

  const comparableRows = dataRows.slice(0, lastRelevantRow + 1);

  return {
    leftText: comparableRows
      .map((row) => row[leftColumnIndex] || "")
      .join("\n"),
    rightText: comparableRows
      .map((row) => row[rightColumnIndex] || "")
      .join("\n"),
    rowCount: comparableRows.length,
  };
};
