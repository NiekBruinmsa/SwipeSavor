import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Smartphone, Utensils, Wand2 } from "lucide-react";
import { useLocation } from "wouter";

export default function Onboarding() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setLocation("/categories");
  };

  return (
    <div className="min-h-screen bg-app-primary flex items-center justify-center p-4">
      <motion.div
        className="max-w-sm w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="mb-8"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
        >
          <div className="w-20 h-20 mb-6 mx-auto bg-black rounded-3xl flex items-center justify-center">
            <span className="text-4xl">🍔</span>
          </div>
          <h1 className="text-4xl font-bold mb-2 app-text">SWIPE & SAVOR</h1>
          <p className="text-xl app-text font-medium">Tinder for Dinner</p>
        </motion.div>

        <motion.div
          className="space-y-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-black/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 app-text" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold app-text">Swipe Together</h3>
              <p className="text-sm app-text-muted">Both partners swipe on food options</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-black/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Utensils className="w-6 h-6 app-text" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold app-text">Find Matches</h3>
              <p className="text-sm app-text-muted">Get instant agreement on meals</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-black/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Wand2 className="w-6 h-6 app-text" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold app-text">AI Powered</h3>
              <p className="text-sm app-text-muted">Smart recommendations based on preferences</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            onClick={handleGetStarted}
            className="w-full bg-black text-white font-semibold py-4 px-6 rounded-2xl text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Let's Get Started!
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
