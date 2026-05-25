package com.billpush.billpush

import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.File

class MainActivity : FlutterActivity() {
    private val CHANNEL = "com.billpush/whatsapp"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "shareToWhatsApp" -> {
                    val phone = call.argument<String>("phone") ?: ""
                    val message = call.argument<String>("message") ?: ""
                    val filePath = call.argument<String>("filePath") ?: ""

                    try {
                        if (filePath.isEmpty()) {
                            // Text-only sharing via wa.me deep link
                            val encodedMessage = java.net.URLEncoder.encode(message, "UTF-8")
                            val waUrl = "https://wa.me/$phone?text=$encodedMessage"
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(waUrl))
                            startActivity(intent)
                            result.success(true)
                        } else {
                            val file = File(filePath)
                            if (!file.exists()) {
                                result.error("FILE_NOT_FOUND", "PDF file not found at $filePath", null)
                                return@setMethodCallHandler
                            }

                            val fileUri: Uri = FileProvider.getUriForFile(
                                this,
                                "${applicationContext.packageName}.flutter.file_provider",
                                file
                            )

                            val intent = Intent(Intent.ACTION_SEND).apply {
                                setPackage("com.whatsapp")
                                type = "application/pdf"
                                putExtra(Intent.EXTRA_TEXT, message)
                                putExtra(Intent.EXTRA_STREAM, fileUri)
                                putExtra("jid", "${phone}@s.whatsapp.net")
                                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                            }

                            startActivity(intent)
                            result.success(true)
                        }
                    } catch (e: Exception) {
                        // If WhatsApp is not installed or any other error
                        result.error("SHARE_FAILED", e.message, null)
                    }
                }
                "isWhatsAppInstalled" -> {
                    try {
                        packageManager.getPackageInfo("com.whatsapp", 0)
                        result.success(true)
                    } catch (e: Exception) {
                        result.success(false)
                    }
                }
                else -> result.notImplemented()
            }
        }
    }
}
