export interface User {
  _id: string;
  id?: string;
  username: string;
  email: string;
  reputationScore: number;
  location: {
    coordinates: [number, number];
  };
  createdAt: string;
}

export interface Item {
  _id: string;
  id?: string;
  name: string;
  category: string;
  condition: string;
  type: "Trade" | "Rent" | "Share" | "TRADE" | "RENT" | "Rent" | "Trade";
  pricePerDay?: number;
  ownerID: {
    username: string;
    reputationScore: number;
    _id?: string;
  };
  images: string[];
  currentState: string;
}

export interface Transaction {
  _id: string;
  itemID: Item;
  requesterID: User;
  ownerID: User;
  type: "Rent" | "Trade";
  status: "Pending" | "Accepted" | "Rejected" | "Completed";
  startDate?: string;
  endDate?: string;
  createdAt: string;
}
