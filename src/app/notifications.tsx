import { useFocusEffect } from 'expo-router';
import { Bell, BellRing } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useIconColor } from '@/lib/icon-colors';
import {
  type CapturedNotification,
  isAccessGranted,
  isSupportedPlatform,
  openAccessSettings,
  subscribeToNotifications,
} from '@/services/notification-bridge';

function formatTime(postTime: number) {
  return new Date(postTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function AppAvatar({ appName }: { appName: string }) {
  const initial = appName.trim().charAt(0).toUpperCase() || '?';
  return (
    <View className="bg-secondary h-9 w-9 items-center justify-center rounded-full">
      <Text className="font-semibold">{initial}</Text>
    </View>
  );
}

function NotificationRow({ notification }: { notification: CapturedNotification }) {
  return (
    <Card>
      <CardContent className="flex-row gap-3 py-4">
        <AppAvatar appName={notification.appName} />
        <View className="flex-1 gap-0.5">
          <View className="flex-row justify-between">
            <Text variant="small" className="font-semibold">
              {notification.appName}
            </Text>
            <Text variant="muted">{formatTime(notification.postTime)}</Text>
          </View>
          <Text>{notification.title}</Text>
          {notification.text.length > 0 && <Text variant="muted">{notification.text}</Text>}
        </View>
      </CardContent>
    </Card>
  );
}

export default function NotificationsScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const [granted, setGranted] = useState(false);
  const [notifications, setNotifications] = useState<CapturedNotification[]>([]);
  const primaryForegroundColor = useIconColor('primaryForeground');
  const mutedIconColor = useIconColor('mutedForeground');

  useFocusEffect(
    useCallback(() => {
      setGranted(isAccessGranted());
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (!granted) return;
      return subscribeToNotifications((notification) => {
        setNotifications((current) => [notification, ...current].slice(0, 200));
      });
    }, [granted])
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
          Tính năng đọc thông báo hệ thống chỉ khả dụng trên Android.
        </Text>
      </View>
    );
  }

  if (!granted) {
    return (
      <View
        className="flex-1 items-center justify-center gap-3 px-6"
        style={{ paddingTop: insets.top }}>
        <View className="bg-secondary h-16 w-16 items-center justify-center rounded-full">
          <Bell color={mutedIconColor} size={28} />
        </View>
        <Text variant="h3" className="text-center">
          Cần quyền truy cập thông báo
        </Text>
        <Text variant="muted" className="text-center">
          NotifSync cần quyền Notification Access để đọc thông báo hệ thống. Quyền này phải cấp thủ
          công trong Cài đặt.
        </Text>
        <Button onPress={openAccessSettings}>
          <BellRing color={primaryForegroundColor} size={16} />
          <Text>Mở Cài đặt truy cập thông báo</Text>
        </Button>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1"
      contentContainerStyle={{
        gap: Spacing.two,
        paddingHorizontal: Spacing.three,
        alignSelf: 'center',
        width: '100%',
        paddingTop: insets.top + Spacing.three,
        paddingBottom: insets.bottom,
        maxWidth: MaxContentWidth,
      }}
      data={notifications}
      keyExtractor={(item, index) => `${item.postTime}-${index}`}
      ListHeaderComponent={
        <View className="pb-2">
          <AppHeader title="Thông báo" subtitle={`Đã bắt ${notifications.length} thông báo`} />
        </View>
      }
      renderItem={({ item }) => <NotificationRow notification={item} />}
      ListEmptyComponent={
        <View className="items-center justify-center gap-2 px-6 py-12">
          <Text variant="muted" className="text-center">
            Chưa có thông báo nào được bắt. Hãy thử mở một app khác để tạo thông báo.
          </Text>
        </View>
      }
    />
  );
}
