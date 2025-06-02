import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChefHat, Truck, Wine } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useSwipeContext } from "@/lib/swipe-context";

export default function Categories() {
  const [, setLocation] = useLocation();
  const { setCurrentCategory, activeFilters, setActiveFilters } = useSwipeContext();
  const [selectedFilters, setSelectedFilters] = useState<string[]>(activeFilters);

  const handleCategorySelect = (category: string) => {
    setCurrentCategory(category);
    setActiveFilters(selectedFilters);
    setLocation("/swipe");
  };

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const categories = [
    {
      id: "cooking",
      title: "Cook at Home",
      description: "Discover recipes together",
      icon: ChefHat,
      gradient: "from-orange-400 to-red-400",
    },
    {
      id: "delivery",
      title: "Order Delivery", 
      description: "Browse local restaurants",
      icon: Truck,
      gradient: "from-blue-400 to-purple-400",
    },
    {
      id: "dineout",
      title: "Dine Out",
      description: "Find restaurants nearby",
      icon: Wine,
      gradient: "from-green-400 to-teal-400",
    },
  ];

  const filters = [
    { id: "vegetarian", label: "🥗 Vegetarian" },
    { id: "quick", label: "⚡ Quick (< 30 min)" },
    { id: "budget", label: "💰 Budget Friendly" },
    { id: "spicy", label: "🌶️ Spicy" },
  ];

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-sm mx-auto pt-8">
        <motion.div
          className="flex items-center mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center flex-1">
            <h2 className="text-2xl font-bold app-neutral">What's the vibe tonight?</h2>
            <p className="text-gray-600">Choose your dining adventure</p>
          </div>
        </motion.div>

        <motion.div
          className="space-y-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
              >
                <Button
                  onClick={() => handleCategorySelect(category.id)}
                  className={`w-full bg-gradient-to-r ${category.gradient} text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 h-auto`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="text-left">
                      <h3 className="text-xl font-semibold mb-1">{category.title}</h3>
                      <p className="text-sm opacity-90">{category.description}</p>
                    </div>
                    <Icon className="w-8 h-8" />
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="bg-gray-50 p-4 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <h4 className="font-semibold app-neutral mb-3">Quick Filters</h4>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant="outline"
                size="sm"
                onClick={() => handleFilterToggle(filter.id)}
                className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                  selectedFilters.includes(filter.id)
                    ? "bg-app-primary text-white border-app-primary"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
