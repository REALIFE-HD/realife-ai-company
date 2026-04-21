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
 * 履歴用の重複判定キー。
 *
 * 重複判定ルール（同一とみなす条件）:
 *  1. NFKC 正規化により同形になる: 例「ＡＢＣ」=「ABC」、「ｶﾀｶﾅ」=「カタカナ」
 *  2. 前後・連続する空白(半角/全角/タブ)を統一: 例「  営業 　関東 」=「営業 関東」
 *  3. 大文字小文字を区別しない: 例「REALIFE」=「realife」
 *  4. 上記正規化後に最大長(既定80文字)で切り詰めた結果が同一
 *
 * 表示は最初に保存した表記を保持する（呼び出し側で実装）。
 */
export function historyDedupeKey(q: string): string {
  return normalizeQuery(q).toLowerCase();
}

/**
 * UI 表示用: 重複判定ルールを 1 行で説明するツールチップテキスト。
 */
export const HISTORY_DEDUPE_HINT =
  "全角/半角・大文字小文字・前後と連続スペースの違いは同じ検索として扱われます";
