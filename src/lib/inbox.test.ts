import { describe, expect, it } from "vitest";
import { applyRules } from "./inbox";

describe("applyRules", () => {
  it("件名・本文からキーワード一致した部門と理由を返す", () => {
    const result = applyRules("見積の相談", "原価を確認したい");
    expect(result).toEqual({
      dept: "03",
      reason: "見積・積算キーワード「見積」",
    });
  });

  it("英字キーワードは大文字小文字を区別せず一致する", () => {
    const result = applyRules("定例報告", "api の挙動がおかしい");
    expect(result).toEqual({
      dept: "10",
      reason: "情シスキーワード「API」",
    });
  });

  it("複数ルールに一致する場合は定義順で先頭のルールを優先する", () => {
    const result = applyRules("営業からの連絡", "請求の確認もお願いします");
    expect(result).toEqual({
      dept: "02",
      reason: "営業キーワード「営業」",
    });
  });

  it("一致しない場合は null を返す", () => {
    expect(applyRules("雑談", "ランチの話")).toBeNull();
  });
});
