export type CheckoutSeat = {
  id: string;
  row: string;
  section: string;
  label: string;
  price: number;
};

export type CheckoutEvent = {
  _id: string;
  title: string;
  venue?: string;
  eventDate?: string | Date;
  startTime?: string;
  endTime?: string;
};

export type CheckoutPayload = {
  event: CheckoutEvent;
  seats: CheckoutSeat[];
  subtotal: number;
  createdAt?: string;
};

const STORAGE_KEY = 'checkout_payload_v1';

export function saveCheckout(payload: CheckoutPayload) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    // ignore
  }
}

export function loadCheckout(): CheckoutPayload | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CheckoutPayload;
  } catch (e) {
    return null;
  }
}

export function clearCheckout() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}
