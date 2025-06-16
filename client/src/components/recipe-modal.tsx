import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, Users, Zap, X } from "lucide-react";
import { type FoodItem } from "@shared/schema";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodItem: FoodItem;
}

export function RecipeModal({ isOpen, onClose, foodItem }: RecipeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white rounded-t-3xl w-full max-w-sm h-3/4 overflow-y-auto shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-black">
                {foodItem.category === "cooking" && "Recipe Details"}
                {foodItem.category === "delivery" && "Restaurant Details"}
                {foodItem.category === "dineout" && "Restaurant Info"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <img
                src={foodItem.image}
                alt={foodItem.name}
                className="w-full h-52 object-cover rounded-2xl mb-6"
              />

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-black">
                  {foodItem.name}
                </h3>
                {foodItem.price && (
                  <span className="text-xl font-bold text-app-primary">{foodItem.price}</span>
                )}
              </div>

              <div className="flex items-center space-x-6 mb-4 text-sm text-gray-500">
                {foodItem.cookTime && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{foodItem.cookTime}</span>
                  </div>
                )}
                {foodItem.deliveryTime && (
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>{foodItem.deliveryTime}</span>
                  </div>
                )}
                {foodItem.servings && (
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{foodItem.servings} servings</span>
                  </div>
                )}
                {foodItem.calories && (
                  <div className="flex items-center space-x-1">
                    <span>🔥</span>
                    <span>{foodItem.calories} cal</span>
                  </div>
                )}
              </div>

              <p className="text-gray-500 mb-6 leading-relaxed">{foodItem.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {foodItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {foodItem.price && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Price</h4>
                  <p className="text-lg font-bold app-primary">{foodItem.price}</p>
                </div>
              )}

              {foodItem.ingredients && foodItem.ingredients.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Ingredients</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {foodItem.ingredients.map((ingredient, index) => (
                      <li key={index}>• {ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {foodItem.instructions && foodItem.instructions.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Instructions</h4>
                  <ol className="text-sm text-gray-600 space-y-2">
                    {foodItem.instructions.map((instruction, index) => (
                      <li key={index}>{index + 1}. {instruction}</li>
                    ))}
                  </ol>
                </div>
              )}

              {foodItem.distance && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Location</h4>
                  <p className="text-sm text-gray-600">{foodItem.distance} away</p>
                </div>
              )}

              <Button className="w-full bg-app-primary hover:bg-app-primary/90 text-white font-semibold py-3 px-6 rounded-full mb-4">
                {foodItem.category === "cooking" && "Add to Shopping List"}
                {foodItem.category === "delivery" && "View Menu"}
                {foodItem.category === "dineout" && "Get Directions"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
