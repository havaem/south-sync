export type CapturedNotification = {
  packageName: string;
  appName: string;
  title: string;
  text: string;
  postTime: number;
};

export type NotificationListenerModuleEvents = {
  onNotificationReceived: (payload: CapturedNotification) => void;
};
