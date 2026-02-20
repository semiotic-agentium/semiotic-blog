import { Link } from "react-router-dom";
import type { BlogPost } from "@/data/blogPosts";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

const BlogCard = ({ post, featured }: BlogCardProps) => {
  if (featured) {
    return (
      <Link
        to={`/blog/${post.id}`}
        className="group card-hover col-span-full grid gap-6 rounded-lg border border-border bg-card p-1 md:grid-cols-2"
      >
        <div className="overflow-hidden rounded-md">
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col justify-center gap-4 p-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground">
              {post.category}
            </span>
            <span className="rounded border border-primary px-2 py-0.5 text-[10px] tracking-widest uppercase text-primary">
              Featured
            </span>
          </div>
          <h2 className="text-2xl font-bold leading-snug text-foreground group-hover:text-primary transition-colors md:text-3xl">
            {post.title}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
          <span className="mt-2 inline-flex items-center gap-2 text-xs tracking-wider uppercase text-primary">
            Read article →
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/blog/${post.id}`}
      className="group card-hover flex flex-col overflow-hidden rounded-lg border border-border bg-card"
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className="text-[10px] tracking-widest uppercase text-muted-foreground">
          {post.category}
        </span>
        <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
          {post.excerpt}
        </p>
        <span className="mt-auto pt-2 text-[10px] tracking-wider uppercase text-primary">
          Read article →
        </span>
      </div>
    </Link>
  );
};

export default BlogCard;
