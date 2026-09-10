import ForegroundServiceModule from '../../modules/foreground-service/src/ForegroundServiceModule';
import { isSupportedPlatform } from './notification-bridge';

export function startSyncForegroundService(title: string, text: string): void {
  if (!isSupportedPlatform()) return;
  ForegroundServiceModule.start(title, text);
}

export function stopSyncForegroundService(): void {
  if (!isSupportedPlatform()) return;
  ForegroundServiceModule.stop();
}
