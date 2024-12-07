export interface Enemy {
  name: string;
  health: number;
  maxHealth: number;
  damage: number;
  icon: string;
}

export interface CombatState {
  isActive: boolean;
  enemy: Enemy | null;
  playerTurn: boolean;
  combatLog: string[];
} 