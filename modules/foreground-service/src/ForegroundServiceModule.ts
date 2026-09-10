import { NativeModule, requireNativeModule } from 'expo';

import type { ForegroundServiceModuleEvents } from './ForegroundService.types';

declare class ForegroundServiceModule extends NativeModule<ForegroundServiceModuleEvents> {
  start(title: string, text: string): void;
  stop(): void;
}

export default requireNativeModule<ForegroundServiceModule>('ForegroundService');
