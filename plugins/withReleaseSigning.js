const { withAppBuildGradle } = require('expo/config-plugins');

const DEBUG_SIGNING_CONFIG = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`;

const SIGNING_CONFIGS_WITH_RELEASE = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            def keystorePropertiesFile = rootProject.file("../keystore.properties")
            def keystoreProperties = new Properties()
            if (keystorePropertiesFile.exists()) {
                keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
                storeFile new File(keystorePropertiesFile.parentFile, keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }`;

const RELEASE_BUILD_TYPE = `        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`;

// Applies the NotifSync release keystore (from ../keystore.properties, gitignored) to the
// `release` build type. expo prebuild regenerates android/app/build.gradle from scratch each
// time, so this has to be re-injected via a config plugin rather than edited once by hand.
module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (contents.includes(DEBUG_SIGNING_CONFIG)) {
      contents = contents.replace(DEBUG_SIGNING_CONFIG, SIGNING_CONFIGS_WITH_RELEASE);
    }

    if (contents.includes(RELEASE_BUILD_TYPE)) {
      contents = contents.replace(
        RELEASE_BUILD_TYPE,
        `        release {
            def keystorePropertiesFile = rootProject.file("../keystore.properties")
            signingConfig keystorePropertiesFile.exists() ? signingConfigs.release : signingConfigs.debug`
      );
    }

    config.modResults.contents = contents;
    return config;
  });
};
