const BlogHero = () => {
  return (
    <section className="dot-grid relative flex min-h-[60vh] flex-col items-start justify-center px-6 pt-24">
      <div className="container mx-auto">
        <p className="mb-4 text-xs tracking-widest uppercase text-muted-foreground animate-fade-in-up">
          // Engineering Blog
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
          Engineering the Future of{" "}
          <span className="text-primary glow-green">
            Autonomous Crypto Infrastructure.
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground" style={{ animationDelay: "0.2s" }}>
          Deep dives into cryptography, optimization, AI agents, and decentralized systems from the Semiotic Labs team.
        </p>
      </div>
    </section>
  );
};

export default BlogHero;
