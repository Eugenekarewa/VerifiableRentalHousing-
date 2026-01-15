export type Role = 'GUEST' | 'HOST' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  role: Role;
  email?: string;
  isVerified?: boolean;
  walletAddress?: string;
}

export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
}
