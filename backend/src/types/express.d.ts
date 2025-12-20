declare namespace Express {
  export interface Request {
    current_user?: {
      id: string;
      email: string;
      phoneNumber: string;
      name: string;
      imageUrl?: string;
      role: string;
    };
  }
}
