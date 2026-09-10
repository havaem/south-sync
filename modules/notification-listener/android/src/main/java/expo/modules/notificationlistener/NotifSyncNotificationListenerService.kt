package expo.modules.notificationlistener

import android.app.Notification
import android.content.pm.PackageManager
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

data class CapturedNotificationPayload(
  val packageName: String,
  val appName: String,
  val title: String,
  val text: String,
  val postTime: Long
)

// Bridges the system service (its own OS-managed instance) to the Expo module instance,
// which is the only side JS can talk to.
object NotificationEventBus {
  private val listeners = mutableSetOf<(CapturedNotificationPayload) -> Unit>()

  fun addListener(listener: (CapturedNotificationPayload) -> Unit) {
    listeners.add(listener)
  }

  fun removeListener(listener: (CapturedNotificationPayload) -> Unit) {
    listeners.remove(listener)
  }

  fun emit(payload: CapturedNotificationPayload) {
    listeners.forEach { it(payload) }
  }
}

class NotifSyncNotificationListenerService : NotificationListenerService() {
  override fun onNotificationPosted(sbn: StatusBarNotification) {
    if (sbn.packageName == applicationContext.packageName) return

    val extras = sbn.notification.extras
    val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()
    val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
    if (title.isNullOrBlank()) return

    val appName = try {
      val pm = applicationContext.packageManager
      val appInfo = pm.getApplicationInfo(sbn.packageName, 0)
      pm.getApplicationLabel(appInfo).toString()
    } catch (e: PackageManager.NameNotFoundException) {
      sbn.packageName
    }

    NotificationEventBus.emit(
      CapturedNotificationPayload(
        packageName = sbn.packageName,
        appName = appName,
        title = title,
        text = text ?: "",
        postTime = sbn.postTime
      )
    )
  }
}
