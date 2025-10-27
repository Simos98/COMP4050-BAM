export type User = {
  id: string;
  username: string;
  role?: string;
};

export type Booking = {
  id: string;
  title: string;
  start: string; // ISO
  end?: string;  // ISO optional
  // other fields from backend allowed
};