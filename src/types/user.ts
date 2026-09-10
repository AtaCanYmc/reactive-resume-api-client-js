/**
 * TypeScript definitions representing user accounts in Reactive Resume.
 */

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  provider: string;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}
