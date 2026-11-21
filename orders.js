(function () {
    'use strict';
  
    window.ORDERS_DATA = [
      { id: 5012, code: "LAB-5012", status: "READY",     cell: "A-12", totalCents: 259800, version: 1, dueAt: "2026-10-24T20:00:00+03:00" },
      { id: 5013, code: "LAB-5013", status: "ACCEPTED",  cell: "B-04", totalCents: 49900,  version: 1, dueAt: "2026-10-26T18:00:00+03:00" },
      { id: 5014, code: "LAB-5014", status: "READY",     cell: "A-03", totalCents: 79900,  version: 2, dueAt: "2026-10-24T18:00:00+03:00" },
      { id: 5015, code: "LAB-5015", status: "CHECK",     cell: "C-02", totalCents: 129900, version: 1, dueAt: "2026-10-25T17:00:00+03:00" },
      { id: 5016, code: "LAB-5016", status: "ISSUED",    cell: "D-01", totalCents: 9900,   version: 3, dueAt: "2026-10-23T17:00:00+03:00" },
      { id: 5017, code: "LAB-5017", status: "CANCELLED", cell: "D-02", totalCents: 20000,  version: 2, dueAt: "2026-10-22T17:00:00+03:00" }
    ];
  
    window.TRANSITIONS = {
      ACCEPTED:  ["READY"],
      READY:     ["ISSUED", "CHECK"],
      CHECK:     ["READY"],
      ISSUED:    [],
      CANCELLED: []
    };
  
    window.nextStatus = function (status) {
      const allowed = window.TRANSITIONS[status] || [];
      return allowed.length ? allowed[0] : null;
    };
  
    window.applyTransition = function (order, expectedVersion, targetStatus) {
      if (order.version !== expectedVersion) {
        return { ok: false, reason: "устаревшая версия (ожидалась " + expectedVersion + ", сейчас " + order.version + ")" };
      }
      const allowed = window.TRANSITIONS[order.status] || [];
      if (!allowed.includes(targetStatus)) {
        return { ok: false, reason: "переход " + order.status + " → " + targetStatus + " запрещён правилами P05" };
      }
      return {
        ok: true,
        order: Object.assign({}, order, { status: targetStatus, version: order.version + 1 })
      };
    };
  })();