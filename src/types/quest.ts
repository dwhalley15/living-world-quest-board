export interface Quest {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  partySize: number;
  currentParty: string[];
  isCompleted: boolean;
  completionMessage?: string;
  createdBy: string;
  rotation: number;
}