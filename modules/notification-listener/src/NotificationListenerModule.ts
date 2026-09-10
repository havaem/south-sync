import { NativeModule, requireNativeModule } from 'expo';

import type { NotificationListenerModuleEvents } from './NotificationListener.types';

declare class NotificationListenerModule extends NativeModule<NotificationListenerModuleEvents> {
  isAccessGranted(): boolean;
  openAccessSettings(): void;
}

export default requireNativeModule<NotificationListenerModule>('NotificationListener');
