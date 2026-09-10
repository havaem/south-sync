import { DownloadCloud, RefreshCw } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useIconColor } from '@/lib/icon-colors';
import { downloadAndInstallApk } from '@/services/apk-installer';
import { checkForUpdate, getCurrentVersion, type UpdateCheckResult } from '@/services/update-checker';

type Status = 'idle' | 'checking' | 'error' | 'downloading' | 'installing';

export function UpdateCard() {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<UpdateCheckResult | null>(null);
  const [progress, setProgress] = useState(0);
  const mutedIconColor = useIconColor('mutedForeground');
  const primaryForegroundColor = useIconColor('primaryForeground');

  const check = async () => {
    setStatus('checking');
    try {
      const updateResult = await checkForUpdate();
      setResult(updateResult);
      setStatus('idle');
    } catch {
      setResult(null);
      setStatus('error');
    }
  };

  const install = async () => {
    if (!result?.downloadUrl) {
      Linking.openURL(result?.releaseUrl ?? '');
      return;
    }

    setStatus('downloading');
    setProgress(0);
    try {
      await downloadAndInstallApk(result.downloadUrl, (p) => {
        if (p.totalBytes > 0) setProgress(p.bytesWritten / p.totalBytes);
      });
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  const isBusy = status === 'downloading' || status === 'installing';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cập nhật ứng dụng</CardTitle>
      </CardHeader>
      <CardContent className="gap-3">
        <Text variant="muted">Phiên bản hiện tại: {result?.currentVersion ?? getCurrentVersion()}</Text>

        {result?.hasUpdate && (
          <View className="bg-secondary gap-2 rounded-lg p-3">
            <Text className="font-semibold">Đã có bản mới: {result.latestVersion}</Text>
            {result.releaseNotes.length > 0 && (
              <Text variant="muted" numberOfLines={4}>
                {result.releaseNotes}
              </Text>
            )}
            {status === 'downloading' && (
              <View className="bg-muted h-2 overflow-hidden rounded-full">
                <View
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${Math.max(4, Math.round(progress * 100))}%` }}
                />
              </View>
            )}
            <Button disabled={isBusy} onPress={install}>
              <DownloadCloud color={primaryForegroundColor} size={16} />
              <Text>
                {status === 'downloading'
                  ? `Đang tải… ${Math.round(progress * 100)}%`
                  : result.downloadUrl
                    ? 'Tải và cài đặt bản cập nhật'
                    : 'Mở trang release'}
              </Text>
            </Button>
          </View>
        )}

        {result && !result.hasUpdate && <Text variant="muted">Bạn đang dùng bản mới nhất.</Text>}

        {status === 'error' && (
          <Text className="text-destructive">Không kiểm tra/tải được cập nhật. Thử lại sau.</Text>
        )}

        <Button variant="outline" onPress={check} disabled={status === 'checking' || isBusy}>
          <RefreshCw color={mutedIconColor} size={16} />
          <Text>{status === 'checking' ? 'Đang kiểm tra…' : 'Kiểm tra cập nhật'}</Text>
        </Button>
      </CardContent>
    </Card>
  );
}
