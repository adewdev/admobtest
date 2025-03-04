# AdMob Test App with Capacitor

A mobile-friendly test application that demonstrates the integration of Google AdMob with Capacitor. This app includes examples of the three main ad formats:

1. Banner Ads
2. Interstitial Ads
3. Rewarded Video Ads

## Features

- Mobile-friendly UI
- Test implementation of AdMob banner ads
- Test implementation of AdMob interstitial ads
- Test implementation of AdMob rewarded video ads
- Error handling and status reporting
- Loading indicators

## Technologies Used

- SvelteKit
- Capacitor
- @capacitor-community/admob (v7.0.1)

## Setup and Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Build the app:

```bash
npm run build
```

4. Sync with Capacitor:

```bash
npx cap sync
```

## Running on Android

To run the app on an Android device or emulator:

```bash
npx cap open android
```

Then build and run the app from Android Studio.

## Troubleshooting

### "No fill" Error

If you encounter a "No fill" error when trying to load ads, this is normal behavior with test ads. It means that there are no test ads available to serve at the moment. Some possible solutions:

1. Try again later
2. Make sure you're using the correct test ad unit IDs
3. Ensure your device has an internet connection
4. Check that you have the correct permissions in AndroidManifest.xml

### Other Issues

- Make sure the AdMob plugin is properly initialized
- Check that the app ID in capacitor.config.ts matches the one in AndroidManifest.xml
- Verify that you have the necessary permissions in AndroidManifest.xml

## Ad Unit Test IDs

The app uses Google's official test ad unit IDs:

- Banner: ca-app-pub-3940256099942544/6300978111
- Interstitial: ca-app-pub-3940256099942544/1033173712
- Rewarded Video: ca-app-pub-3940256099942544/5224354917
- App ID: ca-app-pub-3940256099942544~3347511713

## License

MIT
