const getWebSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_WEBSOCKET_URL) {
    return process.env.NEXT_PUBLIC_WEBSOCKET_URL;
  }
  
  // Fallback pour le développement local
  return process.env.NODE_ENV === 'development' 
    ? 'ws://localhost:8080'
    : 'wss://votre-app.railway.app'; // Remplacez par votre URL de production
};

export const WEBSOCKET_URL = getWebSocketUrl(); 