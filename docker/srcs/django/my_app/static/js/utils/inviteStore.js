const invites = new Map();
const listeners = new Set();

export function addInvite(inv) {
  invites.set(inv.pending_id, inv);
  notify();
}

export function removeInvite(pid) {
  invites.delete(pid);
  notify();
}

export function getInvites() {
  return [...invites.values()];
}

export function subscribe(fn) {
  listeners.add(fn);
}

export function unsubscribe(fn) {
  listeners.delete(fn);
}

function notify() {
  const list = [...invites.values()];
  for (const fn of listeners) fn(list);
}