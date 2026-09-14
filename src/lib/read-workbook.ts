import { buildWorkbookFromArrays } from "./workbook";

export async function readWorkbook(
  buffer: ArrayBuffer,
  fileName: string,
  formatted: boolean,
) {
  const XLSX = await import("xlsx");
  const data = XLSX.read(buffer, { type: "array", cellDates: false });
  return buildWorkbookFromArrays(
    fileName,
    data.SheetNames.map((name) => ({
      name,
      rows: XLSX.utils.sheet_to_json(data.Sheets[name], {
        header: 1,
        raw: !formatted,
        defval: "",
        blankrows: true,
      }) as unknown[][],
    })),
  );
}
