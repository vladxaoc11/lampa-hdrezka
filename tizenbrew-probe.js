(function() {
  // src/rezka/mirrors.js
  function normalizeTrustedDomain(value) {
    var normalized = String(value || "").trim().replace(/\/$/, "").toLowerCase();
    if (!/^https:\/\/(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/i.test(normalized)) {
      throw new Error("INVALID_DOMAIN");
    }
    return normalized;
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

  // src/tizenbrew/probe.js
  function inspectDocument(doc) {
    if (doc.querySelector("#anubis_challenge") || doc.querySelector("#challenge-form")) return { phase: "manual-check", count: 0 };
    if (!doc.querySelector(".b-content__inline_items")) return { phase: "waiting", count: 0 };
    return { phase: "catalog", count: doc.querySelectorAll(".b-content__inline_items .b-content__inline_item").length };
  }
  function isTrustedPage(runtime) {
    var loc = runtime.location;
    return loc && loc.protocol === "https:" && loc.hostname === "rezka.ag" && !loc.port;
  }
  function readCatalog(runtime) {
    if (!isTrustedPage(runtime)) return Promise.reject({ code: "UNTRUSTED_DOMAIN" });
    return createTransport({ origin: "https://rezka.ag", XMLHttpRequest: runtime.XMLHttpRequest, credentials: true }).get("https://rezka.ag/").then(function(response) {
      return { code: /class\s*=\s*["'][^"']*\bb-content__inline_items\b/i.test(response.text) ? "CATALOG_READ_OK" : "CATALOG_NOT_RECOGNIZED", status: response.status };
    });
  }
  function startProbe(runtime) {
    if (runtime.top !== runtime.self || !isTrustedPage(runtime) || runtime.hdrezkaBrewProbe) return;
    runtime.hdrezkaBrewProbe = true;
    var doc = runtime.document;
    var attempts = 0;
    var panel;
    var timer;
    function mount(count) {
      if (panel || !doc.body) return;
      panel = doc.createElement("section");
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-label", "HDRezka TV Probe");
      panel.style.cssText = "position:fixed;left:5%;right:5%;top:8%;z-index:2147483647;background:#18202c;color:white;padding:28px;font:24px sans-serif;border:3px solid #80baff;border-radius:16px;";
      var heading = doc.createElement("h2");
      heading.textContent = "HDRezka TV Probe 0.1.0";
      var status = doc.createElement("p");
      status.textContent = "\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u043E\u0442\u043A\u0440\u044B\u0442 \u0432 \u044D\u0442\u043E\u0439 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435. \u041A\u0430\u0440\u0442\u043E\u0447\u0435\u043A: " + count + ". \u0412\u0445\u043E\u0434 \u0432 \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u0435\u0449\u0451 \u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D.";
      var button = doc.createElement("button");
      button.textContent = "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0447\u0442\u0435\u043D\u0438\u0435 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0430 (OK)";
      button.style.cssText = "font:24px sans-serif;padding:16px;background:#80baff;color:#101722;border:3px solid white;";
      var hint = doc.createElement("p");
      hint.textContent = "\u041A\u0440\u0430\u0441\u043D\u0430\u044F \u043A\u043D\u043E\u043F\u043A\u0430: \u0441\u043A\u0440\u044B\u0442\u044C/\u043F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043F\u0430\u043D\u0435\u043B\u044C. \u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u0437\u0430\u043F\u0438\u0441\u044B\u0432\u0430\u0435\u0442 \u0432 \u0430\u043A\u043A\u0430\u0443\u043D\u0442.";
      var busy = false;
      function check() {
        if (busy) return;
        busy = true;
        status.textContent = "\u0427\u0438\u0442\u0430\u0435\u043C \u043A\u0430\u0442\u0430\u043B\u043E\u0433 \u0432 \u044D\u0442\u043E\u0439 \u0436\u0435 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u043D\u043E\u0439 \u0441\u0435\u0441\u0441\u0438\u0438\u2026";
        readCatalog(runtime).then(function(result) {
          status.textContent = result.code + " | HTTP " + result.status + " | same-origin | cookies: include";
        }).catch(function(error) {
          status.textContent = (error.code || "REQUEST_FAILED") + " | HTTP " + (error.status || 0);
        }).then(function() {
          busy = false;
        });
      }
      button.addEventListener("click", check);
      panel.appendChild(heading);
      panel.appendChild(status);
      panel.appendChild(button);
      panel.appendChild(hint);
      doc.body.appendChild(panel);
      button.focus();
      doc.addEventListener("keydown", function(event) {
        if (!isTrustedPage(runtime)) return;
        var target = event.target || {};
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName || "") || target.isContentEditable) return;
        if (event.keyCode === 403) {
          panel.hidden = !panel.hidden;
          if (!panel.hidden) button.focus();
          event.preventDefault();
        } else if (event.keyCode === 13 && !panel.hidden) {
          event.preventDefault();
          event.stopPropagation();
          check();
        }
      });
    }
    function poll() {
      attempts += 1;
      var result = inspectDocument(doc);
      if (result.phase === "catalog") {
        runtime.clearInterval(timer);
        mount(result.count);
      } else if (attempts >= 400) runtime.clearInterval(timer);
    }
    timer = runtime.setInterval(poll, 1500);
    poll();
  }

  // src/tizenbrew/index.js
  if (typeof window !== "undefined") startProbe(window);
})();
