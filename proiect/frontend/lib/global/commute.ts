import AsyncStorage from '@react-native-async-storage/async-storage';

import type { EventItem } from '@/types';

const COMMUTE_INVALIDATED_PREFIX = 'focusflow.commute.invalidated.';

function todayKey() {
  return `${COMMUTE_INVALIDATED_PREFIX}${new Date().toISOString().slice(0, 10)}`;
}

export async function markTodayCommuteInvalidated() {
  await AsyncStorage.setItem(todayKey(), 'true');
}

export async function isTodayCommuteInvalidated() {
  return (await AsyncStorage.getItem(todayKey())) === 'true';
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => value * Math.PI / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export interface CommuteCardData {
  id: string;
  fromEventId: string;
  toEventId: string;
  toStartTime?: string;
  latitude?: number | null;
  longitude?: number | null;
  canWalk: boolean | null;
  walkingMinutes: number | null;
  drivingMinutes: number | null;
}

export function buildCommuteCards(events: EventItem[]): CommuteCardData[] {
  return events
    .slice()
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(1)
    .map((toEvent, index) => {
      const fromEvent = events
        .slice()
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[index];

      const from = fromEvent.location;
      const to = toEvent.location;

      if (
        from?.latitude == null
        || from?.longitude == null
        || to?.latitude == null
        || to?.longitude == null
      ) {
        return {
          id: `${fromEvent.id}-${toEvent.id}`,
          fromEventId: fromEvent.id,
          toEventId: toEvent.id,
          toStartTime: toEvent.startTime,
          latitude: to?.latitude ?? null,
          longitude: to?.longitude ?? null,
          canWalk: null,
          walkingMinutes: null,
          drivingMinutes: null
        };
      }

      const distanceKm = haversineKm(from.latitude, from.longitude, to.latitude, to.longitude);
      const walkingMinutes = Math.max(2, Math.round((distanceKm / 4.7) * 60));
      const drivingMinutes = Math.max(2, Math.round((distanceKm / 28) * 60));

      return {
        id: `${fromEvent.id}-${toEvent.id}`,
        fromEventId: fromEvent.id,
        toEventId: toEvent.id,
        toStartTime: toEvent.startTime,
        latitude: to.latitude,
        longitude: to.longitude,
        canWalk: walkingMinutes <= 35,
        walkingMinutes,
        drivingMinutes
      };
    });
}

export function isTodayDate(value: string) {
  return value === new Date().toISOString().slice(0, 10);
}
