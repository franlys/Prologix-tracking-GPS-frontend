export default {
  expo: {
    name: "Prologix GPS",
    slug: "prologix-gps",
    version: "1.0.8",
    orientation: "portrait",
    userInterfaceStyle: "light",
    splash: {
      backgroundColor: "#2196F3",
      resizeMode: "contain"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.prologix.gps",
      buildNumber: "6",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Prologix GPS needs your location to show your position on the map.",
        NSLocationAlwaysUsageDescription: "Prologix GPS needs your location to track your devices."
      }
    },
    android: {
      package: "com.prologix.gps",
      versionCode: 8,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY || ""
        }
      }
    },
    web: {},
    extra: {
      apiUrl: "https://prologix-tracking-gps-production.up.railway.app",
      eas: {
        projectId: "6b86e30f-222c-4cdd-8c3e-c734cfd3e23a"
      }
    },
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow Prologix GPS to use your location."
        }
      ]
    ]
  }
};
