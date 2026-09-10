import { NativeModule, registerWebModule } from 'expo';

import type { NotificationListenerModuleEvents } from './NotificationListener.types';

class NotificationListenerModule extends NativeModule<NotificationListenerModuleEvents> {
  isAccessGranted(): boolean {
    return false;
  }

  openAccessSettings(): void {}
}

export default registerWebModule(NotificationListenerModule, 'NotificationListenerModule');
