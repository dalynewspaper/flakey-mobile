export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      auth_verification_log: {
        Row: {
          channel: Database["public"]["Enums"]["auth_channel"]
          created_at: string
          failure_reason:
            | Database["public"]["Enums"]["auth_failure_reason"]
            | null
          id: string
          locale: string | null
          metadata: Json
          resend_count: number
          session_age_ms: number | null
          success: boolean
          user_id: string | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["auth_channel"]
          created_at?: string
          failure_reason?:
            | Database["public"]["Enums"]["auth_failure_reason"]
            | null
          id?: string
          locale?: string | null
          metadata?: Json
          resend_count?: number
          session_age_ms?: number | null
          success: boolean
          user_id?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["auth_channel"]
          created_at?: string
          failure_reason?:
            | Database["public"]["Enums"]["auth_failure_reason"]
            | null
          id?: string
          locale?: string | null
          metadata?: Json
          resend_count?: number
          session_age_ms?: number | null
          success?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      birthday_requests: {
        Row: {
          birthday: string
          created_at: string
          id: string
          is_processed: boolean
          name: string
          notes: string | null
          requester_id: string
          submitter_email: string | null
          updated_at: string
          year_known: boolean
        }
        Insert: {
          birthday: string
          created_at?: string
          id?: string
          is_processed?: boolean
          name: string
          notes?: string | null
          requester_id: string
          submitter_email?: string | null
          updated_at?: string
          year_known?: boolean
        }
        Update: {
          birthday?: string
          created_at?: string
          id?: string
          is_processed?: boolean
          name?: string
          notes?: string | null
          requester_id?: string
          submitter_email?: string | null
          updated_at?: string
          year_known?: boolean
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          app_version: string | null
          created_at: string
          device_name: string | null
          id: string
          last_seen_at: string
          platform: string
          token: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          device_name?: string | null
          id?: string
          last_seen_at?: string
          platform?: string
          token: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          created_at?: string
          device_name?: string | null
          id?: string
          last_seen_at?: string
          platform?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_subscription_preferences: {
        Row: {
          category: string
          created_at: string
          email: string
          id: string
          opted_out: boolean
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          email: string
          id?: string
          opted_out?: boolean
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          email?: string
          id?: string
          opted_out?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      event_memories: {
        Row: {
          created_at: string
          event_id: string
          id: string
          memory_text: string | null
          mood: string | null
          occurrence_year: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          memory_text?: string | null
          mood?: string | null
          occurrence_year: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          memory_text?: string | null
          mood?: string | null
          occurrence_year?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_memories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          date_type: Database["public"]["Enums"]["date_type"]
          date_value: string | null
          default_budget: number | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          importance: number
          is_active: boolean
          is_suggested: boolean
          person_id: string | null
          region: string
          relative_rule: Json | null
          suggested_reason: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_type?: Database["public"]["Enums"]["date_type"]
          date_value?: string | null
          default_budget?: number | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          importance?: number
          is_active?: boolean
          is_suggested?: boolean
          person_id?: string | null
          region?: string
          relative_rule?: Json | null
          suggested_reason?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_type?: Database["public"]["Enums"]["date_type"]
          date_value?: string | null
          default_budget?: number | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          importance?: number
          is_active?: boolean
          is_suggested?: boolean
          person_id?: string | null
          region?: string
          relative_rule?: Json | null
          suggested_reason?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_history: {
        Row: {
          category: string | null
          created_at: string
          event_id: string | null
          gifted_at: string
          id: string
          item_name: string
          link: string | null
          notes: string | null
          person_id: string
          price: number | null
          rating: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          event_id?: string | null
          gifted_at: string
          id?: string
          item_name: string
          link?: string | null
          notes?: string | null
          person_id: string
          price?: number | null
          rating?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          event_id?: string | null
          gifted_at?: string
          id?: string
          item_name?: string
          link?: string | null
          notes?: string | null
          person_id?: string
          price?: number | null
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_history_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_history_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_preferences: {
        Row: {
          avoid_repeats: boolean
          budget_default: number | null
          created_at: string
          gift_styles: Database["public"]["Enums"]["gift_style"][]
          id: string
          notes: string | null
          person_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avoid_repeats?: boolean
          budget_default?: number | null
          created_at?: string
          gift_styles?: Database["public"]["Enums"]["gift_style"][]
          id?: string
          notes?: string | null
          person_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avoid_repeats?: boolean
          budget_default?: number | null
          created_at?: string
          gift_styles?: Database["public"]["Enums"]["gift_style"][]
          id?: string
          notes?: string | null
          person_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_preferences_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_requests: {
        Row: {
          approved_at: string | null
          budget_cents: number | null
          category: Database["public"]["Enums"]["gift_request_category"]
          created_at: string
          currency: string
          deliver_by: string | null
          event_id: string | null
          external_refs: Json
          fulfilled_at: string | null
          id: string
          metadata: Json
          notes: string | null
          nudge_id: string | null
          ops_notes: string | null
          person_id: string | null
          plan: Json
          status: Database["public"]["Enums"]["gift_request_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          budget_cents?: number | null
          category: Database["public"]["Enums"]["gift_request_category"]
          created_at?: string
          currency?: string
          deliver_by?: string | null
          event_id?: string | null
          external_refs?: Json
          fulfilled_at?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          nudge_id?: string | null
          ops_notes?: string | null
          person_id?: string | null
          plan?: Json
          status?: Database["public"]["Enums"]["gift_request_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          budget_cents?: number | null
          category?: Database["public"]["Enums"]["gift_request_category"]
          created_at?: string
          currency?: string
          deliver_by?: string | null
          event_id?: string | null
          external_refs?: Json
          fulfilled_at?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          nudge_id?: string | null
          ops_notes?: string | null
          person_id?: string | null
          plan?: Json
          status?: Database["public"]["Enums"]["gift_request_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gift_suggestions: {
        Row: {
          created_at: string
          event_id: string
          id: string
          person_id: string
          suggested_gestures: Json
          suggested_items: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          person_id: string
          suggested_gestures?: Json
          suggested_items?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          person_id?: string
          suggested_gestures?: Json
          suggested_items?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_suggestions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_suggestions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_photos: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number
          id: string
          memory_id: string
          photo_url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          memory_id: string
          photo_url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          memory_id?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_photos_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "event_memories"
            referencedColumns: ["id"]
          },
        ]
      }
      nudge_deliveries: {
        Row: {
          channel: Database["public"]["Enums"]["nudge_channel"]
          created_at: string
          error_message: string | null
          external_id: string | null
          id: string
          metadata: Json
          nudge_id: string
          status: string
          user_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["nudge_channel"]
          created_at?: string
          error_message?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json
          nudge_id: string
          status?: string
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["nudge_channel"]
          created_at?: string
          error_message?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json
          nudge_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nudge_deliveries_nudge_id_fkey"
            columns: ["nudge_id"]
            isOneToOne: false
            referencedRelation: "nudges"
            referencedColumns: ["id"]
          },
        ]
      }
      nudges: {
        Row: {
          actioned_at: string | null
          calendar_payload: Json | null
          created_at: string
          drafted_message: string | null
          event_id: string | null
          expires_at: string | null
          gift_shortlist: Json
          id: string
          importance: number
          metadata: Json
          person_id: string | null
          reason: string
          snoozed_until: string | null
          status: Database["public"]["Enums"]["nudge_status"]
          title: string
          trigger_type: Database["public"]["Enums"]["nudge_trigger"]
          updated_at: string
          user_id: string
        }
        Insert: {
          actioned_at?: string | null
          calendar_payload?: Json | null
          created_at?: string
          drafted_message?: string | null
          event_id?: string | null
          expires_at?: string | null
          gift_shortlist?: Json
          id?: string
          importance?: number
          metadata?: Json
          person_id?: string | null
          reason: string
          snoozed_until?: string | null
          status?: Database["public"]["Enums"]["nudge_status"]
          title: string
          trigger_type: Database["public"]["Enums"]["nudge_trigger"]
          updated_at?: string
          user_id: string
        }
        Update: {
          actioned_at?: string | null
          calendar_payload?: Json | null
          created_at?: string
          drafted_message?: string | null
          event_id?: string | null
          expires_at?: string | null
          gift_shortlist?: Json
          id?: string
          importance?: number
          metadata?: Json
          person_id?: string | null
          reason?: string
          snoozed_until?: string | null
          status?: Database["public"]["Enums"]["nudge_status"]
          title?: string
          trigger_type?: Database["public"]["Enums"]["nudge_trigger"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          created_at: string
          dislikes: string[]
          first_name: string
          id: string
          interests: string[]
          last_name: string | null
          location_city: string | null
          location_country: string | null
          nickname: string | null
          notes: string | null
          relationship_type: Database["public"]["Enums"]["relationship_type"]
          shipping_address: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          dislikes?: string[]
          first_name: string
          id?: string
          interests?: string[]
          last_name?: string | null
          location_city?: string | null
          location_country?: string | null
          nickname?: string | null
          notes?: string | null
          relationship_type?: Database["public"]["Enums"]["relationship_type"]
          shipping_address?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          dislikes?: string[]
          first_name?: string
          id?: string
          interests?: string[]
          last_name?: string | null
          location_city?: string | null
          location_country?: string | null
          nickname?: string | null
          notes?: string | null
          relationship_type?: Database["public"]["Enums"]["relationship_type"]
          shipping_address?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birthday_request_token: string
          created_at: string
          default_currency: string
          email: string
          email_reminders_enabled: boolean
          id: string
          name: string | null
          nudges_channels: string[]
          nudges_enabled: boolean
          nudges_last_generated_at: string | null
          preferred_locale: string
          sms_number: string | null
          sms_reminders_enabled: boolean
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          timezone: string
          updated_at: string
          whatsapp_number: string | null
          whatsapp_reminders_enabled: boolean
        }
        Insert: {
          birthday_request_token: string
          created_at?: string
          default_currency?: string
          email: string
          email_reminders_enabled?: boolean
          id: string
          name?: string | null
          nudges_channels?: string[]
          nudges_enabled?: boolean
          nudges_last_generated_at?: string | null
          preferred_locale?: string
          sms_number?: string | null
          sms_reminders_enabled?: boolean
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          timezone?: string
          updated_at?: string
          whatsapp_number?: string | null
          whatsapp_reminders_enabled?: boolean
        }
        Update: {
          birthday_request_token?: string
          created_at?: string
          default_currency?: string
          email?: string
          email_reminders_enabled?: boolean
          id?: string
          name?: string | null
          nudges_channels?: string[]
          nudges_enabled?: boolean
          nudges_last_generated_at?: string | null
          preferred_locale?: string
          sms_number?: string | null
          sms_reminders_enabled?: boolean
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          timezone?: string
          updated_at?: string
          whatsapp_number?: string | null
          whatsapp_reminders_enabled?: boolean
        }
        Relationships: []
      }
      purchases: {
        Row: {
          affiliate_url: string | null
          clicked_at: string
          event_id: string | null
          id: string
          notes: string | null
          outbound_url: string | null
          person_id: string | null
          purchased_flag: boolean
          user_id: string
          vendor: string | null
        }
        Insert: {
          affiliate_url?: string | null
          clicked_at?: string
          event_id?: string | null
          id?: string
          notes?: string | null
          outbound_url?: string | null
          person_id?: string | null
          purchased_flag?: boolean
          user_id: string
          vendor?: string | null
        }
        Update: {
          affiliate_url?: string | null
          clicked_at?: string
          event_id?: string | null
          id?: string
          notes?: string | null
          outbound_url?: string | null
          person_id?: string | null
          purchased_flag?: boolean
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      relationships: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          person_a_id: string
          person_b_id: string
          relation: Database["public"]["Enums"]["relation_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          person_a_id: string
          person_b_id: string
          relation: Database["public"]["Enums"]["relation_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          person_a_id?: string
          person_b_id?: string
          relation?: Database["public"]["Enums"]["relation_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationships_person_a_id_fkey"
            columns: ["person_a_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationships_person_b_id_fkey"
            columns: ["person_b_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_rules: {
        Row: {
          channel: Database["public"]["Enums"]["reminder_channel"]
          created_at: string
          enabled: boolean
          event_id: string
          id: string
          offsets_days: number[]
          updated_at: string
          user_id: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["reminder_channel"]
          created_at?: string
          enabled?: boolean
          event_id: string
          id?: string
          offsets_days?: number[]
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["reminder_channel"]
          created_at?: string
          enabled?: boolean
          event_id?: string
          id?: string
          offsets_days?: number[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_rules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      sent_reminders: {
        Row: {
          channel: Database["public"]["Enums"]["reminder_channel"]
          days_before: number | null
          event_id: string
          id: string
          occurrence_date: string
          reminder_rule_id: string | null
          reminder_year: number | null
          sent_at: string
          user_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["reminder_channel"]
          days_before?: number | null
          event_id: string
          id?: string
          occurrence_date: string
          reminder_rule_id?: string | null
          reminder_year?: number | null
          sent_at?: string
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["reminder_channel"]
          days_before?: number | null
          event_id?: string
          id?: string
          occurrence_date?: string
          reminder_rule_id?: string | null
          reminder_year?: number | null
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sent_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sent_reminders_reminder_rule_id_fkey"
            columns: ["reminder_rule_id"]
            isOneToOne: false
            referencedRelation: "reminder_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_list_claims: {
        Row: {
          claimed_at: string
          claimed_by: string
          events_created: number
          id: string
          people_created: number
          shared_list_id: string
        }
        Insert: {
          claimed_at?: string
          claimed_by: string
          events_created?: number
          id?: string
          people_created?: number
          shared_list_id: string
        }
        Update: {
          claimed_at?: string
          claimed_by?: string
          events_created?: number
          id?: string
          people_created?: number
          shared_list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_list_claims_shared_list_id_fkey"
            columns: ["shared_list_id"]
            isOneToOne: false
            referencedRelation: "shared_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_lists: {
        Row: {
          claim_count: number
          created_at: string
          id: string
          include_mode: string
          message: string
          owner_id: string
          person_ids: string[]
          revoked_at: string | null
          selected_event_types: string[]
          token: string
          updated_at: string
        }
        Insert: {
          claim_count?: number
          created_at?: string
          id?: string
          include_mode?: string
          message?: string
          owner_id: string
          person_ids?: string[]
          revoked_at?: string | null
          selected_event_types?: string[]
          token: string
          updated_at?: string
        }
        Update: {
          claim_count?: number
          created_at?: string
          id?: string
          include_mode?: string
          message?: string
          owner_id?: string
          person_ids?: string[]
          revoked_at?: string | null
          selected_event_types?: string[]
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      suggestion_click_events: {
        Row: {
          auto_prompt: string | null
          created_at: string
          event_id: string | null
          id: string
          metadata: Json
          outcome: string
          person_id: string | null
          source: string
          suggestion_label: string
          user_id: string
        }
        Insert: {
          auto_prompt?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          metadata?: Json
          outcome?: string
          person_id?: string | null
          source: string
          suggestion_label: string
          user_id: string
        }
        Update: {
          auto_prompt?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          metadata?: Json
          outcome?: string
          person_id?: string | null
          source?: string
          suggestion_label?: string
          user_id?: string
        }
        Relationships: []
      }
      suggestion_queue: {
        Row: {
          action_data: Json
          created_at: string
          description: string | null
          id: string
          is_accepted: boolean
          is_dismissed: boolean
          person_id: string | null
          reason: string | null
          suggestion_type: string
          title: string
          user_id: string
        }
        Insert: {
          action_data?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_accepted?: boolean
          is_dismissed?: boolean
          person_id?: string | null
          reason?: string | null
          suggestion_type: string
          title: string
          user_id: string
        }
        Update: {
          action_data?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_accepted?: boolean
          is_dismissed?: boolean
          person_id?: string | null
          reason?: string | null
          suggestion_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_queue_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      ui_layout_events: {
        Row: {
          created_at: string
          details: Json
          device_pixel_ratio: number | null
          event_type: string
          id: string
          screen: string
          severity: string
          step: string | null
          user_agent: string | null
          user_id: string | null
          viewport_height: number | null
          viewport_width: number | null
        }
        Insert: {
          created_at?: string
          details?: Json
          device_pixel_ratio?: number | null
          event_type: string
          id?: string
          screen: string
          severity?: string
          step?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Update: {
          created_at?: string
          details?: Json
          device_pixel_ratio?: number | null
          event_type?: string
          id?: string
          screen?: string
          severity?: string
          step?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Relationships: []
      }
      upload_error_log: {
        Row: {
          bucket: string | null
          context: Json | null
          created_at: string
          id: string
          message: string | null
          object_path: string | null
          provider_error: Json | null
          status_code: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          bucket?: string | null
          context?: Json | null
          created_at?: string
          id?: string
          message?: string | null
          object_path?: string | null
          provider_error?: Json | null
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          bucket?: string | null
          context?: Json | null
          created_at?: string
          id?: string
          message?: string | null
          object_path?: string | null
          provider_error?: Json | null
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_auth_codes: {
        Row: {
          attempts: number
          code_hash: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          phone_e164: string
        }
        Insert: {
          attempts?: number
          code_hash: string
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          phone_e164: string
        }
        Update: {
          attempts?: number
          code_hash?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          phone_e164?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          created_at: string
          direction: string
          id: string
          message_body: string
          user_id: string
          whatsapp_sid: string | null
        }
        Insert: {
          created_at?: string
          direction: string
          id?: string
          message_body: string
          user_id: string
          whatsapp_sid?: string | null
        }
        Update: {
          created_at?: string
          direction?: string
          id?: string
          message_body?: string
          user_id?: string
          whatsapp_sid?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_shared_list: { Args: { _token: string }; Returns: Json }
      count_recent_nudges: {
        Args: { _days: number; _user_id: string }
        Returns: number
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_shared_list_preview: { Args: { _token: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      purge_auth_verification_log: { Args: never; Returns: number }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      rotate_birthday_request_token: { Args: never; Returns: string }
      submit_birthday_request: {
        Args: {
          _birthday: string
          _name: string
          _notes?: string
          _submitter_email?: string
          _token: string
          _year_known: boolean
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      auth_channel: "email" | "sms"
      auth_failure_reason:
        | "expired"
        | "invalid"
        | "rate_limited"
        | "network"
        | "unknown"
      date_type: "exact_date" | "recurring_annual" | "relative_rule"
      event_type:
        | "birthday"
        | "anniversary"
        | "christmas"
        | "mothers_day"
        | "fathers_day"
        | "valentines"
        | "custom"
      gift_request_category: "flowers" | "card" | "restaurant" | "bundle"
      gift_request_status:
        | "drafting"
        | "awaiting_approval"
        | "approved"
        | "in_progress"
        | "fulfilled"
        | "cancelled"
        | "failed"
      gift_style:
        | "practical"
        | "sentimental"
        | "experiential"
        | "food"
        | "books"
        | "fashion"
        | "tech"
        | "handmade"
      nudge_channel: "in_app" | "whatsapp" | "email"
      nudge_status: "pending" | "actioned" | "dismissed" | "snoozed"
      nudge_trigger:
        | "upcoming_event"
        | "a_while"
        | "check_in"
        | "milestone"
        | "memory_anniversary"
      relation_type:
        | "parent_of"
        | "child_of"
        | "sibling_of"
        | "partner_of"
        | "friend_of"
        | "coworker_of"
      relationship_type:
        | "parent"
        | "partner"
        | "friend"
        | "sibling"
        | "colleague"
        | "mentor"
        | "child"
        | "other"
      reminder_channel: "email" | "push" | "in_app" | "sms" | "whatsapp"
      subscription_tier: "free" | "pro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      auth_channel: ["email", "sms"],
      auth_failure_reason: [
        "expired",
        "invalid",
        "rate_limited",
        "network",
        "unknown",
      ],
      date_type: ["exact_date", "recurring_annual", "relative_rule"],
      event_type: [
        "birthday",
        "anniversary",
        "christmas",
        "mothers_day",
        "fathers_day",
        "valentines",
        "custom",
      ],
      gift_request_category: ["flowers", "card", "restaurant", "bundle"],
      gift_request_status: [
        "drafting",
        "awaiting_approval",
        "approved",
        "in_progress",
        "fulfilled",
        "cancelled",
        "failed",
      ],
      gift_style: [
        "practical",
        "sentimental",
        "experiential",
        "food",
        "books",
        "fashion",
        "tech",
        "handmade",
      ],
      nudge_channel: ["in_app", "whatsapp", "email"],
      nudge_status: ["pending", "actioned", "dismissed", "snoozed"],
      nudge_trigger: [
        "upcoming_event",
        "a_while",
        "check_in",
        "milestone",
        "memory_anniversary",
      ],
      relation_type: [
        "parent_of",
        "child_of",
        "sibling_of",
        "partner_of",
        "friend_of",
        "coworker_of",
      ],
      relationship_type: [
        "parent",
        "partner",
        "friend",
        "sibling",
        "colleague",
        "mentor",
        "child",
        "other",
      ],
      reminder_channel: ["email", "push", "in_app", "sms", "whatsapp"],
      subscription_tier: ["free", "pro"],
    },
  },
} as const
