import { motion } from "framer-motion";

/** Decorative 3D-feel rotating hardware piece used as a subtle background accent. */
export default function RotatingPart({
  src,
  alt = "",
  className = "",
  size = 280,
  reverse = false,
}: {
  src: string;
  alt?: string;
  className?: string;
  size?: number;
  reverse?: boolean;
}) {
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute opacity-[0.12] mix-blend-screen ${className}`}
      style={{ width: size, height: size, perspective: 1000 }}
      animate={{ rotateY: reverse ? [180, 0, -180] : [-180, 0, 180] }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain drop-shadow-[0_0_50px_hsl(217_91%_60%/0.6)]"
        style={{ transformStyle: "preserve-3d" }}
      />
    </motion.div>
  );
}
