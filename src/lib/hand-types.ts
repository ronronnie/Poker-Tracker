export type CardCode = string; // e.g. "Ah", "Kd", "2s", "Tc"
export type ActionType = "fold" | "check" | "call" | "bet" | "raise" | "all_in";

export type PlayerSetup = {
  id: string; // local ID (nanoid or crypto.randomUUID)
  name: string;
  position: string; // UTG, UTG+1, LJ, HJ, CO, BTN, SB, BB
  is_hero: boolean;
  hole_cards: CardCode[]; // 0, 1, or 2 cards
};

export type PlayerAction = {
  player_id: string;
  player_name: string;
  position: string;
  is_hero: boolean;
  action: ActionType;
  amount?: number;
};

export type ShowdownPlayer = {
  player_id: string;
  player_name: string;
  position: string;
  hole_cards: CardCode[];
  is_winner: boolean;
};

export type HandData = {
  players: PlayerSetup[];
  preflop: { actions: PlayerAction[] };
  flop?: { cards: CardCode[]; actions: PlayerAction[] };
  turn?: { cards: CardCode[]; actions: PlayerAction[] };
  river?: { cards: CardCode[]; actions: PlayerAction[] };
  showdown?: ShowdownPlayer[];
};
