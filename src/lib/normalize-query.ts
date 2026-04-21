/**
 * 検索文字列の正規化:
 *  - Unicode 互換正規化(NFKC): 全角英数 → 半角、全角記号 → 半角
 *  - 全角空白(U+3000)・タブ等 → 半角スペース
 *  - 連続空白を 1 つにまとめ、前後スペースを除去
 *  - 任意の最大文字数で切り詰め
 *
 * 大文字小文字は保持する（重複判定は呼び出し側で toLowerCase 比較）。
 */
export function normalizeQuery(q: string, maxLength = 80): string {
  return q
    .normalize("NFKC")
    .replace(/[\s\u3000]+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/**
 * 履歴用の重複判定キー（大文字小文字を区別しない）。
 */
export function historyDedupeKey(q: string): string {
  return normalizeQuery(q).toLowerCase();
}
