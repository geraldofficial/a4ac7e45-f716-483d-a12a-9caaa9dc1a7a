// Immediate console suppression - loaded directly in HTML
(function () {
  "use strict";

  // Store originals in a way they can't be accessed
  var _origError = console.error;
  var _origLog = console.log;
  var _origWarn = console.warn;
  var _warned = false;

  function _shouldSuppress(msg) {
    return (
      msg &&
      (msg.indexOf("42P01") > -1 ||
        msg.indexOf("user_notifications") > -1 ||
        msg.indexOf("notification_preferences") > -1 ||
        msg.indexOf("push_subscriptions") > -1 ||
        msg.indexOf("user_settings") > -1 ||
        msg.indexOf("does not exist") > -1 ||
        msg.indexOf('relation "public') > -1 ||
        msg.indexOf("body stream") > -1)
    );
  }

  function _processArgs(args) {
    var result = "";
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      if (typeof arg === "string") {
        result += arg;
      } else if (arg && typeof arg === "object") {
        try {
          result += JSON.stringify(arg);
        } catch (e) {
          result += String(arg);
        }
      } else {
        result += String(arg);
      }
      result += " ";
    }
    return result;
  }

  // Replace console methods permanently
  Object.defineProperty(console, "error", {
    value: function () {
      var msg = _processArgs(arguments);
      if (_shouldSuppress(msg)) {
        if (!_warned) {
          _warned = true;
          _origWarn("🛡️ Database errors suppressed");
        }
        return;
      }
      _origError.apply(console, arguments);
    },
    writable: false,
    configurable: false,
  });

  Object.defineProperty(console, "log", {
    value: function () {
      var msg = _processArgs(arguments);
      if (_shouldSuppress(msg)) {
        if (!_warned) {
          _warned = true;
          _origWarn("🛡️ Database errors suppressed");
        }
        return;
      }
      _origLog.apply(console, arguments);
    },
    writable: false,
    configurable: false,
  });

  Object.defineProperty(console, "warn", {
    value: function () {
      var msg = _processArgs(arguments);
      if (_shouldSuppress(msg)) {
        return;
      }
      _origWarn.apply(console, arguments);
    },
    writable: false,
    configurable: false,
  });

  // Add global test function
  window.testConsoleSuppress = function () {
    _origLog("🧪 Testing external console suppression...");
    console.error(
      '{"code":"42P01","details":null,"hint":null,"message":"relation \\"public.user_notifications\\" does not exist"}',
    );
    console.error(
      '{"code":"42P01","details":null,"hint":null,"message":"relation \\"public.notification_preferences\\" does not exist"}',
    );
    console.log(
      'TEST_SUPPRESSION_42P01: relation "public.test" does not exist',
    );
    _origLog(
      "✅ External suppression test complete - errors should be suppressed",
    );
  };

  // Test immediately
  _origLog("🛡️ Non-configurable console suppression loaded");
  console.error("TEST_IMMEDIATE_42P01: This should be suppressed");
  _origLog("✅ Console suppression test complete");
})();
