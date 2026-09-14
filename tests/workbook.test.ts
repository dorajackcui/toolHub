import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import {
  buildComparisonTexts,
  buildWorkbookFromArrays,
  getColumnLetter,
} from "../src/lib/workbook";
import { readWorkbook } from "../src/lib/read-workbook";

describe("spreadsheet import", () => {
  it("uses stable column identities with duplicate/empty headers and sparse rows", () => {
    const { sheets } = buildWorkbookFromArrays("sample.xlsx", [
      {
        name: "Sheet1",
        rows: [
          ["同名", "同名", ""],
          ["A", "B", 0],
          [],
          ["C", "", false],
          ["", "", "tail"],
        ],
      },
    ]);
    expect(new Set(sheets[0].columns.map((column) => column.key)).size).toBe(3);
    expect(sheets[0].columns.map((column) => column.label)).toEqual([
      "A · 同名",
      "B · 同名",
      "Column C",
    ]);
    expect(buildComparisonTexts(sheets[0], 0, 1, true)).toEqual({
      leftText: "A\n\nC",
      rightText: "B\n\n",
      rowCount: 3,
    });
    expect(buildComparisonTexts(sheets[0], 0, 2, false).rightText).toBe(
      "\n0\n\nfalse\ntail",
    );
  });
  it("supports columns beyond Z and removes completely empty sheets", () => {
    expect([0, 25, 26, 51, 52, 701, 702].map(getColumnLetter)).toEqual([
      "A",
      "Z",
      "AA",
      "AZ",
      "BA",
      "ZZ",
      "AAA",
    ]);
    expect(
      buildWorkbookFromArrays("empty.xlsx", [{ name: "Empty", rows: [] }])
        .sheets,
    ).toEqual([]);
  });
  it.each(["xlsx", "biff8", "csv"] as const)(
    "reads real %s data and preserves interior blank rows",
    async (bookType) => {
      const workbook = XLSX.utils.book_new();
      const sheet = XLSX.utils.aoa_to_sheet([
        ["Source", "Target"],
        ["{a}", "{a}"],
        ["", ""],
        ["10", "20"],
      ]);
      XLSX.utils.book_append_sheet(workbook, sheet, "First");
      if (bookType !== "csv")
        XLSX.utils.book_append_sheet(
          workbook,
          XLSX.utils.aoa_to_sheet([
            ["A", "B"],
            ["x", "y"],
          ]),
          "Second",
        );
      const buffer = XLSX.write(workbook, { type: "array", bookType });
      const parsed = await readWorkbook(buffer, "test." + bookType, true);
      expect(parsed.sheets).toHaveLength(bookType === "csv" ? 1 : 2);
      expect(buildComparisonTexts(parsed.sheets[0], 0, 1, true)).toEqual({
        leftText: "{a}\n\n10",
        rightText: "{a}\n\n20",
        rowCount: 3,
      });
    },
  );
  it("keeps the original raw-versus-formatted cell behavior of each tool", async () => {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([
      ["ID", "Other"],
      [12, 12],
    ]);
    sheet.A2.z = "0000";
    XLSX.utils.book_append_sheet(workbook, sheet, "Data");
    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    expect(
      (await readWorkbook(buffer, "test.xlsx", true)).sheets[0].rows[1][0],
    ).toBe("0012");
    expect(
      (await readWorkbook(buffer, "test.xlsx", false)).sheets[0].rows[1][0],
    ).toBe("12");
  });
});
