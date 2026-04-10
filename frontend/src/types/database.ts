/**
 * Types TypeScript générés manuellement depuis le schema Supabase.
 * À mettre à jour si le schema BDD évolue.
 * Ces types sont utilisés par les clients Supabase (client.ts, server.ts).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          plan: "free" | "trial" | "premium";
          role: "user" | "admin";
          trial_ends_at: string | null;
          stripe_customer_id: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string;
          email: string;
          plan?: "free" | "trial" | "premium";
          role?: "user" | "admin";
          trial_ends_at?: string | null;
          stripe_customer_id?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          email?: string;
          plan?: "free" | "trial" | "premium";
          role?: "user" | "admin";
          trial_ends_at?: string | null;
          stripe_customer_id?: string | null;
          deleted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          slug: string;
          status: "draft" | "published" | "suspended" | "deleted";
          craft_state: Json | null;
          deleted_at: string | null;
          published_at: string | null;
          allow_landing: boolean;
          admin_featured: boolean;
          theme: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          slug: string;
          status?: "draft" | "published" | "suspended" | "deleted";
          craft_state?: Json | null;
          deleted_at?: string | null;
          published_at?: string | null;
          allow_landing?: boolean;
          admin_featured?: boolean;
          theme?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          status?: "draft" | "published" | "suspended" | "deleted";
          craft_state?: Json | null;
          deleted_at?: string | null;
          published_at?: string | null;
          allow_landing?: boolean;
          admin_featured?: boolean;
          theme?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          stripe_customer_id: string | null;
          status:
            | "active"
            | "trialing"
            | "canceled"
            | "past_due"
            | "incomplete"
            | "unpaid"
            | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          stripe_event_ids: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          stripe_customer_id?: string | null;
          status?:
            | "active"
            | "trialing"
            | "canceled"
            | "past_due"
            | "incomplete"
            | "unpaid"
            | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          stripe_event_ids?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          stripe_customer_id?: string | null;
          status?:
            | "active"
            | "trialing"
            | "canceled"
            | "past_due"
            | "incomplete"
            | "unpaid"
            | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          stripe_event_ids?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      portfolio_analytics: {
        Row: {
          id: string;
          portfolio_id: string;
          session_hash: string;
          referrer: string | null;
          is_bot: boolean;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          portfolio_id: string;
          session_hash: string;
          referrer?: string | null;
          is_bot?: boolean;
          viewed_at?: string;
        };
        Update: {
          referrer?: string | null;
          is_bot?: boolean;
        };
        Relationships: [];
      };
      portfolio_link_clicks: {
        Row: {
          id: string;
          portfolio_id: string;
          link_type:
            | "email"
            | "tiktok"
            | "instagram"
            | "youtube"
            | "linkedin"
            | "other";
          clicked_at: string;
        };
        Insert: {
          id?: string;
          portfolio_id: string;
          link_type:
            | "email"
            | "tiktok"
            | "instagram"
            | "youtube"
            | "linkedin"
            | "other";
          clicked_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          portfolio_id: string;
          motif: "nsfw" | "haineux" | "spam" | "autre";
          description: string | null;
          reporter_hash: string | null;
          status: "pending" | "reviewed" | "dismissed" | "actioned";
          created_at: string;
        };
        Insert: {
          id?: string;
          portfolio_id: string;
          motif: "nsfw" | "haineux" | "spam" | "autre";
          description?: string | null;
          reporter_hash?: string | null;
          status?: "pending" | "reviewed" | "dismissed" | "actioned";
          created_at?: string;
        };
        Update: {
          status?: "pending" | "reviewed" | "dismissed" | "actioned";
        };
        Relationships: [];
      };
      app_config: {
        Row: {
          key: string;
          value: Json;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          value?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_audit_log: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_type: string;
          target_id: string;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          target_type: string;
          target_id: string;
          details?: Json | null;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string | null;
          guest_email: string | null;
          guest_name: string | null;
          subject: string;
          category:
            | "general"
            | "inscription"
            | "technique"
            | "billing"
            | "autre";
          status:
            | "open"
            | "in_progress"
            | "waiting_user"
            | "resolved"
            | "closed";
          priority: "low" | "normal" | "high" | "urgent";
          admin_note: string | null;
          assigned_to: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          guest_email?: string | null;
          guest_name?: string | null;
          subject: string;
          category?:
            | "general"
            | "inscription"
            | "technique"
            | "billing"
            | "autre";
          status?:
            | "open"
            | "in_progress"
            | "waiting_user"
            | "resolved"
            | "closed";
          priority?: "low" | "normal" | "high" | "urgent";
          admin_note?: string | null;
          assigned_to?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          subject?: string;
          category?:
            | "general"
            | "inscription"
            | "technique"
            | "billing"
            | "autre";
          status?:
            | "open"
            | "in_progress"
            | "waiting_user"
            | "resolved"
            | "closed";
          priority?: "low" | "normal" | "high" | "urgent";
          admin_note?: string | null;
          assigned_to?: string | null;
          resolved_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      support_messages: {
        Row: {
          id: string;
          ticket_id: string;
          sender_type: "user" | "guest" | "admin";
          sender_id: string | null;
          content: string;
          is_internal: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          sender_type: "user" | "guest" | "admin";
          sender_id?: string | null;
          content: string;
          is_internal?: boolean;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      storage_usage: {
        Row: {
          id: string;
          user_id: string;
          portfolio_id: string | null;
          file_key: string;
          file_size: number;
          mime_type: string | null;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          portfolio_id?: string | null;
          file_key: string;
          file_size: number;
          mime_type?: string | null;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          portfolio_id?: string | null;
          file_key?: string;
          file_size?: number;
          mime_type?: string | null;
          display_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Types raccourcis pour usage courant dans l'application
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Portfolio = Database["public"]["Tables"]["portfolios"]["Row"];
export type PortfolioInsert =
  Database["public"]["Tables"]["portfolios"]["Insert"];
export type PortfolioUpdate =
  Database["public"]["Tables"]["portfolios"]["Update"];

export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type PortfolioAnalytics =
  Database["public"]["Tables"]["portfolio_analytics"]["Row"];
export type PortfolioLinkClick =
  Database["public"]["Tables"]["portfolio_link_clicks"]["Row"];
export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type AppConfig = Database["public"]["Tables"]["app_config"]["Row"];
export type AuditLog = Database["public"]["Tables"]["admin_audit_log"]["Row"];
export type SupportTicket =
  Database["public"]["Tables"]["support_tickets"]["Row"];
export type SupportMessage =
  Database["public"]["Tables"]["support_messages"]["Row"];
export type StorageUsage = Database["public"]["Tables"]["storage_usage"]["Row"];

export type Plan = Profile["plan"];
export type PortfolioStatus = Portfolio["status"];
export type SubscriptionStatus = Subscription["status"];
