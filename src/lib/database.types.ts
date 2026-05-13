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
      locations: {
        Row: {
          city: string | null;
          created_at: string;
          id: string;
          name: string;
          region: string | null;
        };
        Insert: {
          city?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          region?: string | null;
        };
        Update: {
          city?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          region?: string | null;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          buyer_id: string;
          created_at: string;
          id: string;
          item_id: string | null;
          seller_id: string;
          updated_at: string;
        };
        Insert: {
          buyer_id: string;
          created_at?: string;
          id?: string;
          item_id?: string | null;
          seller_id: string;
          updated_at?: string;
        };
        Update: {
          buyer_id?: string;
          created_at?: string;
          id?: string;
          item_id?: string | null;
          seller_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "marketplace_items";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          location_id: string | null;
          created_at: string;
          display_name: string | null;
          first_name: string;
          id: string;
          last_name: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          location_id?: string | null;
          created_at?: string;
          display_name?: string | null;
          first_name: string;
          id: string;
          last_name: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          location_id?: string | null;
          created_at?: string;
          display_name?: string | null;
          first_name?: string;
          id?: string;
          last_name?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          }
        ];
      };
      marketplace_items: {
        Row: {
          author: string | null;
          location_id: string | null;
          condition: Database["public"]["Enums"]["listing_condition"];
          course_code: string | null;
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          isbn: string | null;
          price_cents: number;
          seller_email: string;
          seller_name: string;
          status: Database["public"]["Enums"]["listing_status"];
          title: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          author?: string | null;
          location_id?: string | null;
          condition?: Database["public"]["Enums"]["listing_condition"];
          course_code?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          isbn?: string | null;
          price_cents: number;
          seller_email: string;
          seller_name: string;
          status?: Database["public"]["Enums"]["listing_status"];
          title: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          author?: string | null;
          location_id?: string | null;
          condition?: Database["public"]["Enums"]["listing_condition"];
          course_code?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          isbn?: string | null;
          price_cents?: number;
          seller_email?: string;
          seller_name?: string;
          status?: Database["public"]["Enums"]["listing_status"];
          title?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "marketplace_items_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "marketplace_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: {
          body: string;
          conversation_id: string;
          created_at: string;
          id: string;
          read_at: string | null;
          sender_id: string;
        };
        Insert: {
          body: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          sender_id: string;
        };
        Update: {
          body?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      listing_condition: "new" | "like_new" | "good" | "fair" | "worn";
      listing_status: "active" | "pending" | "sold" | "archived";
    };
    CompositeTypes: Record<never, never>;
  };
};
