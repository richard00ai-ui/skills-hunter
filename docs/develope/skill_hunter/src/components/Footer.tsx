export default function Footer() {
  return (
    <footer className="w-full mt-auto rounded-t-xl bg-surface-container-highest flex flex-col items-center justify-center py-12 px-8 gap-6">
      <div className="flex flex-col items-center gap-2">
        <span className="text-headline-sm font-display font-bold text-secondary">Skills Hunter</span>
        <p className="font-body text-label-md text-on-surface-variant">
          © 2026 Skills Hunter. Built for the AI Generation.
        </p>
      </div>
      <nav className="flex flex-wrap justify-center gap-8">
        <a className="text-on-surface-variant hover:text-primary underline transition-all font-body text-label-md" href="#">
          Community Discord
        </a>
        <a className="text-on-surface-variant hover:text-primary underline transition-all font-body text-label-md" href="#">
          Documentation
        </a>
        <a className="text-on-surface-variant hover:text-primary underline transition-all font-body text-label-md" href="#">
          Terms of Service
        </a>
        <a className="text-on-surface-variant hover:text-primary underline transition-all font-body text-label-md" href="#">
          Privacy Policy
        </a>
        <a className="text-on-surface-variant hover:text-primary underline transition-all font-body text-label-md" href="#">
          Contact Support
        </a>
      </nav>
    </footer>
  );
}
