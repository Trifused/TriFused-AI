import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { 
  Book, 
  GraduationCap, 
  Shield, 
  Users, 
  History,
  Calculator,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  description?: string;
}

const navItems: NavItem[] = [
  { label: "Docs", href: "/docs", icon: Book, description: "Getting started guide" },
  { label: "Tutorials", href: "/docs/tutorials", icon: GraduationCap, description: "Step-by-step guides" },
  { label: "Scoring Logic", href: "/docs/scoring", icon: Calculator, description: "How scores are calculated" },
  { label: "Trust & Billing", href: "/docs/trust-billing", icon: Shield, description: "Security & payments" },
  { label: "Teams", href: "/docs/teams", icon: Users, description: "Enterprise features" },
  { label: "Changelog", href: "/docs/changelog", icon: History, description: "Updates & releases" },
  { label: "About", href: "/about", icon: Building2, description: "About TriFused" },
];

interface DocsLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function DocsLayout({ children, title, description }: DocsLayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      
      <div className="pt-20 flex">
        {/* Mobile menu toggle - uses Book icon to differentiate from main navbar */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-24 left-4 z-50 md:hidden p-2 px-3 bg-primary/20 rounded-lg border border-primary/30 flex items-center gap-2"
          data-testid="button-docs-mobile-menu"
        >
          {mobileMenuOpen ? <X className="w-4 h-4 text-primary" /> : <Book className="w-4 h-4 text-primary" />}
          <span className="text-xs font-medium text-primary">Docs</span>
        </button>

        {/* Sidebar */}
        <aside className={`
          fixed md:sticky top-20 left-0 h-[calc(100vh-5rem)] w-72 
          bg-background/95 backdrop-blur-xl border-r border-white/10 
          overflow-y-auto z-40
          transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <nav className="p-6 space-y-2">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white mb-1">Documentation</h2>
              <p className="text-sm text-muted-foreground">Learn how to use TriFused</p>
            </div>
            
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer
                      ${isActive 
                        ? 'bg-primary/20 text-primary border border-primary/30' 
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                      }
                    `}
                    data-testid={`nav-docs-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <span className="ml-2 text-primary">✓</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {title}
              </h1>
              {description && (
                <p className="text-lg text-muted-foreground mb-8">
                  {description}
                </p>
              )}
              
              <div className="prose prose-invert prose-cyan max-w-none">
                {children}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}

interface DocsSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function DocsSection({ title, children, defaultOpen = true }: DocsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xl font-semibold text-white mb-4 hover:text-primary transition-colors"
      >
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        {title}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DocsCardProps {
  title: string;
  description: string;
  href?: string;
  icon?: any;
}

export function DocsCard({ title, description, href, icon: Icon }: DocsCardProps) {
  const content = (
    <div className="glass-panel p-6 rounded-xl hover:border-primary/30 transition-all cursor-pointer group">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
  
  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  
  return content;
}

interface DocsCodeBlockProps {
  code: string;
  language?: string;
}

export function DocsCodeBlock({ code, language = "bash" }: DocsCodeBlockProps) {
  return (
    <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto">
      <code className="text-sm font-mono text-cyan-400">{code}</code>
    </pre>
  );
}
