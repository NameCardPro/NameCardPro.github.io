
export interface BusinessCardData {
  id: string;
  name: string;
  company: string;
  department: string;
  title: string;
  mobile: string;
  workPhone: string;
  email: string;
  postcode: string;
  address: string;
  website: string;
  birthday?: string;
  remark?: string;
  photoUrl?: string;
  logoUrl?: string;
}

export interface ScanLog {
  id: string;
  cardId: string;
  timestamp: number;
  userAgent: string;
}
