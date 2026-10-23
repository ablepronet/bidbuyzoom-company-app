import { navigationRef } from '../navigation/navigationService';
import { routes } from '../navigation/route';
import { store } from '../redux/store';

type PushData = Record<string, any> | undefined;

// Tapped before the app finished starting (cold start, splash): opened once navigation is ready.
let pending: PushData;

/** Which screen a push opens, from the `data` the server sends (type, saleId, catalogId…). */
const targetFor = (data: Record<string, any>): { name: string; params?: any } => {
  const type = String(data.type || '');
  switch (type) {
    case 'bid_pending_approval':
      return { name: routes.pendingBidsScreen, params: { saleId: data.saleId ? String(data.saleId) : undefined } };
    case 'consignment_request':
      return { name: routes.consignmentRequests };
    case 'bidder_registration':
    case 'card_added':
      return { name: routes.bidBuyser };
    default:
      return { name: routes.notificationScreen };
  }
};

/** Open the screen a tapped notification is about. Safe to call before navigation is ready. */
export const openFromNotification = (data: PushData) => {
  if (!data || typeof data !== 'object') return;
  if (!store.getState().auth?.isLogin) return; // logged out: the login screen stays
  if (!navigationRef.isReady()) {
    pending = data;
    return;
  }
  const { name, params } = targetFor(data);
  // Drawer screens are registered at the top level of the drawer.
  (navigationRef as any).navigate(name, params);
};

/** Call from NavigationContainer onReady. */
export const flushPendingNotification = () => {
  if (pending) {
    const data = pending;
    pending = undefined;
    openFromNotification(data);
  }
};
