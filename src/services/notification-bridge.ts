import { Platform } from 'react-native';

import NotificationListenerModule from '../../modules/notification-listener/src/NotificationListenerModule';
import type { CapturedNotification } from '../../modules/notification-listener/src/NotificationListener.types';

export type { CapturedNotification };

export function isSupportedPlatform(): boolean {
  return Platform.OS === 'android';
}

export function isAccessGranted(): boolean {
  if (!isSupportedPlatform()) return false;
  return NotificationListenerModule.isAccessGranted();
}

export function openAccessSettings(): void {
  if (!isSupportedPlatform()) return;
  NotificationListenerModule.openAccessSettings();
}

export function subscribeToNotifications(
  callback: (notification: CapturedNotification) => void
): () => void {
  if (!isSupportedPlatform()) return () => {};
  const subscription = NotificationListenerModule.addListener('onNotificationReceived', callback);
  return () => subscription.remove();
}
