const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <a href="/" className="text-sm font-bold tracking-widest uppercase text-foreground">
          Semiotic Labs
        </a>
        <div className="flex items-center gap-8">
          <a
            href="https://semiotic.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors"
          >
            Home
          </a>
          <a
            href="/"
            className="text-xs tracking-wider uppercase text-primary"
          >
            Blog
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
