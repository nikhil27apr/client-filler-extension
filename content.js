(function () {
  "use strict";

  const DEFAULT_PREFIX = "PCA";
  const BASE_PHONE = 9627224800;
  const $jq = window.jQuery || window.$;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function setStatus(msg, color) {
    const s = document.getElementById("cf-status");
    if (s) {
      s.textContent = msg;
      s.style.color = color || "#555";
    }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return console.warn("Missing:", id);
    const setter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(el),
      "value",
    )?.set;
    setter ? setter.call(el, value) : (el.value = value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function setTextByName(name, value) {
    const form = document.getElementById("addclientform");
    if (!form) return console.warn("Missing form:", name);
    const el = form.querySelector('[name="' + name + '"]');
    if (!el) return console.warn("Missing name:", name);
    const setter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(el),
      "value",
    )?.set;
    setter ? setter.call(el, value) : (el.value = value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function setSelect(id, value) {
    const el = document.getElementById(id);
    if (!el) return console.warn("Missing select:", id);
    el.value = value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    if ($jq && $jq.fn && $jq.fn.chosen) $jq(el).trigger("chosen:updated");
  }

  function expandSection(headingText) {
    const h = [...document.querySelectorAll("*")].find(
      (el) => !el.children.length && el.textContent.trim() === headingText,
    );
    if (h)
      (h.closest("[onclick], .collapse, .card-header, div, span") || h).click();
  }

  function findSaveButton(form) {
    return (
      form.querySelector('button[type="submit"], input[type="submit"]') ||
      [...form.querySelectorAll("button")].find((b) =>
        /save/i.test(b.textContent),
      )
    );
  }

  function fillForm(payload) {
    const form = document.getElementById("addclientform");
    if (!form) {
      setStatus("❌ Open the Add Client page first.", "#dc2626");
      return { success: false, message: "Open the Add Client page first." };
    }

    const prefix =
      payload?.prefix && payload.prefix.trim()
        ? payload.prefix.trim()
        : DEFAULT_PREFIX;
    const indexProvided =
      payload?.indexRaw !== null &&
      payload?.indexRaw !== undefined &&
      String(payload.indexRaw).trim() !== "";
    const index = indexProvided ? parseInt(payload.indexRaw, 10) : null;
    const indexStr = indexProvided ? String(index) : "";

    const phone =
      payload?.phone && payload.phone.trim()
        ? payload.phone.trim()
        : String(indexProvided ? BASE_PHONE + index : BASE_PHONE);
    const email =
      payload?.email && payload.email.trim()
        ? payload.email.trim()
        : prefix.toLowerCase() + indexStr + "@acefone.com";

    setStatus("Filling…", "#555");
    expandSection("Additional Fields");

    const loginId = prefix + indexStr;
    const DATA = {
      name: loginId,
      number: phone,
      company_name: loginId,
      pin: "111111",
      billing_currency: "INR",
      email: email,
      login_id: loginId,
      client_id: loginId,
      extensions: "1111111",
      supervisors: "111111111",
      concurrent_seat_licensing: "22222",
      whatsapp_p2p_agents: "22222220",
      inbound_caps_limit: "1111111",
    };

    setText("name", DATA.name);
    setText("number", DATA.number);
    setText("company_name", DATA.company_name);
    setText("pin", DATA.pin);
    setSelect("billing_currency", DATA.billing_currency);
    setText("email", DATA.email);
    setText("login_id", DATA.login_id);
    setText("client_id", DATA.client_id);
    setText("extensions", DATA.extensions);
    setText("supervisors", DATA.supervisors);
    setText("concurrent_seat_licensing", DATA.concurrent_seat_licensing);
    setText("whatsapp_p2p_agents", DATA.whatsapp_p2p_agents);
    setTextByName("inbound_caps_limit", DATA.inbound_caps_limit);

    const saveBtn = findSaveButton(form);
    if (saveBtn)
      saveBtn.scrollIntoView({ behavior: "smooth", block: "center" });

    setStatus(
      "✅ " +
        DATA.login_id +
        " (" +
        DATA.number +
        ") filled. Review & click Save.",
      "#16a34a",
    );
    return { success: true, message: "✅ " + DATA.login_id + " filled." };
  }

  function initializePanel() {
    if (document.getElementById("cf-panel")) return;

    const panel = document.createElement("div");
    panel.id = "cf-panel";
    panel.style.cssText =
      "position:fixed;top:20px;right:20px;z-index:999999;background:#ffffff;" +
      "border:1px solid #d1d5db;padding:16px;border-radius:10px;" +
      "box-shadow:0 8px 24px rgba(0,0,0,0.18);font-family:Arial,sans-serif;" +
      "width:240px;color:#111827;";

    panel.innerHTML =
      '<div style="font-weight:bold;font-size:14px;margin-bottom:10px;">Client Form Filler</div>' +
      '<label style="font-size:11px;color:#555;">Prefix</label>' +
      '<input id="cf-prefix" placeholder="PCA" style="width:100%;margin:4px 0 10px;padding:6px;border-radius:5px;border:1px solid #ccc;box-sizing:border-box;">' +
      '<label style="font-size:11px;color:#555;">Index</label>' +
      '<input id="cf-number" type="number" min="1" placeholder="e.g. 1 (blank = no index)" style="width:100%;margin:4px 0 10px;padding:6px;border-radius:5px;border:1px solid #ccc;box-sizing:border-box;">' +
      '<label style="font-size:11px;color:#555;">Phone Number</label>' +
      '<input id="cf-phone" placeholder="blank = auto" style="width:100%;margin:4px 0 10px;padding:6px;border-radius:5px;border:1px solid #ccc;box-sizing:border-box;">' +
      '<label style="font-size:11px;color:#555;">Email</label>' +
      '<input id="cf-email" placeholder="blank = auto" style="width:100%;margin:4px 0 10px;padding:6px;border-radius:5px;border:1px solid #ccc;box-sizing:border-box;">' +
      '<button id="cf-fill" style="width:100%;padding:8px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">Fill Form</button>' +
      '<div id="cf-status" style="font-size:11px;margin-top:8px;min-height:14px;"></div>' +
      '<button id="cf-close" style="width:100%;margin-top:6px;padding:5px;background:#f3f4f6;border:none;border-radius:5px;cursor:pointer;font-size:11px;color:#555;">Close</button>';

    document.body.appendChild(panel);
    document
      .getElementById("cf-close")
      .addEventListener("click", () => panel.remove());
    document.getElementById("cf-fill").addEventListener("click", () => {
      fillForm({
        prefix: document.getElementById("cf-prefix").value,
        indexRaw: document.getElementById("cf-number").value,
        phone: document.getElementById("cf-phone").value,
        email: document.getElementById("cf-email").value,
      });
    });
  }

  initializePanel();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "fillForm") {
      const result = fillForm(message);
      sendResponse(result);
      return true;
    }
    return false;
  });
})();
