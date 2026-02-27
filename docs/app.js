async function loadData() {
  const resp = await fetch("./data/entries.json", { cache: "no-store" });
  if (!resp.ok) throw new Error("Failed to load data/entries.json");
  return await resp.json();
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

function render(entries) {
  const list = document.querySelector("#list");
  const empty = document.querySelector("#empty");
  list.innerHTML = "";

  if (!entries.length) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  for (const e of entries) {
    const card = el("div", "card");

    const top = el("div", "topline");
    top.appendChild(el("div", "name", e.name || "(Sin nombre)"));
    if (e.bar_number) top.appendChild(el("span", "badge", `#${e.bar_number}`));
    if (e.bucket) top.appendChild(el("span", "badge", e.bucket));
    if (e.effective_date) top.appendChild(el("span", "badge", `Fecha: ${formatDate(e.effective_date)}`));
    card.appendChild(top);

    card.appendChild(el("p", "en", e.summary_en || ""));
    card.appendChild(el("p", "es", e.summary_es ? `ES: ${e.summary_es}` : "ES: (sin traducción / no configurado)"));

    list.appendChild(card);
  }
}

function applyFilters(all) {
  const q = document.querySelector("#q").value.trim().toLowerCase();
  const bucket = document.querySelector("#bucket").value;

  return all.filter((e) => {
    if (bucket && (e.bucket || "") !== bucket) return false;
    if (!q) return true;

    const hay = [
      e.name,
      e.bar_number,
      e.bucket,
      e.summary_en,
      e.summary_es,
      e.effective_date
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return hay.includes(q);
  });
}

(async function init() {
  const data = await loadData();
  const all = data.entries || [];

  document.querySelector("#meta").textContent =
    `Última actualización: ${data.last_updated || "desconocida"} — Entradas: ${all.length}`;

  const buckets = uniq(all.map((e) => e.bucket));
  const sel = document.querySelector("#bucket");
  for (const b of buckets) {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    sel.appendChild(opt);
  }

  render(all);

  document.querySelector("#q").addEventListener("input", () => render(applyFilters(all)));
  document.querySelector("#bucket").addEventListener("change", () => render(applyFilters(all)));
})();
