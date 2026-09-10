import { useFocusEffect } from 'expo-router';
import { Bluetooth, BluetoothConnected, BluetoothSearching, RadioTower, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { UpdateCard } from '@/components/update-card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useBluetoothSync } from '@/hooks/use-bluetooth-sync';
import { useIconColor } from '@/lib/icon-colors';
import { type BluetoothSyncDevice, listBondedDevices } from '@/services/bluetooth-service';
import { isSupportedPlatform } from '@/services/notification-bridge';

function statusLabel(state: string) {
  switch (state) {
    case 'connecting':
      return 'Đang kết nối…';
    case 'listening':
      return 'Đang chờ kết nối…';
    case 'connected':
      return 'Đã kết nối';
    default:
      return 'Chưa kết nối';
  }
}

function StatusIcon({ state, color }: { state: string; color: string }) {
  if (state === 'connected') return <BluetoothConnected color={color} size={18} />;
  if (state === 'listening' || state === 'connecting')
    return <BluetoothSearching color={color} size={18} />;
  return <Bluetooth color={color} size={18} />;
}

export default function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const [devices, setDevices] = useState<BluetoothSyncDevice[]>([]);
  const sync = useBluetoothSync();
  const mutedIconColor = useIconColor('mutedForeground');
  const destructiveIconColor = useIconColor('destructive');

  useFocusEffect(
    useCallback(() => {
      listBondedDevices().then(setDevices);
    }, [])
  );

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  if (!isSupportedPlatform()) {
    return (
      <View className="flex-1 items-center justify-center gap-3 px-6">
        <Text variant="h3" className="text-center">
          Chỉ hỗ trợ Android
        </Text>
        <Text variant="muted" className="text-center">
          Kết nối Bluetooth Classic chỉ khả dụng trên Android.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1"
      contentContainerStyle={{
        gap: Spacing.three,
        paddingHorizontal: Spacing.three,
        alignSelf: 'center',
        width: '100%',
        paddingTop: insets.top + Spacing.three,
        paddingBottom: insets.bottom,
        maxWidth: MaxContentWidth,
      }}
      data={devices}
      keyExtractor={(item) => item.address}
      ListHeaderComponent={
        <View className="gap-3 pb-1">
          <AppHeader title="NotifSync" subtitle="Đồng bộ thông báo giữa 2 máy qua Bluetooth" />

          <Card>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <StatusIcon state={sync.state} color={mutedIconColor} />
                  <CardTitle>Trạng thái đồng bộ</CardTitle>
                </View>
                <Badge variant={sync.state === 'connected' ? 'default' : 'secondary'}>
                  <Text>{statusLabel(sync.state)}</Text>
                </Badge>
              </View>
            </CardHeader>
            <CardContent className="gap-2">
              {sync.deviceName && <Text variant="muted">Thiết bị: {sync.deviceName}</Text>}
              {sync.state === 'connected' && (
                <Text variant="muted">
                  Đã gửi {sync.sentCount} · Đã nhận {sync.receivedCount}
                </Text>
              )}
              {sync.error && <Text className="text-destructive">{sync.error}</Text>}

              <View className="flex-row gap-2 pt-2">
                {sync.state === 'idle' && (
                  <Button variant="secondary" className="flex-1" onPress={sync.listen}>
                    <RadioTower color={mutedIconColor} size={16} />
                    <Text>Chờ kết nối (máy nhận)</Text>
                  </Button>
                )}
                {sync.state === 'listening' && (
                  <Button variant="outline" className="flex-1" onPress={sync.cancelListening}>
                    <X color={mutedIconColor} size={16} />
                    <Text>Hủy chờ</Text>
                  </Button>
                )}
                {sync.state === 'connected' && (
                  <Button variant="destructive" className="flex-1" onPress={sync.disconnect}>
                    <X color={destructiveIconColor} size={16} />
                    <Text>Ngắt kết nối</Text>
                  </Button>
                )}
              </View>
            </CardContent>
          </Card>

          <Text variant="muted" className="px-1">
            Thiết bị đã ghép nối (máy gửi bấm Kết nối)
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Card className="mb-2">
          <CardContent className="flex-row items-center justify-between py-4">
            <View className="flex-1 flex-row items-center gap-3">
              <View className="bg-secondary h-9 w-9 items-center justify-center rounded-full">
                <Bluetooth color={mutedIconColor} size={16} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold">{item.name}</Text>
                <Text variant="muted">{item.address}</Text>
              </View>
            </View>
            <Button
              size="sm"
              disabled={sync.state !== 'idle'}
              onPress={() => sync.connect(item.address)}>
              <Text>Kết nối</Text>
            </Button>
          </CardContent>
        </Card>
      )}
      ListEmptyComponent={
        <View className="items-center justify-center gap-2 px-6 py-8">
          <Text variant="muted" className="text-center">
            Chưa có thiết bị Bluetooth nào được ghép nối. Vào Cài đặt hệ thống để ghép nối trước.
          </Text>
        </View>
      }
      ListFooterComponent={
        <View className="pt-3">
          <UpdateCard />
        </View>
      }
    />
  );
}
