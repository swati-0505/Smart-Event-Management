// PageWrapper.jsx
// Wraps every page with a consistent fade-up animation.

import { motion } from "motion/react";

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

export default PageWrapper;