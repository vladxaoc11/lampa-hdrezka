var LampaHDRezkaDirect = (function() {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = function(target, all) {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = function(to, from, except, desc) {
    if (from && typeof from === "object" || typeof from === "function")
      for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
        key = keys[i];
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: function(k) {
            return from[k];
          }.bind(null, key), enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
    return to;
  };
  var __toCommonJS = function(mod) {
    return __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  };

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    bootstrap: function() {
      return bootstrap;
    },
    manifest: function() {
      return manifest;
    },
    registerManifest: function() {
      return registerManifest;
    }
  });

  // src/lampa/integration.js
  function registerSettings(lampa, checkConnection) {
    if (lampa.__hdrezkaDirectRegistered) return;
    lampa.__hdrezkaDirectRegistered = true;
    lampa.SettingsApi.addComponent({
      component: "hdrezka_direct",
      name: "HDRezka",
      icon: ""
    });
    lampa.SettingsApi.addParam({
      component: "hdrezka_direct",
      param: { name: "hdrezka_direct_check", type: "trigger" },
      field: { name: "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435", description: "\u041F\u0440\u044F\u043C\u0430\u044F \u0434\u0438\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F. \u0410\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F \u0438 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u043F\u043E\u043A\u0430 \u043D\u0435 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u044B." },
      onChange: function() {
        if (lampa.Noty) lampa.Noty.show("\u041F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C \u043F\u0440\u044F\u043C\u043E\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435\u2026");
        checkConnection().then(function(result) {
          if (lampa.Noty) lampa.Noty.show(result.reachability.status === "success" ? "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044F \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430" : "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044F: " + result.reachability.code);
        });
      }
    });
  }

  // src/lampa/diagnostics.js
  function runPublicDiagnostics(deps) {
    var pending = { status: "not-tested" };
    return deps.transport.get(deps.origin + "/").then(function(response) {
      var recognized = /<main|b-content|b-post/i.test(response.text);
      return {
        reachability: { status: "success" },
        request: { status: "success" },
        catalog: recognized ? { status: "success" } : { status: "error", code: "UNSUPPORTED_PROTOCOL" }
      };
    }).catch(function(error) {
      return { reachability: { status: "error", code: error.code || "NETWORK" }, request: pending, catalog: pending };
    });
  }

  // src/utils/errors.js
  function failure(code) {
    return { code: code };
  }

  // src/rezka/transport.js
  function createTransport(options) {
    return {
      get: function(url) {
        return new Promise(function(resolve, reject) {
          if (String(url).indexOf(options.origin + "/") !== 0 && String(url) !== options.origin) return reject(failure("UNTRUSTED_DOMAIN"));
          var xhr = new options.XMLHttpRequest();
          xhr.open("GET", url, true);
          xhr.timeout = 15e3;
          xhr.onload = function() {
            if (/just a moment|cloudflare|captcha/i.test(xhr.responseText || "")) return reject(failure("BLOCKED_CHALLENGE"));
            if (xhr.status >= 200 && xhr.status < 300) return resolve({ status: xhr.status, text: xhr.responseText || "" });
            reject(failure("HTTP"));
          };
          xhr.onerror = function() {
            reject(failure("NETWORK"));
          };
          xhr.ontimeout = function() {
            reject(failure("TIMEOUT"));
          };
          xhr.send();
        });
      }
    };
  }

  // src/rezka/mirrors.js
  var TRUSTED_ORIGINS = ["https://rezka.ag"];
  function normalizeTrustedDomain(value) {
    var normalized = String(value || "").trim().replace(/\/$/, "").toLowerCase();
    if (!/^https:\/\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i.test(normalized)) {
      throw new Error("INVALID_DOMAIN");
    }
    return normalized;
  }
  function createMirrorManager(state) {
    return {
      getSelected: function() {
        return state.get("selectedDomain") || TRUSTED_ORIGINS[0];
      },
      select: function(value) {
        var origin = normalizeTrustedDomain(value);
        if (TRUSTED_ORIGINS.indexOf(origin) === -1) throw new Error("UNTRUSTED_DOMAIN");
        state.set("selectedDomain", origin);
        return origin;
      }
    };
  }

  // src/storage/state.js
  var ALLOWED_KEYS = ["pluginEnabled", "selectedDomain", "lastHealthyDomain", "domainHealth", "diagnosticsSummary", "localProgressCache"];
  var PREFIX = "lampa-hdrezka-direct:";
  function isAllowed(key) {
    return ALLOWED_KEYS.indexOf(key) !== -1;
  }
  function createState(storage) {
    return {
      get: function(key, fallback) {
        if (!isAllowed(key)) throw new Error("INVALID_STATE_KEY");
        return storage.get(PREFIX + key, fallback);
      },
      set: function(key, value) {
        if (!isAllowed(key)) throw new Error("INVALID_STATE_KEY");
        storage.set(PREFIX + key, value);
      }
    };
  }

  // src/index.js
  var manifest = {
    type: "video",
    version: "0.1.0",
    name: "HDRezka Direct",
    description: "Direct diagnostics plugin for Lampa",
    component: "hdrezka_direct"
  };
  function registerManifest(lampa) {
    if (!lampa.Manifest) lampa.Manifest = {};
    if (Array.isArray(lampa.Manifest.plugins)) {
      if (!lampa.Manifest.plugins.some(function(plugin) {
        return plugin && plugin.component === manifest.component;
      })) lampa.Manifest.plugins.push(manifest);
    } else {
      if (!lampa.Manifest.plugins) lampa.Manifest.plugins = {};
      lampa.Manifest.plugins[manifest.component] = manifest;
    }
  }
  function bootstrap(lampa, runtimeWindow) {
    if (!lampa || !lampa.Listener || !lampa.SettingsApi) {
      throw new Error("LAMPA_UNAVAILABLE");
    }
    var storage = lampa.Storage || { get: function(key, fallback) {
      return fallback;
    }, set: function() {
    } };
    var origin = createMirrorManager(createState(storage)).getSelected();
    registerManifest(lampa);
    registerSettings(lampa, function() {
      return runPublicDiagnostics({
        origin: origin,
        transport: createTransport({ XMLHttpRequest: runtimeWindow.XMLHttpRequest, origin: origin })
      });
    });
    var destroyed = false;
    return {
      destroy: function() {
        destroyed = true;
        return destroyed;
      },
      window: runtimeWindow
    };
  }
  function autoStart() {
    if (typeof window === "undefined" || typeof Lampa === "undefined" || window.hdrezkaDirectStarted) return;
    function start() {
      if (window.hdrezkaDirectStarted) return;
      window.hdrezkaDirectStarted = true;
      bootstrap(Lampa, window);
    }
    if (window.appready) start();
    else if (Lampa.Listener && Lampa.Listener.follow) Lampa.Listener.follow("app", function(event) {
      if (event.type === "ready") start();
    });
  }
  autoStart();
  return __toCommonJS(index_exports);
})();
