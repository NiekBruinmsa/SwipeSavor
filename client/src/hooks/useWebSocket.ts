import { useEffect, useRef, useState } from 'react';
import { useToast } from './use-toast';

interface WebSocketMessage {
  type: 'match_found' | 'partner_online' | 'partner_offline' | 'partner_swipe';
  [key: string]: any;
}

interface UseWebSocketOptions {
  userId?: number;
  sessionId?: number;
  onMatch?: (data: any) => void;
  onPartnerSwipe?: (data: any) => void;
}

export function useWebSocket({ userId, sessionId, onMatch, onPartnerSwipe }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId || !sessionId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Join the session
      ws.send(JSON.stringify({
        type: 'join',
        userId,
        sessionId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        switch (data.type) {
          case 'match_found':
            if (onMatch) {
              onMatch(data);
            }
            toast({
              title: "It's a Match! 🎉",
              description: "You both liked the same item!",
            });
            break;
            
          case 'partner_online':
            setPartnerOnline(true);
            toast({
              title: "Partner joined",
              description: "Your partner is now online",
            });
            break;
            
          case 'partner_offline':
            setPartnerOnline(false);
            toast({
              title: "Partner left",
              description: "Your partner went offline",
              variant: "destructive",
            });
            break;
            
          case 'partner_swipe':
            if (onPartnerSwipe) {
              onPartnerSwipe(data);
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setPartnerOnline(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [userId, sessionId, onMatch, onPartnerSwipe, toast]);

  const sendSwipe = (foodItemId: string, liked: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'swipe',
        foodItemId,
        liked
      }));
    }
  };

  return {
    isConnected,
    partnerOnline,
    sendSwipe
  };
}