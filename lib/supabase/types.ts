/**
 * Database types — kept hand-maintained for the beta. Once schema stabilizes,
 * we can generate these with `supabase gen types typescript`.
 */

export type BookingStatus = 'active' | 'cancelled' | 'completed';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  locale: string;
  telegram_chat_id: number | null;
  telegram_link_token: string | null;
  telegram_link_expires_at: string | null;
  inbound_token: string | null;
  inbound_token_created_at: string | null;
  notification_prefs: {
    email: boolean;
    in_app: boolean;
    telegram: boolean;
  };
  alert_pct_default: number;
  alert_amount_ils_default: number;
  created_at: string;
  updated_at: string;
}

export type InboundEmailStatus = 'received' | 'parsed' | 'created' | 'skipped' | 'error';

export interface InboundEmail {
  id: string;
  user_id: string;
  message_id: string;
  from_address: string;
  to_address: string;
  subject: string | null;
  detected_source: string | null;
  status: InboundEmailStatus;
  booking_id: string | null;
  error: string | null;
  raw_storage_path: string | null;
  received_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  source: string;
  url: string;
  hotel_name: string | null;
  hotel_image_url: string | null;
  hotel_city: string | null;
  hotel_country: string | null;
  hotel_lat: number | null;
  hotel_lng: number | null;
  check_in: string;
  check_out: string;
  guests: { adults: number; children: number; rooms: number; children_ages?: number[] } | null;
  room_type: string | null;
  meal_plan: string | null;
  cancellation: string | null;
  cancellation_deadline: string | null;
  cancellation_reminder_sent_at: string | null;
  currency: string;
  paid_price: number;
  paid_price_ils: number | null;
  last_price: number | null;
  /** Booking's strikethrough "original" price for the matched rate (null when
   * no discount is shown). Use to render "from ₪X" alongside last_price. */
  last_original_price: number | null;
  /** Confidence score of the matched rate (0-1). Null when never checked.
   * Below 0.5: don't show a price-drop diff — the comparison isn't trustworthy. */
  last_match_score: number | null;
  last_currency: string | null;
  last_checked_at: string | null;
  last_alert_sent_at: string | null;
  alert_pct: number;
  alert_amount_ils: number;
  status: BookingStatus;
  source_image_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriceCandidate {
  room: string;
  meal: string;
  amount: number;
  currency: string;
  score: number;
}

export interface PriceCheck {
  id: string;
  booking_id: string;
  checked_at: string;
  price: number | null;
  /** Strikethrough/pre-discount price when Booking showed one. */
  original_price: number | null;
  currency: string | null;
  match_score: number | null;
  matched_room: string | null;
  matched_meal: string | null;
  candidates: PriceCandidate[] | null;
  error: string | null;
}

export type NotificationKind = 'price_drop' | 'check_failed' | 'system' | 'welcome' | 'cancellation_deadline';

export interface Notification {
  id: string;
  user_id: string;
  booking_id: string | null;
  kind: NotificationKind;
  title: string;
  body: string | null;
  payload: Record<string, unknown> | null;
  read_at: string | null;
  email_sent_at: string | null;
  telegram_sent_at: string | null;
  created_at: string;
}
