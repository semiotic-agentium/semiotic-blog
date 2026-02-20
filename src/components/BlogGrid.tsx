import { blogPosts } from "@/data/blogPosts";
import BlogCard from "./BlogCard";

const BlogGrid = () => {
  const featured = blogPosts.find((p) => p.featured);
  const rest = blogPosts.filter((p) => !p.featured);

  return (
    <section className="container mx-auto px-6 py-16">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] tracking-widest uppercase text-muted-foreground">
          Latest Posts
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {featured && <BlogCard post={featured} featured />}
        {rest.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
};

export default BlogGrid;
