import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export function BentoCard({ title, description, icon: Icon, className = "", image = "", floatDelay = 0 }: { title: string; description: string; icon: any; className?: string; image?: string; floatDelay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: floatDelay * 0.15 }}
      className={className}
    >
    <motion.div
      animate={{
        y: [0, -8, 0, -5, 0],
        rotate: [0, 0.4, 0, -0.3, 0],
      }}
      transition={{
        y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: floatDelay },
        rotate: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: floatDelay },
      }}
      whileHover={{ scale: 0.98, y: -14 }}
      className={`relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 flex flex-col justify-between h-full`}
    >
      {image && (
        <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
          <img src={image} alt={title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 g-linear-to-t from-black via-black/20 to-transparent" />
        </div>
      )}
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors duration-500">
          <Icon size={24} />
        </div>
        <h3 className="text-2xl font-medium mb-2 font-sans">{title}</h3>
        <p className="text-sm opacity-60 leading-relaxed max-w-[200px] font-body">{description}</p>
      </div>
      <div className="relative z-10 flex justify-end">
        <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500" />
      </div>
    </motion.div>
    </motion.div>
  );
}