package expo.modules.notificationlistener

import android.content.Intent
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NotificationListenerModule : Module() {
  private val busListener: (CapturedNotificationPayload) -> Unit = { payload ->
    sendEvent(
      "onNotificationReceived",
      mapOf(
        "packageName" to payload.packageName,
        "appName" to payload.appName,
        "title" to payload.title,
        "text" to payload.text,
        "postTime" to payload.postTime
      )
    )
  }

  override fun definition() = ModuleDefinition {
    Name("NotificationListener")

    Events("onNotificationReceived")

    OnStartObserving {
      NotificationEventBus.addListener(busListener)
    }

    OnStopObserving {
      NotificationEventBus.removeListener(busListener)
    }

    Function("isAccessGranted") {
      val context = appContext.reactContext ?: return@Function false
      NotificationManagerCompat.getEnabledListenerPackages(context).contains(context.packageName)
    }

    Function("openAccessSettings") {
      appContext.reactContext?.let { context ->
        val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
      }
    }
  }
}
