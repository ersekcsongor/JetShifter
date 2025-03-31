// Type definitions for our flight data
type Flight = {
    flightNumber: string;
    origin: string;
    destination: string;
    time: [string, string];
    duration: string;
  };

export default Flight