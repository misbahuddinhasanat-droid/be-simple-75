import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { TopBar } from "./TopBar";

interface LayoutProps {
  children: ReactNode;
}

import { WhatsAppFloat } from "../WhatsAppFloat";
import { MessengerFloat } from "../MessengerFloat";

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-rose-500/30 selection:text-white">
      <div 
        className="glow-trail hidden md:block" 
        style={{ transform: `translate(${mousePos.x - 150}px, ${mousePos.y - 150}px)` }} 
      />
      <TopBar />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location}
          initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <WhatsAppFloat />
      <MessengerFloat />
    </div>
  );
}
