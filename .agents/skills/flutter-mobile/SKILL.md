---
name: flutter-mobile
description: >
  Flutter mobile development for MERN-integrated apps. Covers pubspec.yaml
  dependency management, Android APK builds (Gradle, AGP namespaces),
  SDK compatibility traps, dart:io token storage, SQLite offline queuing,
  and MERN backend integration patterns. Activate when building or debugging
  Flutter apps that talk to a Node/Express/MongoDB backend.
---

# Flutter Mobile — MERN Integration & Build Guide

> **Verified against:** Flutter SDK 3.8.x / Dart 3.x / Android Gradle Plugin 8.x  
> **Project origin:** Noor Marketing ERP (inventory_mobile), November 2026

---

## 1. Quick Decision Matrix — Package Selection

| Need | Safe Package (SDK-compatible) | Avoid (requires `flutter_web_plugins`) |
|---|---|---|
| Secure token storage | `dart:io` File + `path_provider` | `flutter_secure_storage >=6.1.0` |
| Barcode scanning | Manual text/SKU lookup UI | `mobile_scanner >=1.0.0` |
| URL launching | `flutter/services.dart` Clipboard copy | `url_launcher >=6.2.1` |
| Local database | `sqflite` (any version) | — |
| HTTP requests | `http` (any version) | — |
| State management | `provider` (any version) | — |
| Path resolution | `path_provider` (any version) | — |

> [!IMPORTANT]
> Stripped/partial Flutter SDK installations (e.g. server CI, some custom setups) are
> missing the `flutter_web_plugins` SDK component. Every package that added web
> platform support after ~2021 transitively requires it. Always test with
> `flutter pub get` before assuming a package will install.

---

## 2. Automated Action Protocol

### Step 1 — Dependency Audit Before Any Build
```powershell
cd inventory_mobile

# Attempt resolution — surface conflicts before wasting 10 min on Gradle
flutter pub get 2>&1

# If web_plugins error appears, identify the culprit package:
# "Because <pkg> >=X.Y.Z depends on flutter_web_plugins from sdk..."
# → Pin to a version BELOW X.Y.Z or replace with dart:io alternative
```

### Step 2 — Static Analysis (Zero Tolerance)
```powershell
flutter analyze 2>&1
# Must show: "No issues found!"
# Fix ALL warnings before running build — they surface as build failures on CI.
```

### Step 3 — APK Build
```powershell
# Debug APK (fastest, for device testing)
flutter build apk --debug

# Release APK (obfuscated, for distribution)
flutter build apk --release --obfuscate --split-debug-info=build/debug-info

# Output paths:
# Debug:   build\app\outputs\flutter-apk\app-debug.apk
# Release: build\app\outputs\flutter-apk\app-release.apk
```

> [!NOTE]
> First Gradle build downloads ~500MB from `dl.google.com` and `repo.maven.apache.org`.
> Requires stable internet. Subsequent builds use the Gradle cache (~10s).

---

## 3. Critical Patterns

### 3A. Token Storage Without flutter_secure_storage

When `flutter_secure_storage` is incompatible, use `dart:io` + `path_provider`:

```dart
// auth_service.dart — File-based session persistence
import 'dart:convert';
import 'dart:io';
import 'package:path_provider/path_provider.dart';

Future<File> _tokenFile() async {
  final dir = await getApplicationDocumentsDirectory();
  return File('${dir.path}/.app_session');
}

Future<void> _saveSession(String token, String role, String name) async {
  final file = await _tokenFile();
  await file.writeAsString(jsonEncode({'token': token, 'role': role, 'name': name}));
}

Future<Map<String, String>?> _loadSession() async {
  try {
    final file = await _tokenFile();
    if (!await file.exists()) return null;
    final data = jsonDecode(await file.readAsString()) as Map<String, dynamic>;
    return {'token': data['token'], 'role': data['role'], 'name': data['name']};
  } catch (_) { return null; }
}

Future<void> _deleteSession() async {
  final file = await _tokenFile();
  if (await file.exists()) await file.delete();
}
```

> **Production upgrade path:** When deploying on a full Flutter SDK, swap this for
> `flutter_secure_storage: ^9.0.0` which uses Android Keystore / iOS Keychain.

### 3B. MERN Backend Login — Flat Response Mapping

Express/Mongoose APIs often return flat JSON. **Never assume nested `user` object.**

```dart
// ❌ WRONG — assumes { user: { role, token } }
_role = data['user']['role'];
_token = data['user']['token'];

// ✅ CORRECT — flat response: { _id, username, role, token }
_role  = data['role']     as String;
_token = data['token']    as String;
_name  = data['username'] as String;
```

Always inspect the actual API response shape before writing the Dart parser:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"sale","password":"pass123"}'
```

### 3C. BuildContext Across Async Gaps

```dart
// ❌ WRONG — context captured after await (lint: use_build_context_synchronously)
await someAsyncOperation();
ScaffoldMessenger.of(context).showSnackBar(...);

// ✅ CORRECT — capture messenger before await
final messenger = ScaffoldMessenger.of(context);
await someAsyncOperation();
messenger.showSnackBar(...);
```

### 3D. Modern Widget Boilerplate (Dart 3.x)

```dart
// ❌ OLD — causes use_super_parameters + library_private_types_in_public_api lints
class MyWidget extends StatefulWidget {
  const MyWidget({Key? key}) : super(key: key);
  @override
  _MyWidgetState createState() => _MyWidgetState();
}

// ✅ MODERN — Dart 3.x super parameter syntax
class MyWidget extends StatefulWidget {
  const MyWidget({super.key});
  @override
  State<MyWidget> createState() => _MyWidgetState();
}
```

### 3E. Android Emulator vs Physical Device URL

```dart
// Android Emulator → host machine localhost
static const String baseUrl = 'http://10.0.2.2:5000/api';

// Physical device on same WiFi → use host machine LAN IP
// static const String baseUrl = 'http://192.168.1.XXX:5000/api';
```

---

## 4. Troubleshooting & Error Catalog

| Error Signature | Root Cause | Verified Fix |
|:---|:---|:---|
| `Could not find package flutter_web_plugins in the Flutter SDK` | Stripped/partial SDK missing web component. Triggered by any package that added web support post-2021. | Pin to older version without web support, OR replace with `dart:io` / built-in equivalent. See Section 3A. |
| `Namespace not specified. Specify a namespace in the module's build file: .../flutter_secure_storage-4.2.1/android/build.gradle` | `flutter_secure_storage` v4.x predates AGP namespace requirement. Old `build.gradle` has no `namespace` declaration. | Upgrade package to v9+ (if SDK allows) OR replace entirely with `dart:io` File approach. |
| `Could not GET 'https://dl.google.com/...'` / `No such host is known (repo.maven.apache.org)` | Machine has no internet during first Gradle build. Toolchain not yet cached. | Ensure stable network. Run `flutter build apk` again when connectivity restored. Cache persists; only first build requires network. |
| `BarcodeCapture` / `MobileScannerController` undefined | `mobile_scanner` v0.x installed but code written for v2+ API. | Pin `mobile_scanner: ^5.2.3` (v5+ API) or rewrite to manual SKU text input if SDK incompatible. |
| `canLaunchUrl` / `LaunchMode` undefined | `url_launcher` pre-null-safety version resolved. | Use `^6.3.0` or replace with `Clipboard.setData()` from `flutter/services.dart`. |
| `info: Dangling library doc comment` | `///` triple-slash comment at top of file with no `library` declaration. | Change to `//` double-slash block comment. |
| `warning: Unused import` in test file | Placeholder test file retains unused imports from scaffolding. | Remove unused imports; keep only `flutter_test/flutter_test.dart`. |
| `flutter build apk` exits code 1 but `flutter analyze` is clean | Gradle/Android issue (namespace, network, AGP version mismatch) — not a Dart error. | Read the full Gradle error, not just the Flutter wrapper message. Fix is in Android configs, not Dart. |

---

## 5. pubspec.yaml Reference — Verified Compatible Versions

```yaml
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
  http: ^1.6.0
  provider: ^6.1.1
  sqflite: ^2.3.0
  path_provider: ^2.1.2      # Required for dart:io token file
  path: ^1.9.1

  # flutter_secure_storage: REMOVED — requires flutter_web_plugins in this SDK
  # mobile_scanner: REMOVED — requires flutter_web_plugins in this SDK
  # url_launcher: REMOVED — requires flutter_web_plugins in this SDK

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^5.0.0
```

---

## 6. flutter analyze — Lint Fix Reference

Run before every build. Common fixable lints:

```powershell
flutter analyze 2>&1
# Target: "No issues found!"
```

| Lint Rule | Auto-Fix Pattern |
|---|---|
| `dangling_library_doc_comments` | Change `///` → `//` at top of file |
| `prefer_final_fields` | Add `final` to field that is never reassigned |
| `use_build_context_synchronously` | Capture `ScaffoldMessenger.of(context)` before `await` |
| `use_super_parameters` | Change `{Key? key} : super(key: key)` → `{super.key}` |
| `library_private_types_in_public_api` | Change `_StateClass createState()` → `State<Widget> createState()` |
| `unused_import` | Delete the unused import line |

---

## 7. Changelog & Evolution History

- **2026-11-01**: Created from Noor Marketing ERP session. Captured:
  - `flutter_web_plugins` SDK incompatibility matrix (3 packages replaced)
  - `flutter_secure_storage` v4 Android namespace Gradle failure
  - `dart:io` File-based token storage pattern
  - MERN flat JSON login response mapping bug
  - Gradle network dependency on `dl.google.com` for first build
  - 8 lint rules with exact fixes
  - Android emulator URL (`10.0.2.2`) vs physical device LAN IP
