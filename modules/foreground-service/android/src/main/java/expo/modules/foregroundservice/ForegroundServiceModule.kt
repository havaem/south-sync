package expo.modules.foregroundservice

import android.content.Intent
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ForegroundServiceModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ForegroundService")

    Function("start") { title: String, text: String ->
      appContext.reactContext?.let { context ->
        val intent = Intent(context, SyncForegroundService::class.java).apply {
          putExtra(SyncForegroundService.EXTRA_TITLE, title)
          putExtra(SyncForegroundService.EXTRA_TEXT, text)
        }
        ContextCompat.startForegroundService(context, intent)
      }
    }

    Function("stop") {
      appContext.reactContext?.let { context ->
        context.stopService(Intent(context, SyncForegroundService::class.java))
      }
    }
  }
}
