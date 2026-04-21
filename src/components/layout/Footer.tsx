export function Footer() {
  return (
    <footer className="mt-8 border-t border-border bg-card px-4 py-7 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded bg-foreground font-display text-[10px] font-semibold text-background"
          >
            RL
          </span>
          <p className="text-[11.5px] text-muted-foreground">© 2026 合同会社REALIFE. All rights reserved.</p>
        </div>
        <ul className="flex items-center gap-5 text-[11.5px] text-muted-foreground">
          <li><a href="#" className="transition-colors hover:text-foreground">利用規約</a></li>
          <li><a href="#" className="transition-colors hover:text-foreground">プライバシー</a></li>
          <li><a href="#" className="transition-colors hover:text-foreground">お問い合わせ</a></li>
        </ul>
      </div>
    </footer>
  );
}
