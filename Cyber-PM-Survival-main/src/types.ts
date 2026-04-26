export type Phase = 'MENU' | 'INTERVIEW' | 'PROBATION' | 'PURGATORY' | 'PROMOTION' | 'ENDING';

export interface GameState {
  phase: Phase;
  level: string; // P5, P6, P7, P8, P9
  attributes: {
    owner: number; // 0-100 Blue
    communication: number; // 0-100 Purple
    logic: number; // 0-100 Gold
    cronyism: number; // 0-100 Hidden
    sanity: number; // 0-100 Percentage
  };
  performance: {
    score: number; // 0-5
    history: number[];
  };
  ending: 'A' | 'B' | 'C' | 'D' | null;
}

export const INITIAL_STATE: GameState = {
  phase: 'MENU',
  level: 'P1',
  attributes: {
    owner: 20,
    communication: 20,
    logic: 20,
    cronyism: 0,
    sanity: 100,
  },
  performance: {
    score: 0,
    history: [],
  },
  ending: null,
};
