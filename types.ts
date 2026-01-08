
export type TabType = 'schedule' | 'bookings' | 'expense' | 'journal' | 'planning' | 'members';

export interface TravelDay {
  date: string;
  label: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  location: string;
  category: 'attraction' | 'food' | 'transport' | 'hotel';
  note?: string;
  imageUrl?: string;
}

export interface FlightDetails {
  bookingRef: string;
  flightNo: string;
  airline: string;
  depTime: string;
  arrTime: string;
  depLoc: string;
  depCity: string;
  arrLoc: string;
  arrCity: string;
  duration: string;
  date: string;
  baggage: string;
  aircraft: string;
  price: string;
  orderType: string;
  purchaseDate: string;
  purchasedVia: string;
}

export interface AccommodationDetails {
  name: string;
  locationTag: string;
  imageUrl: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  nights: number;
  peopleCount: number;
  totalPrice: string;
  splitPrice: string;
  perNightPrice: string;
  refCode: string;
}

export interface Booking {
  id: string;
  type: 'flight' | 'accommodation';
  title: string;
  details: FlightDetails | AccommodationDetails | any;
  createdAt?: any;
  updatedAt?: any;
}

export interface Expense {
  id: string;
  item: string;
  amount: number;
  currency: 'JPY' | 'TWD' | 'USD';
  paymentMethod: 'credit' | 'cash' | 'mobile';
  location: string;
  payerId: string;
  date: string;
  createdAt?: any;
}

export interface JournalEntry {
  id: string;
  author: string;
  content: string;
  images: string[];
  date: string;
  timestamp: number;
}

export interface Assignee {
  memberId: string;
  completed: boolean;
}

export interface TodoItem {
  id: string;
  text: string;
  listType: 'todo' | 'packing' | 'shopping';
  category?: string; // 行李清單專用分類
  assignees: Assignee[];
  createdAt?: any;
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
}
