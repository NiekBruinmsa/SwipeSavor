import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { type FoodItem } from "@shared/schema";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedItem: FoodItem;
  onStartCooking: () => void;
  onKeepBrowsing: () => void;
}

export function MatchModal({
  isOpen,
  onClose,
  matchedItem,
  onStartCooking,
  onKeepBrowsing,
}: MatchModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 max-w-sm w-full text-center"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold app-primary mb-2">It's a Match!</h2>
              <p className="text-gray-600">You both loved this dish</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <img
                src={matchedItem.image}
                alt={matchedItem.name}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h3 className="font-bold app-neutral">{matchedItem.name}</h3>
              <p className="text-sm text-gray-600">
                {matchedItem.cookTime && `Ready in ${matchedItem.cookTime}`}
                {matchedItem.deliveryTime && `Delivery in ${matchedItem.deliveryTime}`}
                {matchedItem.distance && `${matchedItem.distance} away`}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={onStartCooking}
                className="w-full bg-app-primary hover:bg-app-primary/90 text-white font-semibold py-3 px-6 rounded-full text-lg"
              >
                {matchedItem.category === "cooking" && "Start Cooking Together!"}
                {matchedItem.category === "delivery" && "Order Now!"}
                {matchedItem.category === "dineout" && "Make Reservation!"}
              </Button>
              <Button
                onClick={onKeepBrowsing}
                variant="outline"
                className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-full hover:bg-gray-200"
              >
                Keep Browsing
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
