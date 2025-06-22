import { useEffect, useRef, useState } from 'react';
import { useToast } from './use-toast';

interface UseWebSocketOptions {
  userId?: number;
  sessionId?: number;
  onMatch?: (data: any) => void;
}

export function useWebSocket({ userId, sessionId, onMatch }: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!userId || !sessionId) return;

    // For now, simulate connection status without actual WebSocket
    setIsConnected(true);
    setPartnerOnline(true);

    // Simulate match checking every few seconds
    const matchChecker = setInterval(async () => {
      try {
        const room = `session_${sessionId}`;
        const response = await fetch(`/matches/${room}/user${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.mealIds && data.mealIds.length > 0) {
            // Found matches, trigger notification
            const latestMatch = data.mealIds[data.mealIds.length - 1];
            if (onMatch) {
              onMatch({ mealId: latestMatch, room });
            }
            toast({
              title: "It's a Match!",
              description: "You both liked the same item!",
            });
          }
        }
      } catch (error) {
        console.log('Match check error:', error);
      }
    }, 3000); // Check every 3 seconds

    return () => {
      clearInterval(matchChecker);
      setIsConnected(false);
      setPartnerOnline(false);
    };
  }, [userId, sessionId, onMatch, toast]);

  return {
    isConnected,
    partnerOnline,
  };
}