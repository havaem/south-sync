import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, useColorScheme, View } from 'react-native';

import { ExternalLink } from './external-link';
import { Text } from './ui/text';

import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="notifications" href="/notifications" asChild>
            <TabButton>Notifications</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} className={cn('active:opacity-70')}>
      <View className={cn('rounded-lg px-3 py-1', isFocused ? 'bg-secondary' : 'bg-muted')}>
        <Text variant="small" className={isFocused ? 'text-foreground' : 'text-muted-foreground'}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const theme = THEME[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View {...props} className="absolute w-full flex-row items-center justify-center p-3">
      <View className="bg-muted max-w-3xl grow flex-row items-center gap-2 rounded-full px-5 py-2">
        <Text variant="small" className="mr-auto font-semibold">
          Expo Starter
        </Text>

        {props.children}

        <ExternalLink href="https://docs.expo.dev" asChild>
          <Pressable className="ml-3 flex-row items-center justify-center gap-1">
            <Text variant="small" className="text-primary underline">
              Docs
            </Text>
            <SymbolView
              tintColor={theme.foreground}
              name={{ ios: 'arrow.up.right.square', web: 'link' }}
              size={12}
            />
          </Pressable>
        </ExternalLink>
      </View>
    </View>
  );
}
