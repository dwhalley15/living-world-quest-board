import type { Character } from "./character";

export interface Quest {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  partySize: number;
  partyLeader: Character | null;
  currentParty: Character[];
  isCompleted: boolean;
  completionMessage?: string;
  createdBy: string;
  rotation: number;
  createdByName: string;
}