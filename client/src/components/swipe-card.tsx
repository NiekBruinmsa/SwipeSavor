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
      className={`absolute inset-0 bg-white rounded-2xl shadow-xl cursor-grab active:cursor-grabbing select-none ${className}`}
      style={cardStyle}
      {...gestures}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Swipe overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none z-10"
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
          className="w-full h-2/3 object-cover rounded-t-2xl"
          draggable={false}
        />

        <div className="p-4 h-1/3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold app-neutral truncate">
                {foodItem.name}
              </h3>
              <div className="flex items-center space-x-1 flex-shrink-0">
                {timeInfo && (
                  <>
                    {foodItem.category === "cooking" && <Clock className="w-4 h-4 text-gray-400" />}
                    {foodItem.category === "delivery" && <Zap className="w-4 h-4 text-gray-400" />}
                    {foodItem.category === "dineout" && <MapPin className="w-4 h-4 text-gray-400" />}
                    <span className="text-sm text-gray-600">{timeInfo}</span>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {foodItem.description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-2 flex-wrap">
              {foodItem.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-app-accent fill-current" />
              <span className="text-sm font-medium">{foodItem.rating}</span>
            </div>
          </div>
        </div>

        {/* Info button - positioned to avoid swipe area */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInfo();
          }}
          className="absolute bottom-4 right-4 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 transition-colors z-30"
        >
          i
        </button>
      </div>
    </motion.div>
  );
}
