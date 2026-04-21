import { describe, expect, it } from "vitest";
import { formatAmount } from "./deals";

describe("formatAmount", () => {
  it("NaN や null 相当は ¥0 を返す", () => {
    expect(formatAmount(Number.NaN)).toBe("¥0");
    expect(formatAmount(null as unknown as number)).toBe("¥0");
  });

  it("通常表示では四捨五入して3桁区切りで返す", () => {
    expect(formatAmount(1_234_567.4)).toBe("¥1,234,567");
    expect(formatAmount(1_234_567.6)).toBe("¥1,234,568");
  });

  it("compact 表示で閾値に応じて 億/万/K を返す", () => {
    expect(formatAmount(100_000_000, { compact: true })).toBe("¥1.0億");
    expect(formatAmount(50_000, { compact: true })).toBe("¥5.0万");
    expect(formatAmount(1_500, { compact: true })).toBe("¥1.5K");
  });

  it("compact 表示でも閾値未満は通常表示を返す", () => {
    expect(formatAmount(999, { compact: true })).toBe("¥999");
  });

  it("負の値でも compact の判定と符号を維持する", () => {
    expect(formatAmount(-2_500, { compact: true })).toBe("¥-2.5K");
  });
});
