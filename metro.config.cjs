const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");
const config = getSentryExpoConfig(__dirname);

// ⬇️ temporary workaround for the “stream” / Node core‑module error
config.resolver.unstable_enablePackageExports = false;

module.exports = config;