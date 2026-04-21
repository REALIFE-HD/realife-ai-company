export function Footer() {
  return (
    <footer className="mt-8 border-t border-slate-200 bg-white px-4 py-7 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded bg-slate-950 font-display text-[10px] font-semibold text-white"
          >
            RL
          </span>
          <p className="text-[11.5px] text-slate-500">© 2026 合同会社REALIFE. All rights reserved.</p>
        </div>
        <ul className="flex items-center gap-5 text-[11.5px] text-slate-500">
          <li><a href="#" className="transition-colors hover:text-slate-900">利用規約</a></li>
          <li><a href="#" className="transition-colors hover:text-slate-900">プライバシー</a></li>
          <li><a href="#" className="transition-colors hover:text-slate-900">お問い合わせ</a></li>
        </ul>
      </div>
    </footer>
  );
}
