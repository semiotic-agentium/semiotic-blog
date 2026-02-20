const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container mx-auto flex flex-col items-center gap-4 px-6 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-foreground">
            Semiotic Labs
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Engineering the future of autonomous crypto infrastructure.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://semiotic.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors"
          >
            semiotic.ai
          </a>
          <a
            href="https://github.com/semiotic-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://x.com/saboratorio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors"
          >
            X / Twitter
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
