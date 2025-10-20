// src/api/userProfile.ts
import api from "./axios";

export interface UserProfile {
  user: {
    _id: string;
    email: string;
    name: string;
    role: string;
    balance: number;
    banned: boolean;
    createdAt: string;
    updatedAt: string;
  };
  transactions: {
    _id: string;
    method: string;
    type: string;
    amount: number;
    status: string;
    reference?: string;
    proof?: string | null;
    rejectReason?: string;
    createdAt: string;
    updatedAt: string;
  }[];
  orders: any[]; // adjust later
  notifications: {
    _id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  }[];
}

export async function getUserProfile(id: string) {
  const res = await api.get(`/admin/users/${id}`);
  return res.data as UserProfile;
}
