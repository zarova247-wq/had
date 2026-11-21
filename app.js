(function () {
    'use strict';
  
    const diag = window.__diag = {
      renders: 0,
      submitHandlerCalls: 0,
      listClickHandlerCalls: 0,
      detailClickHandlerCalls: 0,
      successfulTransitions: 0,
      rejectedTransitions: 0
    };
  
    const state = window.__state = {
      orders: window.ORDERS_DATA.map(o => Object.assign({}, o)),
      filter: "ALL",
      query: "",
      sortByAmount: false,
      selectedId: null,
      message: ""
    };
  
    const $ = id => document.getElementById(id);
    const el = {
      form: $("controls"), query: $("query"), queryErr: $("query-err"),
      filter: $("filter"), sort: $("sort"),
      message: $("message"), empty: $("empty"),
      list: $("orders"), detail: $("detail"),
      safeInput: $("safe-input"), safeOutput: $("safe-output"),
      debugRerender: $("debug-rerender"), diagView: $("diag-view")
    };
  
    const money = c => (c / 100).toFixed(2) + " ₽";
    const clearNode = n => { while (n.firstChild) n.removeChild(n.firstChild); };
  
    function selectVisible() {
      let rows = state.orders.slice();
      if (state.filter !== "ALL") rows = rows.filter(o => o.status === state.filter);
      const q = state.query.trim().toLowerCase();
      if (q) rows = rows.filter(o => o.code.toLowerCase().includes(q));
      if (state.sortByAmount) rows.sort((a, b) => a.totalCents - b.totalCents);
      else rows.sort((a, b) => a.id - b.id);
      return rows;
    }
  
    function validateQuery(v) {
      if (!v) return "";
      if (!/^[A-Za-z0-9-]*$/.test(v)) return "Допустимы латинские буквы, цифры и дефис.";
      return "";
    }
  
    function renderList() {
      const visible = selectVisible();
      clearNode(el.list);
  
      if (visible.length === 0) {
        el.empty.hidden = false;
        el.empty.textContent = "Нет заказов, соответствующих фильтру и поиску.";
      } else {
        el.empty.hidden = true;
        el.empty.textContent = "";
      }
  
      for (const o of visible) {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "order-btn";
        btn.dataset.action = "select";
        btn.dataset.id = String(o.id);
        btn.setAttribute("aria-pressed", o.id === state.selectedId ? "true" : "false");
        btn.textContent = `${o.code} — ${o.status} — ${money(o.totalCents)} — v${o.version}`;
        li.appendChild(btn);
        el.list.appendChild(li);
      }
    }
  
    function renderDetail() {
      clearNode(el.detail);
      const order = state.orders.find(o => o.id === state.selectedId);
      if (!order) {
        const p = document.createElement("p");
        p.textContent = "Выберите заказ в списке выше.";
        p.style.color = "var(--muted)";
        el.detail.appendChild(p);
        return;
      }
  
      const h3 = document.createElement("h3");
      h3.textContent = "Заказ " + order.code;
      el.detail.appendChild(h3);
  
      const dl = document.createElement("dl");
      [["Ячейка", order.cell],
       ["Статус", order.status],
       ["Сумма", money(order.totalCents)],
       ["Версия", String(order.version)],
       ["Срок", order.dueAt]].forEach(([k, v]) => {
        const dt = document.createElement("dt"); dt.textContent = k;
        const dd = document.createElement("dd"); dd.textContent = v;
        dl.appendChild(dt); dl.appendChild(dd);
      });
      el.detail.appendChild(dl);
  
      const next = window.nextStatus(order.status);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.action = "transition";
      btn.dataset.id = String(order.id);
      btn.dataset.version = String(order.version);
      btn.textContent = "Учебное локальное изменение";
      el.detail.appendChild(btn);
  
      if (!next) {
        btn.disabled = true;
        const reason = document.createElement("span");
        reason.id = "transition-reason-" + order.id;
        reason.className = "reason";
        reason.textContent = "Недоступно: заказ в терминальном статусе " + order.status + ".";
        el.detail.appendChild(reason);
        btn.setAttribute("aria-describedby", reason.id);
      } else {
        const info = document.createElement("p");
        info.textContent = "Переход по правилам P05: " + order.status + " → " + next +
                          " (версия " + order.version + " → " + (order.version + 1) + ").";
        el.detail.appendChild(info);
      }
    }
  
    function renderMessage() { el.message.textContent = state.message; }
  
    function renderDiag() {
      el.diagView.textContent =
        "renders: " + diag.renders + "\n" +
        "submitHandlerCalls: " + diag.submitHandlerCalls + "\n" +
        "listClickHandlerCalls: " + diag.listClickHandlerCalls + "\n" +
        "detailClickHandlerCalls: " + diag.detailClickHandlerCalls + "\n" +
        "successfulTransitions: " + diag.successfulTransitions + "\n" +
        "rejectedTransitions: " + diag.rejectedTransitions;
    }
  
    function render() {
      diag.renders++;
      renderList();
      renderDetail();
      renderMessage();
      renderDiag();
    }
  
    function onListClick(ev) {
      const target = ev.target;
      const currentTarget = ev.currentTarget;
      const btn = target.closest('[data-action="select"]');
      if (!btn || !currentTarget.contains(btn)) return;
  
      diag.listClickHandlerCalls++;
  
      const id = Number(btn.dataset.id);
      const order = state.orders.find(o => o.id === id);
      if (!order) return;
  
      state.selectedId = id;
      state.message = "Выбран заказ " + order.code + ".";
      render();
  
      const newBtn = el.list.querySelector('[data-action="select"][data-id="' + id + '"]');
      if (newBtn) newBtn.focus();
    }
  
    function onDetailClick(ev) {
      const target = ev.target;
      const btn = target.closest('[data-action="transition"]');
      if (!btn) return;
  
      diag.detailClickHandlerCalls++;
  
      const id = Number(btn.dataset.id);
      const expectedVersion = Number(btn.dataset.version);
      const order = state.orders.find(o => o.id === id);
      if (!order) return;
  
      const next = window.nextStatus(order.status);
      if (!next) {
        state.message = "Недоступно: терминальный статус " + order.status + ".";
        render();
        return;
      }
  
      const res = window.applyTransition(order, expectedVersion, next);
      if (!res.ok) {
        diag.rejectedTransitions++;
        state.message = "Отклонено: " + res.reason;
        render();
        el.message.focus();
        return;
      }
  
      diag.successfulTransitions++;
      const idx = state.orders.findIndex(o => o.id === id);
      state.orders[idx] = res.order;
      state.message = "Заказ " + order.code + ": " + order.status + " → " + next +
                      " (v" + expectedVersion + " → v" + res.order.version + ").";
      render();
  
      const newBtn = el.detail.querySelector('[data-action="transition"]');
      if (newBtn && !newBtn.disabled) newBtn.focus();
      else el.message.focus();
    }
  
    function onFormSubmit(ev) {
      ev.preventDefault();
      diag.submitHandlerCalls++;
  
      const q = el.query.value;
      const err = validateQuery(q);
      if (err) {
        el.queryErr.textContent = err;
        el.query.setAttribute("aria-invalid", "true");
        el.query.focus();
        return;
      }
      el.queryErr.textContent = "";
      el.query.removeAttribute("aria-invalid");
  
      state.query = q;
      state.filter = el.filter.value;
      state.sortByAmount = el.sort.checked;
  
      state.message = "Применён фильтр: " + state.filter +
        (q ? ", поиск: «" + q + "»" : "") +
        (state.sortByAmount ? ", сортировка по сумме" : "") + ".";
  
      render();
  
      const visibleCount = el.list.querySelectorAll('[data-action="select"]').length;
      if (visibleCount === 0) el.message.focus();
    }
  
    function onSafeInput() {
      el.safeOutput.textContent = el.safeInput.value;
    }
  
    function onDebugRerender() {
      render(); render(); render();
    }
  
    function attachHandlersOnce() {
      el.list.addEventListener("click", onListClick);
      el.detail.addEventListener("click", onDetailClick);
      el.form.addEventListener("submit", onFormSubmit);
      el.safeInput.addEventListener("input", onSafeInput);
      el.debugRerender.addEventListener("click", onDebugRerender);
    }
  
    window.__render = render;
    window.__reset = function () {
      state.orders = window.ORDERS_DATA.map(o => Object.assign({}, o));
      state.filter = "ALL"; state.query = ""; state.sortByAmount = false;
      state.selectedId = null; state.message = "";
      el.query.value = ""; el.filter.value = "ALL"; el.sort.checked = false;
      el.queryErr.textContent = ""; el.query.removeAttribute("aria-invalid");
      el.safeInput.value = ""; el.safeOutput.textContent = "";
      Object.keys(diag).forEach(k => diag[k] = 0);
      state.message = "Состояние сброшено.";
      render();
    };
  
    attachHandlersOnce();
    state.message = "Выберите заказ или примените фильтр.";
    render();
  })();