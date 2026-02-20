import Navbar from "@/components/Navbar";
import BlogHero from "@/components/BlogHero";
import BlogGrid from "@/components/BlogGrid";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BlogHero />
      <BlogGrid />
      <Footer />
    </div>
  );
};

export default Index;
