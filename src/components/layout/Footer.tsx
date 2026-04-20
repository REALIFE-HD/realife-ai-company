export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 sm:py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded bg-neutral-950 font-serif text-xs font-semibold text-white"
          >
            RL
          </span>
          <p className="text-xs text-slate-500">© 2026 合同会社REALIFE. All rights reserved.</p>
        </div>
        <ul className="flex items-center gap-5 text-xs text-slate-600">
          <li>
            <a href="#" className="transition-colors hover:text-neutral-950">利用規約</a>
          </li>
          <li>
            <a href="#" className="transition-colors hover:text-neutral-950">プライバシー</a>
          </li>
          <li>
            <a href="#" className="transition-colors hover:text-neutral-950">お問い合わせ</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
