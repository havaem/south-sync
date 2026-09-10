import { DownloadCloud, RefreshCw } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useIconColor } from '@/lib/icon-colors';
import { checkForUpdate, getCurrentVersion, type UpdateCheckResult } from '@/services/update-checker';

type Status = 'idle' | 'checking' | 'error';

export function UpdateCard() {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<UpdateCheckResult | null>(null);
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
            <Button
              disabled={!result.downloadUrl}
              onPress={() => {
                const url = result.downloadUrl ?? result.releaseUrl;
                Linking.openURL(url);
              }}>
              <DownloadCloud color={primaryForegroundColor} size={16} />
              <Text>Tải xuống bản cập nhật</Text>
            </Button>
          </View>
        )}

        {result && !result.hasUpdate && (
          <Text variant="muted">Bạn đang dùng bản mới nhất.</Text>
        )}

        {status === 'error' && (
          <Text className="text-destructive">Không kiểm tra được cập nhật. Thử lại sau.</Text>
        )}

        <Button variant="outline" onPress={check} disabled={status === 'checking'}>
          <RefreshCw color={mutedIconColor} size={16} />
          <Text>{status === 'checking' ? 'Đang kiểm tra…' : 'Kiểm tra cập nhật'}</Text>
        </Button>
      </CardContent>
    </Card>
  );
}
