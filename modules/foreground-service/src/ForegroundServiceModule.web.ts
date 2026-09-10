import { NativeModule, registerWebModule } from 'expo';

import type { ForegroundServiceModuleEvents } from './ForegroundService.types';

class ForegroundServiceModule extends NativeModule<ForegroundServiceModuleEvents> {
  start(_title: string, _text: string): void {}
  stop(): void {}
}

export default registerWebModule(ForegroundServiceModule, 'ForegroundServiceModule');
