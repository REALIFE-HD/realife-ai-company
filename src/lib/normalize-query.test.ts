import { describe, expect, it } from "vitest";
import { historyDedupeKey, normalizeQuery } from "./normalize-query";

describe("normalizeQuery", () => {
  it("前後の半角スペースを除去する", () => {
    expect(normalizeQuery("  hello  ")).toBe("hello");
  });

  it("前後の全角スペース(U+3000)を除去する", () => {
    expect(normalizeQuery("\u3000\u3000営業\u3000")).toBe("営業");
  });

  it("連続する半角・全角空白・タブを1つの半角スペースにまとめる", () => {
    expect(normalizeQuery("a  b\u3000c\td")).toBe("a b c d");
  });

  it("NFKCで全角英数を半角に正規化する", () => {
    expect(normalizeQuery("ＡＢＣ１２３")).toBe("ABC123");
  });

  it("NFKCで半角カナを全角カナに正規化する", () => {
    // NFKCではハーフ幅カタカナはフル幅へ変換される
    expect(normalizeQuery("ｶﾀｶﾅ")).toBe("カタカナ");
  });

  it("NFKCで全角記号(コロン・ハイフン)を半角に変換する", () => {
    expect(normalizeQuery("REA:01-A")).toBe("REA:01-A");
    expect(normalizeQuery("ＲＥＡ：０１－Ａ")).toBe("REA:01-A");
  });

  it("大文字小文字は保持する", () => {
    expect(normalizeQuery("Hello World")).toBe("Hello World");
    expect(normalizeQuery("hello world")).toBe("hello world");
  });

  it("空文字や空白のみは空文字を返す", () => {
    expect(normalizeQuery("")).toBe("");
    expect(normalizeQuery("   ")).toBe("");
    expect(normalizeQuery("\u3000\u3000\u3000")).toBe("");
  });

  it("最大文字数で切り詰める", () => {
    const long = "a".repeat(100);
    expect(normalizeQuery(long, 10)).toBe("a".repeat(10));
  });

  it("正規化と切り詰めを組み合わせる", () => {
    // 全角→半角に変換した後の長さで切り詰める
    expect(normalizeQuery("ＡＢＣＤＥ", 3)).toBe("ABC");
  });

  it("デフォルトの最大文字数は80", () => {
    const long = "x".repeat(120);
    expect(normalizeQuery(long).length).toBe(80);
  });
});

describe("historyDedupeKey", () => {
  it("大文字小文字の違いを同一キーとして扱う", () => {
    expect(historyDedupeKey("Hello")).toBe(historyDedupeKey("hello"));
    expect(historyDedupeKey("REALIFE")).toBe(historyDedupeKey("realife"));
  });

  it("全角と半角の違いを同一キーとして扱う", () => {
    expect(historyDedupeKey("ＡＢＣ")).toBe(historyDedupeKey("abc"));
  });

  it("空白の差を吸収して同一キーとして扱う", () => {
    expect(historyDedupeKey("  営業  関東 ")).toBe(historyDedupeKey("営業 関東"));
    expect(historyDedupeKey("営業\u3000関東")).toBe(historyDedupeKey("営業 関東"));
  });
});
