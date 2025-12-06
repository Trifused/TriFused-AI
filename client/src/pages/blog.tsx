import { Navbar } from "@/components/layout/navbar";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Tag, Terminal } from "lucide-react";
import { Link } from "wouter";

const blogPosts = [
  {
    id: 1,
    title: "DIY Email Security Upgrade: A Step-by-Step Protocol",
    excerpt: "Strengthen your communication channels against phishing vectors. Implementation guide for SPF, DKIM, and DMARC protocols.",
    date: "April 15, 2023",
    readTime: "8 min read",
    tags: ["Security", "Infrastructure"],
    slug: "diy-email-security"
  },
  {
    id: 2,
    title: "Windows God Mode: Unlocking Admin Omniscience",
    excerpt: "Accessing hidden administrative nodes within the Windows kernel. A guide to the Master Control Panel shortcut.",
    date: "June 22, 2024",
    readTime: "3 min read",
    tags: ["OS", "Hacks"],
    slug: "windows-god-mode"
  },
  {
    id: 3,
    title: "PowerShell: Detecting LLMNR Vulnerabilities",
    excerpt: "Automated script for identifying Link-Local Multicast Name Resolution risks in your local subnet.",
    date: "January 12, 2020",
    readTime: "5 min read",
    tags: ["PowerShell", "Security"],
    slug: "check-llmnr-disabled"
  },
  {
    id: 4,
    title: "DICOM Toolkit Deployment",
    excerpt: "Setting up the DCMTK suite for medical image data transmission. Integrating healthcare protocols with modern infrastructure.",
    date: "June 05, 2022",
    readTime: "12 min read",
    tags: ["Healthcare", "Integration"],
    slug: "setup-dicom-dcmtk"
  },
  {
    id: 5,
    title: "Static IP Coexistence on DHCP Networks",
    excerpt: "Configuring hybrid addressing schemes for critical server nodes. Resolving conflicts in dynamic allocation pools.",
    date: "January 18, 2021",
    readTime: "6 min read",
    tags: ["Networking", "Infrastructure"],
    slug: "windows-dhcp-static-ip"
  }
];

export default function Blog() {
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
                Technical documentation, security protocols, and infrastructure optimization guides extracted from our neural core.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                <div className="glass-panel h-full p-8 rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
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
                      {post.title}
                    </h2>
                    
                    <p className="text-muted-foreground mb-6 flex-1">
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
                      
                      <Link href={`/blog/${post.slug}`}>
                        <a className="flex items-center gap-1 text-primary hover:gap-2 transition-all font-medium">
                          Read Log <ArrowRight className="w-4 h-4" />
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
