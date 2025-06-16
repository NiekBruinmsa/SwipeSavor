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
            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-black mb-2">It's a Match!</h2>
              <p className="text-gray-500">You both loved this dish</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 mb-8">
              <img
                src={matchedItem.image}
                alt={matchedItem.name}
                className="w-full h-40 object-cover rounded-xl mb-4"
              />
              <h3 className="font-bold text-black text-lg">{matchedItem.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {matchedItem.cookTime && `Ready in ${matchedItem.cookTime}`}
                {matchedItem.deliveryTime && `Delivery in ${matchedItem.deliveryTime}`}
                {matchedItem.distance && `${matchedItem.distance} away`}
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={onStartCooking}
                className="w-full bg-app-primary hover:bg-app-primary/90 text-black font-bold py-4 px-6 rounded-2xl text-lg"
              >
                {matchedItem.category === "cooking" && "Start Cooking Together!"}
                {matchedItem.category === "delivery" && "Order Now!"}
                {matchedItem.category === "dineout" && "Make Reservation!"}
              </Button>
              <Button
                onClick={onKeepBrowsing}
                variant="outline"
                className="w-full bg-white text-gray-700 font-medium py-4 px-6 rounded-2xl hover:bg-gray-50 border-2 border-gray-200"
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
