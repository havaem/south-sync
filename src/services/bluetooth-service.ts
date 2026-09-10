import { PermissionsAndroid, Platform } from 'react-native';
import RNBluetoothClassic, { type BluetoothDevice } from 'react-native-bluetooth-classic';

export type BluetoothSyncDevice = {
  address: string;
  name: string;
};

const CONNECTION_OPTIONS = { delimiter: '\n' };

let connectedDevice: BluetoothDevice | null = null;

async function ensurePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const permissions =
    Platform.Version >= 31
      ? [PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN]
      : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

  const results = await PermissionsAndroid.requestMultiple(permissions);
  return Object.values(results).every((result) => result === PermissionsAndroid.RESULTS.GRANTED);
}

export async function listBondedDevices(): Promise<BluetoothSyncDevice[]> {
  if (Platform.OS !== 'android') return [];
  if (!(await ensurePermissions())) return [];

  const devices = await RNBluetoothClassic.getBondedDevices();
  return devices.map((device) => ({ address: device.address, name: device.name }));
}

export function isConnected(): boolean {
  return connectedDevice !== null;
}

export function getConnectedDeviceName(): string | null {
  return connectedDevice?.name ?? null;
}

export async function connectToDevice(address: string): Promise<void> {
  if (!(await ensurePermissions())) throw new Error('Thiếu quyền Bluetooth');
  connectedDevice = await RNBluetoothClassic.connectToDevice(address, CONNECTION_OPTIONS);
}

export async function listenForConnection(): Promise<void> {
  if (!(await ensurePermissions())) throw new Error('Thiếu quyền Bluetooth');
  connectedDevice = await RNBluetoothClassic.accept(CONNECTION_OPTIONS);
}

export async function cancelListening(): Promise<void> {
  await RNBluetoothClassic.cancelAccept();
}

export async function disconnect(): Promise<void> {
  const device = connectedDevice;
  connectedDevice = null;
  await device?.disconnect();
}

export async function send(payload: object): Promise<void> {
  if (!connectedDevice) throw new Error('Chưa kết nối thiết bị nào');
  await connectedDevice.write(JSON.stringify(payload) + '\n');
}

export function subscribeToIncoming(callback: (payload: unknown) => void): () => void {
  if (!connectedDevice) return () => {};

  const subscription = connectedDevice.onDataReceived((event) => {
    try {
      callback(JSON.parse(event.data));
    } catch {
      // dữ liệu không phải JSON hợp lệ, bỏ qua
    }
  });
  return () => subscription.remove();
}

export function subscribeToDisconnect(callback: () => void): () => void {
  const subscription = RNBluetoothClassic.onDeviceDisconnected(() => {
    connectedDevice = null;
    callback();
  });
  return () => subscription.remove();
}
