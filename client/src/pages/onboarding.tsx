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
    <div className="min-h-screen bg-gradient-to-br from-app-primary to-app-secondary flex items-center justify-center p-4">
      <motion.div
        className="max-w-sm w-full text-center text-white"
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
          <Heart className="w-16 h-16 mb-4 mx-auto text-app-accent fill-current" />
          <h1 className="text-4xl font-bold mb-2">Swipe & Savor</h1>
          <p className="text-xl opacity-90">Tinder for Dinner</p>
        </motion.div>

        <motion.div
          className="space-y-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Swipe Together</h3>
              <p className="text-sm opacity-80">Both partners swipe on food options</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Utensils className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Find Matches</h3>
              <p className="text-sm opacity-80">Get instant agreement on meals</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Wand2 className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">AI Powered</h3>
              <p className="text-sm opacity-80">Smart recommendations based on preferences</p>
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
            className="w-full bg-white text-app-primary font-semibold py-4 px-6 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Let's Get Started!
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
