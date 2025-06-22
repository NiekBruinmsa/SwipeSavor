import { useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Clock, MapPin, Users, Zap } from "lucide-react";
import { type FoodItem } from "@shared/schema";
import { useSwipeGesture } from "@/hooks/use-swipe-gesture";

interface SwipeCardProps {
  foodItem: FoodItem;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onInfo: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export function SwipeCard({
  foodItem,
  onSwipeLeft,
  onSwipeRight,
  onInfo,
  style,
  className = "",
}: SwipeCardProps) {
  const { gestures, globalGestures, gestureState, elementRef } = useSwipeGesture({
    onSwipeLeft,
    onSwipeRight,
    threshold: 100,
  });

  useEffect(() => {
    const { onMouseMove, onTouchMove, onMouseUp, onTouchEnd } = globalGestures;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [globalGestures]);

  const timeInfo = foodItem.cookTime || foodItem.deliveryTime || foodItem.distance;
  const rotation = gestureState.deltaX * 0.1;
  const opacity = Math.max(0.3, 1 - Math.abs(gestureState.deltaX) / 300);

  const cardStyle: React.CSSProperties = {
    ...style,
    transform: gestureState.isDragging
      ? `translateX(${gestureState.deltaX}px) rotate(${rotation}deg)`
      : undefined,
    transition: gestureState.isDragging ? "none" : "all 0.3s ease-out",
  };

  // Color overlay based on swipe direction
  const overlayColor = gestureState.deltaX > 50 
    ? "rgba(39, 174, 96, 0.3)" // Success green
    : gestureState.deltaX < -50 
    ? "rgba(231, 76, 60, 0.3)" // Reject red
    : "transparent";

  return (
    <motion.div
      ref={elementRef}
      className={`absolute inset-0 bg-white rounded-3xl shadow-2xl cursor-grab active:cursor-grabbing select-none ${className}`}
      style={cardStyle}
      {...gestures}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Swipe overlay */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none z-10"
        style={{ backgroundColor: overlayColor }}
      />
      {/* Swipe indicators */}
      {gestureState.deltaX > 50 && (
        <div className="absolute top-8 right-8 bg-app-success text-white px-4 py-2 rounded-full font-bold text-lg z-20 transform rotate-12">
          LIKE
        </div>
      )}
      {gestureState.deltaX < -50 && (
        <div className="absolute top-8 left-8 bg-app-reject text-white px-4 py-2 rounded-full font-bold text-lg z-20 transform -rotate-12">
          PASS
        </div>
      )}
      <div className="relative h-full">
        <img
          src={foodItem.image}
          alt={foodItem.name}
          className="w-full h-3/5 object-cover rounded-t-3xl pt-[7px] pb-[7px]"
          draggable={false}
        />

        <div className="p-6 h-2/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-2xl font-bold text-black truncate">
                {foodItem.name}
              </h3>
              {foodItem.price && (
                <div className="flex-shrink-0">
                  <span className="text-xl font-bold text-app-primary">{foodItem.price}</span>
                </div>
              )}
            </div>

            <p className="text-gray-500 text-sm mb-4 line-clamp-2">
              {foodItem.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {timeInfo && (
                  <div className="flex items-center space-x-1">
                    {foodItem.category === "cooking" && <Clock className="w-4 h-4" />}
                    {foodItem.category === "delivery" && <Zap className="w-4 h-4" />}
                    {foodItem.category === "dineout" && <MapPin className="w-4 h-4" />}
                    <span>{timeInfo}</span>
                  </div>
                )}
                {(foodItem.servings || foodItem.calories) && (
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{foodItem.servings || foodItem.calories}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-black">{foodItem.rating}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            {foodItem.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Info button - positioned to avoid swipe area */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInfo();
          }}
          className="absolute bottom-6 right-6 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-sm hover:bg-gray-800 transition-colors z-30 shadow-lg"
        >
          i
        </button>
      </div>
    </motion.div>
  );
}
