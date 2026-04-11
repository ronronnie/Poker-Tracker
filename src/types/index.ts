export type SubscriptionTier = "free" | "pro" | "premium";
export type SubscriptionStatus = "active" | "inactive" | "trialing" | "canceled";
export type GameType = "cash" | "tournament" | "sit_and_go";
export type GroupRole = "admin" | "member";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  currency: string;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  date: string;
  venue: string | null;
  game_type: GameType;
  stakes: string | null;
  buy_in: number;
  cash_out: number;
  duration_minutes: number | null;
  notes: string | null;
  group_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  invite_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupRole;
  joined_at: string;
}

export interface HandHistory {
  id: string;
  user_id: string;
  session_id: string | null;
  date: string;
  hero_cards: string[] | null;
  board_cards: string[] | null;
  position: string | null;
  pot_size: number | null;
  outcome: number | null;
  notes: string | null;
  created_at: string;
}

// Derived / UI types
export interface SessionWithPnL extends Session {
  pnl: number;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  total_winnings: number;
  sessions_played: number;
  rank: number;
}
