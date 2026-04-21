import { describe, expect, it } from "vitest";
import { formatDate } from "./display-prefs";

describe("formatDate", () => {
  const target = new Date(Date.UTC(2026, 3, 21, 12, 0, 0));

  it("不正な日付は空文字を返す", () => {
    expect(formatDate("invalid-date", "iso")).toBe("");
  });

  it("iso 指定は YYYY-MM-DD を返す", () => {
    expect(formatDate(target, "iso")).toBe(target.toISOString().slice(0, 10));
  });

  it("ja-long 指定は長い日本語形式で返す", () => {
    const expected = new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(target);
    expect(formatDate(target, "ja-long")).toBe(expected);
  });

  it("ja-short 指定は短い日本語形式で返す", () => {
    const expected = new Intl.DateTimeFormat("ja-JP", {
      month: "numeric",
      day: "numeric",
      weekday: "short",
    }).format(target);
    expect(formatDate(target, "ja-short")).toBe(expected);
  });
});
