import { motion } from "framer-motion";
import { useLocation } from "wouter";
import securityImg from "@assets/generated_images/cybersecurity_data_shield.png";
import infraImg from "@assets/generated_images/futuristic_server_infrastructure.png";
import marketingImg from "@assets/generated_images/ai_marketing_network.png";
import { ArrowUpRight, Shield, Server, BrainCircuit, Code, Database, Cloud, Smartphone, Lock, Monitor, HardDrive, KeyRound, Activity } from "lucide-react";

const services = [
  {
    id: "secure-workstations",
    title: "Secure Workstations",
    description: "Simple secure workstations with the latest software and security updates. Keep your endpoints protected and compliant.",
    icon: Monitor,
    image: securityImg,
    color: "text-blue-400"
  },
  {
    id: "data-services",
    title: "Your Data Your Services",
    description: "Deep insights into your servers and data with advanced monitoring tools. Recover any system in 30 minutes.",
    icon: HardDrive,
    image: infraImg,
    color: "text-green-400"
  },
  {
    id: "accounts-security",
    title: "Accounts, Passwords & Security",
    description: "Protect your passwords and accounts, keep them secure and use Multi-Factor Authentication for maximum protection.",
    icon: KeyRound,
    image: securityImg,
    color: "text-yellow-400"
  },
  {
    id: "cloud-systems",
    title: "Cloud Systems",
    description: "From Office 365 to Microsoft Azure and Amazon hosted servers - built and managed for you with enterprise-grade reliability.",
    icon: Cloud,
    image: infraImg,
    color: "text-purple-400"
  },
  {
    id: "advanced-security",
    title: "Advanced Security",
    description: "Security monitoring using SIEM and EDR tools leveraging emerging AI for real-time threat detection and response.",
    icon: Activity,
    image: securityImg,
    color: "text-red-400"
  },
  {
    id: "pentesting",
    title: "Advanced Pen-Testing",
    description: "Offensive security protocols simulating sophisticated cyber-attacks to identify and patch vulnerabilities before exploitation.",
    icon: Lock,
    image: securityImg,
    color: "text-orange-400"
  },
  {
    id: "mdr",
    title: "MDR & Threat Hunting",
    description: "Managed Detection and Response systems that actively hunt for threats across your endpoints, networks, and cloud environments.",
    icon: Shield,
    image: securityImg,
    color: "text-cyan-400"
  },
  {
    id: "mdm",
    title: "Mobile Device Management",
    description: "Secure, remote administration of mobile endpoints. Enforce encryption, wipe lost devices, and manage app deployment at scale.",
    icon: Smartphone,
    image: infraImg,
    color: "text-pink-400"
  },
  {
    id: "cloud-db",
    title: "Cloud & Database Architecture",
    description: "Scalable, resilient cloud infrastructure design. Optimized database clusters for high-availability and zero-latency performance.",
    icon: Database,
    image: infraImg,
    color: "text-indigo-400"
  },
  {
    id: "coding",
    title: "AI-Native Development",
    description: "Building next-gen applications with LLM integration. From chatbots to autonomous agents, we code the future.",
    icon: Code,
    image: marketingImg,
    color: "text-emerald-400"
  },
  {
    id: "growth",
    title: "Generative Growth Engines",
    description: "Marketing strategies supercharged by AI. Hyper-personalized customer journeys created in real-time.",
    icon: BrainCircuit,
    image: marketingImg,
    color: "text-rose-400"
  }
];

export function Services() {
  const [, setLocation] = useLocation();

  return (
    <section id="services" className="py-24 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="container mx-auto px-6">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">
            Services <span className="text-muted-foreground">/</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
              Operational Capabilities
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Deploying military-grade security and next-gen infrastructure for the modern enterprise.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="glass-panel h-full rounded-2xl overflow-hidden p-1 flex flex-col hover:border-primary/50 transition-colors duration-500">
                <div className="relative h-48 rounded-xl overflow-hidden mb-6 bg-black/50">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                  />
                  <div className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-md rounded-lg border border-white/10">
                    <service.icon className={`w-6 h-6 ${service.color}`} />
                  </div>
                </div>

                <div className="px-5 pb-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold font-heading mb-3 text-white group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                    {service.description}
                  </p>
                  
                  <button 
                    className="flex items-center text-sm font-medium text-white/70 group-hover:text-primary transition-colors uppercase tracking-wider"
                    onClick={() => setLocation("/signup")}
                    data-testid={`button-learn-protocol-${service.id}`}
                  >
                    Learn Protocol <ArrowUpRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
