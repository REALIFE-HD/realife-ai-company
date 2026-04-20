export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs text-slate-500">© 2026 合同会社REALIFE. All rights reserved.</p>
        <ul className="flex items-center gap-5 text-xs text-slate-500">
          <li><a href="#" className="transition-colors hover:text-slate-900">利用規約</a></li>
          <li><a href="#" className="transition-colors hover:text-slate-900">プライバシー</a></li>
          <li><a href="#" className="transition-colors hover:text-slate-900">お問い合わせ</a></li>
        </ul>
      </div>
    </footer>
  );
}
