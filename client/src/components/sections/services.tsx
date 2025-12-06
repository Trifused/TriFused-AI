import { motion } from "framer-motion";
import securityImg from "@assets/generated_images/cybersecurity_data_shield.png";
import infraImg from "@assets/generated_images/futuristic_server_infrastructure.png";
import marketingImg from "@assets/generated_images/ai_marketing_network.png";
import { ArrowUpRight, Shield, Server, BrainCircuit } from "lucide-react";

const services = [
  {
    id: "cybersecurity",
    title: "Cognitive Cybersecurity",
    description: "AI-driven threat detection that evolves faster than the attackers. Predictive defense systems that secure your data before a breach occurs.",
    icon: Shield,
    image: securityImg,
    color: "text-cyan-400"
  },
  {
    id: "infrastructure",
    title: "Autonomous Infrastructure",
    description: "Self-healing server architectures managed by intelligent agents. Reduce downtime to zero with predictive maintenance and auto-scaling.",
    icon: Server,
    image: infraImg,
    color: "text-purple-400"
  },
  {
    id: "growth",
    title: "Generative Growth Engines",
    description: "Marketing strategies supercharged by LLMs. Hyper-personalized customer journeys created in real-time by our proprietary AI models.",
    icon: BrainCircuit,
    image: marketingImg,
    color: "text-blue-400"
  }
];

export function Services() {
  return (
    <section id="services" className="py-24 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="container mx-auto px-6">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">
            Services <span className="text-muted-foreground">/</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
              Supercharged Capabilities
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            We fuse traditional IT expertise with cutting-edge Large Language Models to deliver exponential value.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
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
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
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
                  
                  <button className="flex items-center text-sm font-medium text-white/70 group-hover:text-primary transition-colors uppercase tracking-wider">
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
