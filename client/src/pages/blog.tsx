import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Tag, Terminal, Loader2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  url: string; // Changed from slug to url for external links
  isExternal: boolean;
}

// Fallback data in case the API call fails or is blocked by CORS
const FALLBACK_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "Protecting Your Brand in the Digital Age – The Clone Warden Solution",
    excerpt: "In today’s digital world, protecting your brand, content, and reputation is more important than ever. Clone Warden is an AI-powered platform designed to detect, track, and remove unauthorized clones.",
    date: "March 14, 2025",
    readTime: "5 min read",
    tags: ["Security", "AI", "Brand Protection"],
    url: "https://blog.trifused.com/2025/03/clonewarden.html",
    isExternal: true
  },
  {
    id: "2",
    title: "Web Check Tool",
    excerpt: "Nice Website security checkup tools and all the site information. A comprehensive look at web-check.as93.net.",
    date: "June 16, 2024",
    readTime: "2 min read",
    tags: ["Tools", "Security"],
    url: "https://blog.trifused.com/2024/06/web-check-tool.html",
    isExternal: true
  },
  {
    id: "3",
    title: "Windows God Mode Folder",
    excerpt: "How to turn on the Windows God Mode folder to access all administrative tools in one place.",
    date: "June 14, 2024",
    readTime: "3 min read",
    tags: ["Windows", "Tips"],
    url: "https://blog.trifused.com/2024/06/windows-god-mode-folder.html",
    isExternal: true
  },
  {
    id: "4",
    title: "ACH Nacha file report script in PowerShell",
    excerpt: "I created the Nacha-Report.ps1 PowerShell script to simplify the analysis of NACHA files in a more human readable format.",
    date: "March 21, 2024",
    readTime: "4 min read",
    tags: ["PowerShell", "FinTech", "Scripting"],
    url: "https://blog.trifused.com/2024/03/ach-nacha-file-report-script-in.html",
    isExternal: true
  },
  {
    id: "5",
    title: "Mass Convert Tiff to PDF with Python",
    excerpt: "I needed to convert over 200K tiff files to pdf. A Python script using img2pdf and PIL to automate the process.",
    date: "August 14, 2023",
    readTime: "6 min read",
    tags: ["Python", "Automation"],
    url: "https://blog.trifused.com/2023/08/mass-convert-tiff-to-pdf-with-python.html",
    isExternal: true
  }
];

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        // Try to fetch from Blogger JSON API
        const response = await fetch('https://blog.trifused.com/feeds/posts/default?alt=json&max-results=10');
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        const mappedPosts: BlogPost[] = data.feed.entry.map((entry: any) => {
          // Extract link
          const link = entry.link.find((l: any) => l.rel === 'alternate')?.href || '#';
          
          // Extract tags
          const tags = entry.category?.map((c: any) => c.term) || ["Tech"];
          
          // Calculate read time (rough estimate)
          const content = entry.content?.$t || entry.summary?.$t || "";
          const wordCount = content.split(/\s+/).length;
          const readTime = Math.ceil(wordCount / 200) + " min read";

          // Format date
          const date = new Date(entry.published.$t);
          const formattedDate = format(date, "MMMM dd, yyyy");

          // Create excerpt (remove HTML tags)
          const rawExcerpt = content.replace(/<[^>]*>?/gm, "").substring(0, 150) + "...";

          return {
            id: entry.id.$t,
            title: entry.title.$t,
            excerpt: rawExcerpt,
            date: formattedDate,
            readTime: readTime,
            tags: tags.slice(0, 3), // Limit tags
            url: link,
            isExternal: true
          };
        });

        setPosts(mappedPosts);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch blog posts:", err);
        // Fallback to static data if fetch fails (e.g. CORS issues)
        setPosts(FALLBACK_POSTS);
        setLoading(false);
        // We don't necessarily need to show an error to the user if we have a good fallback
        // setError("Failed to load live posts. Showing cached intelligence.");
      }
    }

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest mb-6">
                <Terminal className="w-3 h-3" />
                Intelligence Logs
              </div>
              <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">
                System <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Knowledge Base</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Live feed from the TriFused neural network. Technical documentation, protocols, and field reports.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="font-mono text-sm text-muted-foreground animate-pulse">Establishing uplink to blog.trifused.com...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                  
                  <div className="glass-panel h-full p-8 rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-300 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Terminal className="w-24 h-24 text-primary transform rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map(tag => (
                          <span key={tag} className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-primary/80 border border-white/10">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <h2 className="text-2xl font-bold font-heading mb-3 group-hover:text-primary transition-colors">
                        <a href={post.url} target="_blank" rel="noopener noreferrer">
                          {post.title}
                        </a>
                      </h2>
                      
                      <p className="text-muted-foreground mb-6 flex-1 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-white/5 pt-4 mt-auto">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {post.readTime}
                          </span>
                        </div>
                        
                        <a 
                          href={post.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:gap-2 transition-all font-medium"
                        >
                          Read Log <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

