/*
 * Behavior for the plain-CSS components. No build step and no dependencies:
 * add <script src="components.js" defer></script> once per page.
 * Everything is opt-in through data attributes, so markup stays plain HTML.
 *
 *   Dialog:  <button data-dialog-open="my-dialog">  opens <dialog id="my-dialog">
 *   Tabs:    <div class="tabs"> with role="tablist", role="tab", role="tabpanel"
 *   Toast:   <button data-toast="Saved" data-toast-desc="...">  or DS.toast("Saved")
 *   Forms:   <form data-validate novalidate> shows inline errors on submit
 *
 * Call DS.enhance(element) after adding markup to the page later (for example
 * from a page builder or a fetch); it is safe to call more than once.
 */
(function (global) {
  "use strict";

  function once(el, key) {
    var flag = "ds" + key;
    if (el.dataset[flag]) return false;
    el.dataset[flag] = "1";
    return true;
  }

  function region() {
    var r = document.querySelector(".toast-region");
    if (!r) {
      r = document.createElement("div");
      r.className = "toast-region";
      r.setAttribute("role", "status");
      r.setAttribute("aria-live", "polite");
      document.body.appendChild(r);
    }
    return r;
  }

  /** Show a short, non-blocking message. Options: description, variant ("destructive"), duration in ms. */
  function toast(title, options) {
    var o = options || {};
    var t = document.createElement("div");
    t.className = "toast" + (o.variant === "destructive" ? " toast--destructive" : "");
    var body = document.createElement("div");
    body.className = "toast__body";
    var h = document.createElement("div");
    h.className = "toast__title";
    h.textContent = title;
    body.appendChild(h);
    if (o.description) {
      var d = document.createElement("div");
      d.className = "toast__desc";
      d.textContent = o.description;
      body.appendChild(d);
    }
    t.appendChild(body);
    region().appendChild(t);
    setTimeout(function () { t.remove(); }, o.duration || 4000);
    return t;
  }

  function enhanceTabs(list) {
    if (!once(list, "Tabs")) return;
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t, false); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") n = tabs[0];
        else if (e.key === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  }

  function errorFor(field) {
    var id = field.id + "-error";
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement("p");
      el.className = "field-error";
      el.id = id;
      (field.closest(".field") || field.parentNode).appendChild(el);
    }
    var described = (field.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
    if (described.indexOf(id) === -1) described.push(id);
    field.setAttribute("aria-describedby", described.join(" "));
    return el;
  }

  function messageFor(field) {
    var v = field.validity;
    if (v.valueMissing && field.dataset.errorRequired) return field.dataset.errorRequired;
    if (!v.valueMissing && field.dataset.errorFormat) return field.dataset.errorFormat;
    return field.dataset.error || field.validationMessage;
  }

  function checkField(field) {
    if (!field.id) return true;
    var ok = field.checkValidity();
    if (ok) {
      field.removeAttribute("aria-invalid");
      var existing = document.getElementById(field.id + "-error");
      if (existing) existing.textContent = "";
    } else {
      field.setAttribute("aria-invalid", "true");
      errorFor(field).textContent = messageFor(field);
    }
    return ok;
  }

  function enhanceForm(form) {
    if (!once(form, "Form")) return;
    form.setAttribute("novalidate", "");
    var fields = function () {
      return Array.prototype.slice.call(form.querySelectorAll(".input, .select, .textarea"));
    };
    form.addEventListener("submit", function (e) {
      var bad = fields().filter(function (f) { return !checkField(f); });
      var summary = form.querySelector("[data-error-summary]");
      if (bad.length) {
        e.preventDefault();
        if (summary) {
          var list = summary.querySelector("ul");
          if (list) {
            list.innerHTML = "";
            bad.forEach(function (f) {
              var li = document.createElement("li");
              var a = document.createElement("a");
              a.href = "#" + f.id;
              a.textContent = messageFor(f);
              a.addEventListener("click", function (ev) { ev.preventDefault(); f.focus(); });
              li.appendChild(a);
              list.appendChild(li);
            });
          }
          summary.hidden = false;
          summary.focus();
        } else {
          bad[0].focus();
        }
        return;
      }
      if (summary) summary.hidden = true;
      if (form.dataset.success) {
        e.preventDefault();
        toast(form.dataset.success);
      }
    });
    // After the first error, re-check a field as soon as people leave it.
    form.addEventListener("focusout", function (e) {
      var f = e.target;
      if (f && f.getAttribute && f.getAttribute("aria-invalid") === "true") checkField(f);
    });
  }

  function enhance(root) {
    var scope = root || document;
    scope.querySelectorAll("[data-dialog-open]").forEach(function (btn) {
      if (!once(btn, "Dialog")) return;
      btn.addEventListener("click", function () {
        var dlg = document.getElementById(btn.getAttribute("data-dialog-open"));
        if (dlg && typeof dlg.showModal === "function") dlg.showModal();
      });
    });
    scope.querySelectorAll("dialog[data-light-dismiss]").forEach(function (dlg) {
      if (!once(dlg, "Dismiss")) return;
      dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    });
    scope.querySelectorAll("[data-toast]").forEach(function (btn) {
      if (!once(btn, "Toast")) return;
      btn.addEventListener("click", function () {
        toast(btn.getAttribute("data-toast"), {
          description: btn.getAttribute("data-toast-desc") || undefined,
          variant: btn.getAttribute("data-toast-variant") || undefined,
        });
      });
    });
    scope.querySelectorAll('[role="tablist"]').forEach(enhanceTabs);
    scope.querySelectorAll("form[data-validate]").forEach(enhanceForm);
  }

  global.DS = { enhance: enhance, toast: toast };
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () { enhance(document); });
    } else {
      enhance(document);
    }
  }
})(typeof window !== "undefined" ? window : this);
