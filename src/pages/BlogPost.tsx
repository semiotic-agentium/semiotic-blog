import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogPosts } from "@/data/blogPosts";
import { blogContent } from "@/data/blogContent";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.id === slug);
  const content = slug ? blogContent[slug] : undefined;

  if (!post || !content) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-6 pt-24">
          <h1 className="text-2xl font-bold text-foreground">Post not found</h1>
          <Link to="/" className="mt-4 text-sm text-primary hover:underline">
            ← Back to blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="dot-grid relative px-6 pt-28 pb-12">
        <div className="container mx-auto max-w-3xl">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to blog
          </Link>
          <span className="mb-4 block text-[10px] tracking-widest uppercase text-primary">
            {post.category}
          </span>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            {post.title}
          </h1>
        </div>
      </section>

      {/* Cover Image */}
      <div className="container mx-auto max-w-3xl px-6">
        <div className="overflow-hidden rounded-lg border border-border">
          <img
            src={post.image}
            alt={post.title}
            className="w-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <article className="container mx-auto max-w-3xl px-6 py-12">
        <div className="prose-custom">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children, ...props }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                >
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;
