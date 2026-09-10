import { Image } from 'expo-image';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
};

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <View className="flex-row items-center gap-3 px-1 pb-1">
      <Image
        source={require('@/assets/images/icon.png')}
        style={{ width: 40, height: 40, borderRadius: 12 }}
      />
      <View className="flex-1">
        <Text variant="h4" className="leading-tight">
          {title}
        </Text>
        {subtitle && <Text variant="muted">{subtitle}</Text>}
      </View>
    </View>
  );
}
