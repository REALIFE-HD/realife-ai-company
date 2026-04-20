export type Department = {
  id: string;
  name: string;
  role: string;
  kpiLabel: string;
  kpiValue: string;
  tasks: number;
  status: "active" | "setup" | "standard";
  statusLabel?: string;
  unread?: number;
};

export const DEPARTMENTS: Department[] = [
  { id: "01", name: "経営戦略室", role: "戦略立案・IPO準備・KPI管理", kpiLabel: "案件", kpiValue: "2", tasks: 3, status: "standard" },
  { id: "02", name: "営業本部", role: "新規開拓・PipeDrive管理・受注", kpiLabel: "案件", kpiValue: "24", tasks: 8, status: "standard", unread: 5 },
  { id: "03", name: "見積・積算部", role: "見積作成・原価計算・ダブルチェック運用", kpiLabel: "案件", kpiValue: "12", tasks: 6, status: "active", statusLabel: "Phase 6 稼働中" },
  { id: "04", name: "施工管理部", role: "現場監督・工程・品質管理", kpiLabel: "案件", kpiValue: "9", tasks: 4, status: "standard" },
  { id: "05", name: "調達購買部", role: "協力会社発注・材料手配・BOARD連携", kpiLabel: "発注", kpiValue: "14", tasks: 2, status: "standard" },
  { id: "06", name: "マーケティング部", role: "LP・SNS・広告・ブランディング", kpiLabel: "施策", kpiValue: "3", tasks: 5, status: "standard" },
  { id: "07", name: "CS顧客成功部", role: "アフターサポート・満足度向上", kpiLabel: "問合せ", kpiValue: "7", tasks: 1, status: "standard", unread: 2 },
  { id: "08", name: "バックオフィス部", role: "経理・freee・請求・入出金", kpiLabel: "請求", kpiValue: "8", tasks: 3, status: "standard" },
  { id: "09", name: "法務コンプラ部", role: "契約書・規程・コンプライアンス", kpiLabel: "契約", kpiValue: "5", tasks: 2, status: "standard" },
  { id: "10", name: "情報システム部", role: "REALIFEクラウド・自動化・セキュリティ", kpiLabel: "稼働率", kpiValue: "99.8%", tasks: 4, status: "standard" },
  { id: "11", name: "人事組織開発部", role: "採用・労務・組織設計", kpiLabel: "採用", kpiValue: "3", tasks: 2, status: "standard" },
  { id: "12", name: "新規事業開発室", role: "リベルテ・EC・新規事業", kpiLabel: "案件", kpiValue: "4", tasks: 6, status: "setup", statusLabel: "構築中" },
];

export const getDepartment = (id: string) => DEPARTMENTS.find((d) => d.id === id);

// Dummy data for detail page
export const DUMMY_TASKS = [
  { id: "T-001", title: "見積書 #2604 のダブルチェック", due: "2026-04-22", priority: "高", status: "進行中" },
  { id: "T-002", title: "協力会社A 発注書発行", due: "2026-04-23", priority: "中", status: "未着手" },
  { id: "T-003", title: "現場B 週次レポート提出", due: "2026-04-21", priority: "中", status: "進行中" },
  { id: "T-004", title: "顧客ヒアリング議事録共有", due: "2026-04-22", priority: "低", status: "完了" },
  { id: "T-005", title: "原価表 v3 更新", due: "2026-04-24", priority: "高", status: "未着手" },
  { id: "T-006", title: "請求書 #INV-188 発行", due: "2026-04-25", priority: "中", status: "進行中" },
  { id: "T-007", title: "新規LP ワイヤー確認", due: "2026-04-26", priority: "低", status: "未着手" },
  { id: "T-008", title: "BOARD連携テスト", due: "2026-04-23", priority: "高", status: "進行中" },
  { id: "T-009", title: "月次KPIレビュー資料", due: "2026-04-28", priority: "中", status: "未着手" },
  { id: "T-010", title: "アフター点検アポ調整", due: "2026-04-22", priority: "低", status: "完了" },
];

export const DUMMY_DEALS = [
  { id: "D-2604", client: "株式会社サンプル", title: "オフィス内装リフォーム A棟", amount: "¥4,820,000", stage: "見積提出", probability: 60 },
  { id: "D-2598", client: "合同会社ライト", title: "店舗改装 一式", amount: "¥2,140,000", stage: "受注", probability: 100 },
  { id: "D-2601", client: "株式会社マルチ", title: "共用部リノベ", amount: "¥1,680,000", stage: "提案中", probability: 40 },
  { id: "D-2605", client: "個人 山田様", title: "戸建リフォーム", amount: "¥3,250,000", stage: "見積中", probability: 30 },
  { id: "D-2607", client: "株式会社FK", title: "事務所原状回復", amount: "¥980,000", stage: "受注", probability: 100 },
];

export const DUMMY_INSTRUCTIONS = [
  { id: "I-031", title: "Phase 6 ダブルチェック運用の徹底", body: "全見積に対して2名チェックを必須化。", date: "2026-04-19", from: "代表" },
  { id: "I-030", title: "今週の優先案件3件を共有", body: "サンプル様、ライト様、FK様を最優先。", date: "2026-04-18", from: "代表" },
  { id: "I-029", title: "BOARD連携テスト完了報告", body: "本番反映前に結果を共有してください。", date: "2026-04-15", from: "代表" },
];
