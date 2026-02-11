(() => {
  const YEAR = 2026;

  const isMobileQuery = window.matchMedia("(max-width: 640px)");

  const modalRoot = document.getElementById("mobileEventModal");
  const modalTitle = document.getElementById("mobileEventModalTitle");
  const modalBody = document.getElementById("mobileEventModalBody");
  const modalCloseBtn = document.getElementById("mobileEventModalClose");

  /**
   * Fuente de verdad de eventos.
   * - `title` se mantiene EXACTO.
   * - `description` usa el significado EXACTO.
   * - `date` es el día indicado (fin del evento a las 18:00).
   * - `range`:
   *    - "sunsetToSunset" (por defecto): inicia el día anterior a las 18:00 y finaliza el día indicado a las 18:00.
   *    - "fixedDate": ocurre exactamente en la fecha indicada (sin corrimiento).
   */
  const events = [
    { date: "2026-03-21", title: "Día de Ridván", description: "Día de Ridván" },
    { date: "2026-04-21", title: "Primer día del Festival de Ridván", description: "Primer día del Festival de Ridván" },
    { date: "2026-04-29", title: "Noveno día del Festival de Ridván", description: "Noveno día del Festival de Ridván" },
    { date: "2026-05-02", title: "Duodécimo día del Festival de Ridván", description: "Duodécimo día del Festival de Ridván" },
    { date: "2026-05-24", title: "Declaración del Báb", description: "Declaración del Báb" },
    { date: "2026-05-29", title: "Ascensión de Bahá’u’lláh", description: "Ascensión de Bahá’u’lláh" },
    { date: "2026-07-10", title: "Martirio del Báb", description: "Martirio del Báb" },

    {
      date: "2026-03-09",
      title: "Primer semestre presencial — Inicio",
      description: "Inicio del primer semestre presencial.",
      range: "fixedDate",
    },
    {
      date: "2026-07-18",
      title: "Primer semestre presencial — Finalización",
      description: "Finalización del primer semestre presencial.",
      range: "fixedDate",
    },
    {
      date: "2026-08-10",
      title: "Segundo semestre presencial — Inicio",
      description: "Inicio del segundo semestre presencial.",
      range: "fixedDate",
    },
    {
      date: "2026-12-26",
      title: "Segundo semestre presencial — Finalización",
      description: "Finalización del segundo semestre presencial.",
      range: "fixedDate",
    },

    {
      date: "2026-03-07",
      title: "Primer semestre semipresencial — Inicio",
      description: "Inicio del primer semestre semipresencial.",
      range: "fixedDate",
    },
    {
      date: "2026-07-19",
      title: "Primer semestre semipresencial — Finalización",
      description: "Finalización del primer semestre semipresencial.",
      range: "fixedDate",
    },
    {
      date: "2026-08-08",
      title: "Segundo semestre semipresencial — Inicio",
      description: "Inicio del segundo semestre semipresencial.",
      range: "fixedDate",
    },
    {
      date: "2026-12-16",
      title: "Segundo semestre semipresencial — Finalización",
      description: "Finalización del segundo semestre semipresencial.",
      range: "fixedDate",
    },
  ];

  const monthNames = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  // Semana: lunes a domingo
  const weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"];

  function pushEvent(map, dateKey, event) {
    const list = map.get(dateKey);
    if (list) {
      list.push(event);
    } else {
      map.set(dateKey, [event]);
    }
  }

  const eventsByDate = new Map();
  for (const event of events) {
    const rangeType = event.range ?? "sunsetToSunset";

    if (rangeType === "fixedDate") {
      pushEvent(eventsByDate, event.date, event);
      continue;
    }

    // Eventos tipo 18:00 del día anterior -> 18:00 del día indicado.
    // Se registran en ambos días con descripciones distintas.
    const startDate = prevDate(event.date);

    pushEvent(eventsByDate, startDate, {
      ...event,
      description: "Empieza hoy a las 18:00.",
      occurrence: "start",
    });

    pushEvent(eventsByDate, event.date, {
      ...event,
      description: "Termina hoy a las 18:00.",
      occurrence: "end",
    });
  }

  let selectedDate = null;

  function isMobile() {
    return Boolean(isMobileQuery?.matches);
  }

  function openMobileModal(dateKey, selectedEvents) {
    if (!modalRoot || !modalTitle || !modalBody) return;
    if (!isMobile()) return;
    if (!selectedEvents || selectedEvents.length === 0) return;

    modalTitle.textContent = formatDateES(dateKey);
    modalBody.textContent = "";

    for (const event of selectedEvents) {
      const card = document.createElement("div");
      card.className = "event-card";

      const name = document.createElement("h3");
      name.className = "event-name";
      name.textContent = event.title;

      const date = document.createElement("p");
      date.className = "event-date";

      const range = eventRange(event);
      date.textContent = range.isFixedDate
        ? `${formatDateES(dateKey)}`
        : `${formatDateES(dateKey)} · Inicio: ${range.start} · Fin: ${range.end}`;

      const desc = document.createElement("p");
      desc.className = "event-desc";
      desc.textContent = event.description;

      card.appendChild(name);
      card.appendChild(date);
      card.appendChild(desc);
      modalBody.appendChild(card);
    }

    modalRoot.classList.add("is-open");
    modalRoot.setAttribute("aria-hidden", "false");
  }

  function closeMobileModal() {
    if (!modalRoot) return;
    modalRoot.classList.remove("is-open");
    modalRoot.setAttribute("aria-hidden", "true");
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function formatDateES(yyyyMmDd) {
    const [y, m, d] = yyyyMmDd.split("-").map((v) => Number(v));
    return `${d} de ${monthNames[m - 1]} de ${y}`;
  }

  function prevDate(yyyyMmDd) {
    const [y, m, d] = yyyyMmDd.split("-").map((v) => Number(v));
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() - 1);
    const yy = dt.getUTCFullYear();
    const mm = pad2(dt.getUTCMonth() + 1);
    const dd = pad2(dt.getUTCDate());
    return `${yy}-${mm}-${dd}`;
  }

  function eventRange(event) {
    const rangeType = event.range ?? "sunsetToSunset";
    if (rangeType === "fixedDate") {
      return {
        startDate: event.date,
        start: event.date,
        end: event.date,
        isFixedDate: true,
      };
    }

    const startDate = prevDate(event.date);
    const start = `${startDate} 18:00`;
    const end = `${event.date} 18:00`;

    return { startDate, start, end, isFixedDate: false };
  }

  function dayOfWeekMondayFirst(year, monthIndex0, day) {
    // JS: 0=domingo..6=sábado. Convertimos a lunes=0..domingo=6
    const js = new Date(year, monthIndex0, day).getDay();
    return (js + 6) % 7;
  }

  function daysInMonth(year, monthIndex0) {
    return new Date(year, monthIndex0 + 1, 0).getDate();
  }

  function buildMonth(monthIndex0) {
    const monthEl = document.createElement("section");
    monthEl.className = "month";

    const header = document.createElement("div");
    header.className = "month-header";

    const h3 = document.createElement("h3");
    h3.className = "month-title";
    h3.textContent = `${monthNames[monthIndex0][0].toUpperCase()}${monthNames[monthIndex0].slice(1)}`;

    const meta = document.createElement("p");
    meta.className = "month-meta";
    meta.textContent = String(YEAR);

    header.appendChild(h3);
    header.appendChild(meta);

    const weekdays = document.createElement("div");
    weekdays.className = "weekdays";
    for (const label of weekdayLabels) {
      const d = document.createElement("div");
      d.textContent = label;
      weekdays.appendChild(d);
    }

    const grid = document.createElement("div");
    grid.className = "days";

    const firstDow = dayOfWeekMondayFirst(YEAR, monthIndex0, 1);
    const totalDays = daysInMonth(YEAR, monthIndex0);

    for (let i = 0; i < firstDow; i++) {
      const empty = document.createElement("div");
      empty.className = "day empty";
      grid.appendChild(empty);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dayEl = document.createElement("div");
      dayEl.className = "day";

      const mm = pad2(monthIndex0 + 1);
      const dd = pad2(day);
      const dateKey = `${YEAR}-${mm}-${dd}`;

      const number = document.createElement("div");
      number.className = "day-number";
      number.textContent = String(day);
      dayEl.appendChild(number);

      const dayEvents = eventsByDate.get(dateKey);
      if (dayEvents && dayEvents.length > 0) {
        const primary = dayEvents[0];
        dayEl.classList.add("is-event");

        dayEl.classList.add("is-clickable");
        dayEl.dataset.date = dateKey;
        dayEl.setAttribute("role", "button");
        dayEl.setAttribute("tabindex", "0");
        dayEl.setAttribute("aria-label", `${primary.title} (${formatDateES(dateKey)})`);

        const dot = document.createElement("div");
        dot.className = "event-dot";
        dot.title = primary.title;
        dayEl.appendChild(dot);

        const label = document.createElement("div");
        label.className = "event-label";
        label.textContent = dayEvents.length === 1 ? primary.title : `${dayEvents.length} eventos`;
        dayEl.appendChild(label);

        if (dayEvents.length === 1) {
          const range = eventRange(primary);
          dayEl.title = range.isFixedDate
            ? `${primary.title}\n${formatDateES(dateKey)}`
            : `${primary.title}\n${formatDateES(dateKey)}\nInicio: ${range.start}\nFin: ${range.end}`;
        } else {
          dayEl.title = dayEvents.map((e) => e.title).join("\n");
        }

        dayEl.addEventListener("click", () => selectDate(dateKey));
        dayEl.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectDate(dateKey);
          }
        });
      } else {
        dayEl.title = formatDateES(dateKey);
      }

      grid.appendChild(dayEl);
    }

    monthEl.appendChild(header);
    monthEl.appendChild(weekdays);
    monthEl.appendChild(grid);

    return monthEl;
  }

  function selectDate(dateKey) {
    selectedDate = dateKey;

    document.querySelectorAll(".day.is-selected").forEach((el) => el.classList.remove("is-selected"));
    const target = document.querySelector(`.day.is-clickable[data-date='${dateKey}']`);
    if (target) target.classList.add("is-selected");

    renderSelectedEvent();

    const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) : null;
    openMobileModal(selectedDate, selectedEvents);
  }

  function renderYear() {
    const root = document.getElementById("yearCalendar");
    root.textContent = "";

    for (let m = 0; m < 12; m++) {
      root.appendChild(buildMonth(m));
    }
  }

  function renderEventsList() {
    // No-op.
  }

  function renderSelectedEvent() {
    const list = document.getElementById("eventsList");
    list.textContent = "";

    const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) : null;
    if (!selectedEvents || selectedEvents.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "Selecciona una fecha marcada en el calendario.";
      list.appendChild(empty);
      return;
    }

    for (const event of selectedEvents) {
      const card = document.createElement("div");
      card.className = "event-card";

      const name = document.createElement("h3");
      name.className = "event-name";
      name.textContent = event.title;

      const date = document.createElement("p");
      date.className = "event-date";

      const range = eventRange(event);
      date.textContent = range.isFixedDate
        ? `${formatDateES(selectedDate)}`
        : `${formatDateES(selectedDate)} · Inicio: ${range.start} · Fin: ${range.end}`;

      const desc = document.createElement("p");
      desc.className = "event-desc";
      desc.textContent = event.description;

      card.appendChild(name);
      card.appendChild(date);
      card.appendChild(desc);
      list.appendChild(card);
    }
  }

  // Render inicial
  renderYear();
  renderEventsList();
  renderSelectedEvent();

  if (modalRoot) {
    modalRoot.addEventListener("click", (e) => {
      const el = e.target;
      if (el instanceof HTMLElement && el.dataset.modalClose === "true") {
        closeMobileModal();
      }
    });

    modalCloseBtn?.addEventListener("click", closeMobileModal);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMobileModal();
    });

    isMobileQuery?.addEventListener?.("change", () => {
      if (!isMobile()) closeMobileModal();
    });
  }
})();
