export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      algorithms: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          algorithm_id: string;
          algorithm_name: string;
          credits_remaining: number;
          status: string;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          algorithm_id: string;
          algorithm_name: string;
          credits_remaining: number;
          status?: string;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          algorithm_id?: string;
          algorithm_name?: string;
          credits_remaining?: number;
          status?: string;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      algorithm_calls: {
        Row: {
          id: string;
          user_id: string;
          algorithm_id: string;
          input: Json;
          output: Json;
          execution_time: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          algorithm_id: string;
          input?: Json;
          output?: Json;
          execution_time?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          algorithm_id?: string;
          input?: Json;
          output?: Json;
          execution_time?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
