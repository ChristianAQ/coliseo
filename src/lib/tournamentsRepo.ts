import { collection, doc, getDoc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Tournament } from '@/types';

const COLLECTION = 'tournaments';
const LAST_TOURNAMENT_KEY = 'coliseo:lastTournamentId';

export async function saveTournament(tournament: Tournament): Promise<void> {
  await setDoc(doc(db, COLLECTION, tournament.id), tournament);
}

export async function listTournaments(): Promise<Tournament[]> {
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => d.data() as Tournament);
}

export async function loadTournament(id: string): Promise<Tournament | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? (snap.data() as Tournament) : null;
}

export function rememberLastTournamentId(id: string) {
  localStorage.setItem(LAST_TOURNAMENT_KEY, id);
}

export function getLastTournamentId(): string | null {
  return localStorage.getItem(LAST_TOURNAMENT_KEY);
}

export function forgetLastTournamentId() {
  localStorage.removeItem(LAST_TOURNAMENT_KEY);
}
