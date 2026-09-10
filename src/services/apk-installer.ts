import { File, Paths } from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';

export type DownloadProgress = {
  bytesWritten: number;
  totalBytes: number;
};

export async function downloadAndInstallApk(
  url: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
  if (Platform.OS !== 'android') {
    throw new Error('Chỉ hỗ trợ cài đặt cập nhật trên Android');
  }

  const destination = new File(Paths.cache, 'notifsync-update.apk');
  if (destination.exists) {
    destination.delete();
  }

  const task = File.createDownloadTask(url, destination, {
    onProgress: (progress) => onProgress?.(progress),
  });

  const file = await task.downloadAsync();
  if (!file) {
    throw new Error('Tải file cập nhật thất bại');
  }

  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: file.contentUri,
    flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
    type: 'application/vnd.android.package-archive',
  });
}
