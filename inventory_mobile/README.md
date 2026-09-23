# ERP Mobile Application

The mobile application is built using Flutter, designed to interface with the core ERP backend for field operations and inventory management on iOS and Android devices.

## Prerequisites

- Flutter SDK (v3.8+)
- Android Studio or VS Code with Flutter extension
- An emulator or physical device for testing (iOS/Android)

## Installation

1. Navigate to the mobile directory:
   ```bash
   cd inventory_mobile
   ```

2. Fetch all required packages:
   ```bash
   flutter pub get
   ```

## Configuration

To connect the mobile app to your locally running backend, you may need to update the API base URL in your configuration files depending on your platform:
- For Web/iOS Simulators: use `http://localhost:5000/api`
- For Android Emulators: use `http://10.0.2.2:5000/api`
- For Physical Devices: use your machine's local IP address (e.g. `http://192.168.1.5:5000/api`)

## Running the App

To run the app on an attached device or emulator:
```bash
flutter run
```

To build a release APK for Android:
```bash
flutter build apk --release
```
