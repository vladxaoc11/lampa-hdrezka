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
  function registerSettings(lampa, checkConnection, services) {
    if (lampa.__hdrezkaDirectRegistered) return;
    lampa.__hdrezkaDirectRegistered = true;
    lampa.SettingsApi.addComponent({
      component: "hdrezka_direct",
      name: "HDRezka",
      icon: ""
    });
    function notify(text) {
      if (lampa.Noty) lampa.Noty.show(text);
    }
    function display(result) {
      var details = result.details || {};
      var lines = [
        "HDRezka Direct " + services.version,
        "HTTP: " + (details.status || "0 / \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D"),
        "\u041A\u043E\u043D\u0435\u0447\u043D\u044B\u0439 \u0430\u0434\u0440\u0435\u0441 (\u0442\u043E\u043B\u044C\u043A\u043E origin): " + (details.finalUrl || "\u043D\u0435 \u0440\u0430\u0441\u043A\u0440\u044B\u0442 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u043E\u043C"),
        "\u0422\u0438\u043F: " + (details.contentType || "\u043D\u0435 \u0440\u0430\u0441\u043A\u0440\u044B\u0442"),
        "Challenge: " + ((details.challengeSignals || []).join(", ") || "\u044F\u0432\u043D\u044B\u0445 \u043F\u0440\u0438\u0437\u043D\u0430\u043A\u043E\u0432 \u043D\u0435\u0442"),
        "\u041A\u0430\u0442\u0430\u043B\u043E\u0433: " + result.catalog.status,
        "\u0417\u0430\u043F\u0440\u043E\u0441: " + (details.code || result.request.status),
        "Cookies: " + (details.credentialMode || "omit"),
        "\u041E\u0431\u0449\u043D\u043E\u0441\u0442\u044C \u0441\u0435\u0441\u0441\u0438\u0438 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430 \u0438 Lampa: \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0430",
        details.status ? "\u041E\u0442\u0432\u0435\u0442 \u0441\u0435\u0440\u0432\u0435\u0440\u0430 \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0434\u043B\u044F \u0447\u0442\u0435\u043D\u0438\u044F." : "HTTP 0: \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u044B CORS, DNS, TLS, \u0441\u0435\u0442\u044C \u0438\u043B\u0438 \u043F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F."
      ];
      if (lampa.Modal && services.runtime.jQuery) {
        var container = services.runtime.jQuery("<div></div>");
        lines.forEach(function(line) {
          container.append(services.runtime.jQuery("<p></p>").text(line));
        });
        var active = lampa.Controller && lampa.Controller.enabled ? lampa.Controller.enabled() : null;
        var previous = active && active.name ? active.name : "settings";
        lampa.Modal.open({ title: "\u0414\u0438\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430 HDRezka", html: container, size: "large", onBack: function() {
          lampa.Modal.close();
          if (lampa.Controller) lampa.Controller.toggle(previous);
        } });
      } else notify(lines.join(" | "));
    }
    function run(credentials) {
      notify("\u041F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C \u043F\u0440\u044F\u043C\u043E\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435\u2026");
      checkConnection(credentials).then(display).catch(function() {
        notify("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443.");
      });
    }
    lampa.SettingsApi.addParam({
      component: "hdrezka_direct",
      param: { name: "hdrezka_direct_check", type: "trigger" },
      field: { name: "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435", description: "\u041F\u0440\u044F\u043C\u0430\u044F \u0434\u0438\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F. \u0410\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F \u0438 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u043F\u043E\u043A\u0430 \u043D\u0435 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u044B." },
      onChange: function() {
        run(false);
      }
    });
    function action(name, title, description, handler) {
      lampa.SettingsApi.addParam({ component: "hdrezka_direct", param: { name: name, type: "trigger" }, field: { name: title, description: description }, onChange: handler });
    }
    action("hdrezka_direct_browser", "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u0430\u0439\u0442 \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435", "\u041F\u0440\u043E\u0439\u0434\u0438\u0442\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443 \u0432\u0440\u0443\u0447\u043D\u0443\u044E. \u0417\u0430\u0442\u0435\u043C \u0432\u0435\u0440\u043D\u0438\u0442\u0435\u0441\u044C \u0432 Lampa. Cookies \u043C\u043E\u0433\u0443\u0442 \u0431\u044B\u0442\u044C \u0438\u0437\u043E\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u044B.", function() {
      services.openBrowser().then(function() {
        notify("\u0411\u0440\u0430\u0443\u0437\u0435\u0440 \u043E\u0442\u043A\u0440\u044B\u0442. \u041F\u043E\u0441\u043B\u0435 \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443 \u043F\u043E\u0441\u043B\u0435 \u0432\u0445\u043E\u0434\u0430.");
      }).catch(function(error) {
        notify(error.code + ": \u043E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 " + services.mirrors.getSelected() + " \u0432\u0440\u0443\u0447\u043D\u0443\u044E \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435 TV.");
      });
    });
    action("hdrezka_direct_session", "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043F\u043E\u0441\u043B\u0435 \u0432\u0445\u043E\u0434\u0430", "\u041F\u0440\u044F\u043C\u043E\u0439 \u0437\u0430\u043F\u0440\u043E\u0441 \u0441 cookies \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F. \u0423\u0441\u043F\u0435\u0445 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0430 \u0435\u0449\u0451 \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0430\u0435\u0442 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044E.", function() {
      run(true);
    });
    action("hdrezka_direct_inapp", "\u041E\u0442\u043A\u0440\u044B\u0442\u044C HDRezka \u0432 \u043E\u043A\u043D\u0435 Lampa \u2014 \u044D\u043A\u0441\u043F\u0435\u0440\u0438\u043C\u0435\u043D\u0442", "\u0421\u0430\u0439\u0442 \u0437\u0430\u043C\u0435\u043D\u0438\u0442 \u044D\u043A\u0440\u0430\u043D Lampa. \u0414\u043E\u0436\u0434\u0438\u0442\u0435\u0441\u044C \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0430, \u0437\u0430\u0442\u0435\u043C \u0437\u0430\u043A\u0440\u043E\u0439\u0442\u0435 \u0438 \u0437\u0430\u043D\u043E\u0432\u043E \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435 Lampa. \u0412\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \xAB\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043F\u043E\u0441\u043B\u0435 \u0432\u0445\u043E\u0434\u0430\xBB.", function() {
      try {
        services.navigateInApp();
      } catch (error) {
        notify("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u0430\u0439\u0442: " + error.message);
      }
    });
    action("hdrezka_direct_results", "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 / \u0432\u0435\u0440\u0441\u0438\u044F " + services.version, "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u043F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A\u0430.", function() {
      var result = services.state.get("diagnosticsSummary");
      if (result) display(result);
      else notify("\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0435\u0449\u0451 \u043D\u0435 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0430.");
    });
    lampa.SettingsApi.addParam({
      component: "hdrezka_direct",
      param: { name: "hdrezka_direct_domain_input", type: "input", values: "", default: services.mirrors.getSelected() },
      field: { name: "\u0414\u043E\u043C\u0435\u043D \u0434\u043B\u044F \u043F\u0443\u0431\u043B\u0438\u0447\u043D\u043E\u0439 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438", description: "\u0422\u043E\u043B\u044C\u043A\u043E HTTPS origin. \u041F\u0430\u0440\u043E\u043B\u0438 \u043D\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u044E\u0442\u0441\u044F; cookies \u0434\u043B\u044F \u043D\u0435\u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043D\u044B\u0445 \u0434\u043E\u043C\u0435\u043D\u043E\u0432 \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u044B." },
      onChange: function(value) {
        try {
          services.mirrors.select(value);
          notify("\u0410\u0434\u0440\u0435\u0441 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D.");
        } catch (_) {
          notify("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 HTTPS-\u0434\u043E\u043C\u0435\u043D \u0431\u0435\u0437 \u043F\u0443\u0442\u0438, \u043F\u043E\u0440\u0442\u0430 \u0438 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u043E\u0432.");
        }
      }
    });
  }

  // src/lampa/diagnostics.js
  function runPublicDiagnostics(deps) {
    var pending = { status: "not-tested" };
    return deps.transport.get(deps.origin + "/").then(function(response) {
      var recognized = /class\s*=\s*["'][^"']*\bb-content__inline_items\b/i.test(response.text);
      return {
        reachability: { status: "success" },
        request: { status: "success" },
        catalog: recognized ? { status: "success" } : { status: "error", code: "UNSUPPORTED_PROTOCOL" },
        details: { status: response.status, finalUrl: response.finalUrl || "", contentType: response.contentType || "", challengeSignals: response.challengeSignals || [], credentialMode: response.credentialMode || "omit", redirected: response.redirected },
        session: "not-tested"
      };
    }).catch(function(error) {
      return { reachability: { status: "error", code: error.code || "NETWORK_OR_CORS" }, request: pending, catalog: pending, details: error, session: "not-tested" };
    });
  }

  // src/rezka/mirrors.js
  var TRUSTED_ORIGINS = ["https://rezka.ag"];
  function normalizeTrustedDomain(value) {
    var normalized = String(value || "").trim().replace(/\/$/, "").toLowerCase();
    if (!/^https:\/\/(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/i.test(normalized)) {
      throw new Error("INVALID_DOMAIN");
    }
    return normalized;
  }
  function isCredentialEligible(origin) {
    return TRUSTED_ORIGINS.indexOf(String(origin || "").toLowerCase()) !== -1;
  }
  function createMirrorManager(state) {
    return {
      getSelected: function() {
        try {
          return normalizeTrustedDomain(state.get("selectedDomain") || TRUSTED_ORIGINS[0]);
        } catch (_) {
          return TRUSTED_ORIGINS[0];
        }
      },
      select: function(value) {
        var origin = normalizeTrustedDomain(value);
        state.set("selectedDomain", origin);
        return origin;
      }
    };
  }

  // src/rezka/transport.js
  function safeOrigin(value) {
    var match = /^https:\/\/([a-z0-9.-]+)(?:\/|$)/i.exec(String(value || ""));
    return match ? "https://" + match[1].toLowerCase() + "/" : "";
  }
  function challengeSignals(body) {
    var signals = [];
    if (/id\s*=\s*["']anubis_challenge["']/i.test(body)) signals.push("ANUBIS_PAGE");
    if (/_cf_chl_opt\s*=|id\s*=\s*["']challenge-form["']/i.test(body)) signals.push("CF_CHALLENGE_FORM");
    if (/<title[^>]*>\s*(?:Just a moment|Attention Required)[^<]*<\/title>/i.test(body) && /\/cdn-cgi\/challenge-platform\//i.test(body)) signals.push("CF_INTERSTITIAL");
    return signals;
  }
  function createTransport(options) {
    return {
      get: function(url) {
        return new Promise(function(resolve, reject) {
          var origin;
          try {
            origin = normalizeTrustedDomain(options.origin);
          } catch (_) {
            reject({ code: "INVALID_DOMAIN" });
            return;
          }
          if (url !== origin + "/") return reject({ code: "UNTRUSTED_DOMAIN" });
          var xhr;
          try {
            xhr = new options.XMLHttpRequest();
          } catch (_) {
            reject({ code: "RUNTIME_UNAVAILABLE", status: 0 });
            return;
          }
          function metadata() {
            var contentType = "";
            try {
              contentType = xhr.getResponseHeader("Content-Type") || "";
            } catch (_) {
            }
            var finalOrigin = safeOrigin(xhr.responseURL);
            return {
              status: xhr.status || 0,
              finalUrl: finalOrigin,
              contentType: String(contentType).split(";")[0].slice(0, 80),
              credentialMode: options.credentials ? "include" : "omit",
              redirected: finalOrigin ? finalOrigin !== origin + "/" : null,
              challengeSignals: challengeSignals(xhr.responseText || "")
            };
          }
          function fail(code) {
            var data = metadata();
            data.code = code;
            reject(data);
          }
          xhr.open("GET", url, true);
          xhr.withCredentials = options.credentials === true;
          xhr.timeout = 15e3;
          xhr.onload = function() {
            var data = metadata();
            if (data.redirected) return fail("CROSS_ORIGIN_REDIRECT");
            if (data.challengeSignals.length) return fail("BLOCKED_CHALLENGE");
            if (!xhr.status) return fail("NETWORK_OR_CORS");
            if (xhr.status < 200 || xhr.status >= 300) return fail("HTTP");
            data.text = xhr.responseText || "";
            resolve(data);
          };
          xhr.onerror = function() {
            fail("NETWORK_OR_CORS");
          };
          xhr.ontimeout = function() {
            fail("TIMEOUT");
          };
          xhr.send();
        });
      }
    };
  }

  // src/storage/state.js
  var ALLOWED_KEYS = ["pluginEnabled", "selectedDomain", "lastHealthyDomain", "domainHealth", "diagnosticsSummary", "localProgressCache", "sameAppNavigationAttempt"];
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

  // src/lampa/browser-session.js
  function navigateInApp(runtime, origin, state) {
    var target = normalizeTrustedDomain(origin);
    if (!isCredentialEligible(target)) throw new Error("UNTRUSTED_DOMAIN");
    if (!runtime.location || typeof runtime.location.assign !== "function") throw new Error("NAVIGATION_UNAVAILABLE");
    state.set("sameAppNavigationAttempt", { origin: target, attemptedAt: Date.now(), session: "not-tested" });
    runtime.location.assign(target + "/");
  }
  function openBrowser(runtime, origin) {
    return new Promise(function(resolve, reject) {
      var target;
      try {
        target = normalizeTrustedDomain(origin) + "/";
      } catch (_) {
        reject({ code: "INVALID_DOMAIN" });
        return;
      }
      var tizen = runtime.tizen;
      if (!tizen || !tizen.application || !tizen.ApplicationControl) {
        reject({ code: "BROWSER_API_UNAVAILABLE" });
        return;
      }
      try {
        var control = new tizen.ApplicationControl("http://tizen.org/appcontrol/operation/view", target);
        tizen.application.launchAppControl(
          control,
          null,
          function() {
            resolve({ launched: true, session: "not-tested" });
          },
          function(error) {
            reject({ code: error && error.name === "SecurityError" ? "BROWSER_PRIVILEGE_REQUIRED" : "BROWSER_LAUNCH_FAILED" });
          }
        );
      } catch (error) {
        reject({ code: error && error.name === "SecurityError" ? "BROWSER_PRIVILEGE_REQUIRED" : "BROWSER_LAUNCH_FAILED" });
      }
    });
  }

  // src/index.js
  var manifest = {
    type: "video",
    version: "0.3.0",
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
    var state = createState(storage);
    var mirrors = createMirrorManager(state);
    registerManifest(lampa);
    registerSettings(lampa, function(credentials) {
      var origin = mirrors.getSelected();
      return runPublicDiagnostics({
        origin: origin,
        transport: createTransport({ XMLHttpRequest: runtimeWindow.XMLHttpRequest, origin: origin, credentials: credentials === true && isCredentialEligible(origin) })
      }).then(function(result) {
        state.set("diagnosticsSummary", result);
        if (result.catalog.status === "success") state.set("lastHealthyDomain", origin);
        return result;
      });
    }, {
      runtime: runtimeWindow,
      mirrors: mirrors,
      state: state,
      version: manifest.version,
      openBrowser: function() {
        return openBrowser(runtimeWindow, mirrors.getSelected());
      },
      navigateInApp: function() {
        return navigateInApp(runtimeWindow, mirrors.getSelected(), state);
      }
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
