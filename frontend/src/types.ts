export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  _id: string;
  name: string;
  totalWeight: number;
  consumedWeight: number;
  availableWeight: number;
  unit: string;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  updatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Resin {
  _id: string;
  name: string;
  materialId: string;
  materialName: string;
  weight: number;
  createdAt: string;
  updatedAt: string;
}

export interface Consumption {
  _id: string;
  date: string;
  shift: 'first' | 'second' | 'third';
  employeeName: string;
  resinId: string;
  resinName: string;
  materialId: string;
  materialName: string;
  resinWeight: number;
  usageCount: number;
  totalConsumption: number;
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  _id: string;
  materialId: string;
  materialName: string;
  totalWeight: number;
  consumedWeight: number;
  availableWeight: number;
  unit: string;
  lastUpdated: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: any[];
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface ShiftInfo {
  shift: 'first' | 'second' | 'third';
  label: string;
  startTime: string;
  endTime: string;
}

export interface Receipt {
  _id: string;
  materialId: string;
  materialName: string;
  receiptDate: string;
  receiptTime: string;
  transporter: string;
  quantity: number;
  unit: string;
  notes?: string;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Disposal {
  _id: string;
  materialId: string;
  materialName: string;
  disposalDate: string;
  disposalTime: string;
  reason: string;
  quantity: number;
  unit: string;
  description?: string;
  location?: string;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}
