import { useCallback, useEffect, useRef, useState } from 'react';

import * as bluetoothService from '@/services/bluetooth-service';
import { startSyncForegroundService, stopSyncForegroundService } from '@/services/foreground-service';
import {
  ensureNotificationPermission,
  presentNotification,
  type ReceivedNotificationPayload,
} from '@/services/local-notification-service';
import { subscribeToNotifications } from '@/services/notification-bridge';

export type BluetoothSyncState = 'idle' | 'connecting' | 'listening' | 'connected';

function isReceivedNotificationPayload(value: unknown): value is ReceivedNotificationPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ReceivedNotificationPayload).title === 'string'
  );
}

export function useBluetoothSync() {
  const [state, setState] = useState<BluetoothSyncState>('idle');
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [sentCount, setSentCount] = useState(0);
  const [receivedCount, setReceivedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    ensureNotificationPermission();
  }, []);

  useEffect(() => {
    if (state !== 'connected') return;

    startSyncForegroundService('NotifSync', `Đang đồng bộ với ${deviceName ?? 'thiết bị đã ghép nối'}`);

    const unsubscribeDisconnect = bluetoothService.subscribeToDisconnect(() => {
      setState('idle');
      setDeviceName(null);
    });

    const unsubscribeIncoming = bluetoothService.subscribeToIncoming((payload) => {
      if (!isReceivedNotificationPayload(payload)) return;
      setReceivedCount((count) => count + 1);
      presentNotification(payload);
    });

    const unsubscribeCaptured = subscribeToNotifications((notification) => {
      bluetoothService
        .send(notification)
        .then(() => setSentCount((count) => count + 1))
        .catch(() => {});
    });

    return () => {
      unsubscribeDisconnect();
      unsubscribeIncoming();
      unsubscribeCaptured();
      stopSyncForegroundService();
    };
  }, [state, deviceName]);

  const connect = useCallback(async (address: string) => {
    setError(null);
    setState('connecting');
    try {
      await bluetoothService.connectToDevice(address);
      setDeviceName(bluetoothService.getConnectedDeviceName());
      setState('connected');
    } catch (err) {
      setState('idle');
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const listen = useCallback(async () => {
    setError(null);
    setState('listening');
    try {
      await bluetoothService.listenForConnection();
      setDeviceName(bluetoothService.getConnectedDeviceName());
      setState('connected');
    } catch (err) {
      setState('idle');
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const cancelListening = useCallback(async () => {
    await bluetoothService.cancelListening();
    if (stateRef.current === 'listening') setState('idle');
  }, []);

  const disconnect = useCallback(async () => {
    await bluetoothService.disconnect();
    setDeviceName(null);
    setSentCount(0);
    setReceivedCount(0);
    setState('idle');
  }, []);

  return { state, deviceName, sentCount, receivedCount, error, connect, listen, cancelListening, disconnect };
}
