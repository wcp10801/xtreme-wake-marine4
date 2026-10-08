const app = document.querySelector("#app");
let SITE = null;

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => {
    const name = { "&": "amp", "<": "lt", ">": "gt", '"': "quot", "'": "#39" }[c];
    return "&" + name + ";";
  });
}

function phoneTel(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits || "5309062022";
}

function slugify(value) {
  return String(value || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function img(path) {
  if (!path) return "hero-lot.jpg";
  if (/^https?:/i.test(path)) return path;
  return String(path).replace(/^\//, "");
}

function listings() {
  return (SITE.items || []).map((item, index) => {
    const slug = String(item.slug || slugify(item.name) || "unit-" + (index + 1)).trim();
    return { ...item, slug, sold: Boolean(item.sold), category: item.category || "Boat", price: item.price || "Call" };
  });
}

function route() {
  const raw = (location.hash || "#/").replace(/^#/, "") || "/";
  const parts = raw.split("?")[0].split("/").filter(Boolean);
  if (parts[0] === "listing" && parts[1]) return { name: "listing", slug: decodeURIComponent(parts[1]) };
  if (parts[0] === "inventory") return { name: "inventory" };
  if (parts[0] === "services") return { name: "services" };
  if (parts[0] === "about") return { name: "about" };
  if (parts[0] === "contact") return { name: "contact" };
  return { name: "home" };
}

function card(item) {
  const tag = item.sold ? "Sold" : item.category;
  const price = item.sold ? "Sold" : item.price;
  const hours = item.hours ? `<p class="muted" style="margin:4px 0 0;font-size:13px">${esc(item.hours)}</p>` : "";
  return `<a class="card" href="#/listing/${encodeURIComponent(item.slug)}">
    <div class="pic"><img src="${esc(img(item.image))}" alt="${esc(item.name)}"><span class="tag">${esc(tag)}</span></div>
    <div class="pad">
      <div class="display" style="font-size:20px">${esc(item.name)}</div>
      ${hours}
      <p class="muted" style="font-size:14px;min-height:2.6em">${esc(item.blurb || "")}</p>
      <div class="price">${esc(price)}</div>
    </div>
  </a>`;
}

function applyChrome() {
  const s = SITE.settings;
  document.title = s.businessName || "Xtreme Wake Marine";
  document.querySelectorAll("[data-name]").forEach((el) => { el.textContent = s.businessName || "Xtreme Wake Marine"; });
  document.querySelectorAll("[data-phone]").forEach((el) => {
    el.textContent = s.phone || "";
    if (el.tagName === "A") el.href = `tel:${phoneTel(s.phone)}`;
  });
  document.querySelectorAll("[data-email]").forEach((el) => {
    el.textContent = s.email || "";
    if (el.tagName === "A") el.href = `mailto:${s.email || ""}`;
  });
  document.querySelectorAll("[data-address]").forEach((el) => {
    el.innerHTML = `${esc(s.address)}<br>${esc(s.city)}`;
  });
  document.querySelectorAll("[data-hours]").forEach((el) => { el.textContent = s.hours || ""; });
  const current = route().name === "listing" ? "inventory" : route().name;
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.classList.toggle("on", el.dataset.nav === current);
  });
}

function home() {
  const s = SITE.settings;
  const featured = listings().filter((item) => !item.sold).slice(0, 6);
  const gallery = (s.gallery || []).map((photo) =>
    `<div style="overflow:hidden;border-radius:14px"><img src="${esc(img(photo.src))}" alt="${esc(photo.alt || "")}" style="height:180px;width:100%;object-fit:cover"></div>`
  ).join("");
  return `<section class="hero">
      <img class="bg" src="${esc(img(s.heroImage))}" alt="Xtreme Wake Marine lot">
      <div class="scrim"></div>
      <div class="wrap copy">
        <p class="eyebrow">${esc(s.heroEyebrow)}</p>
        <h1>${esc(s.heroTitle)}<br><span>${esc(s.heroAccent)}</span></h1>
        <p class="muted" style="font-size:18px">${esc(s.heroText)}</p>
        <div class="row">
          <a class="btn" href="#/inventory">View inventory</a>
          <a class="btn ghost" href="#/contact">Book service</a>
        </div>
      </div>
    </section>
    <div class="bar">${esc(s.brandsLine)} · V-drive and direct drive · Gelcoat, mechanical, upgrades</div>
    <section><div class="wrap">
      <h2>On the lot</h2>
      <p class="muted">Real units from the shop. Photos are theirs — not stock.</p>
      <div class="grid cards" style="margin-top:28px">${featured.map(card).join("")}</div>
      <p style="margin-top:28px"><a class="btn ghost" href="#/inventory">All inventory</a></p>
    </div></section>
    <section style="background:#121212"><div class="wrap">
      <h2>The shop</h2>
      <p class="muted">Boats, trucks, and bays from their own floor.</p>
      <div class="grid shop" style="margin-top:28px">${gallery}</div>
    </div></section>`;
}

function inventoryPage() {
  const all = listings();
  const sale = all.filter((item) => !item.sold);
  const sold = all.filter((item) => item.sold);
  return `<section><div class="wrap">
    <h1 style="font-size:clamp(40px,6vw,64px)">Inventory</h1>
    <p class="muted">Boats, trucks, and SUVs from the lot. Open a unit for details.</p>
    <h2 style="margin-top:36px">For sale</h2>
    <div class="grid cards">${sale.map(card).join("") || "<p class='muted'>Nothing listed right now. Call the shop.</p>"}</div>
    <h2 style="margin-top:48px">Sold</h2>
    <div class="grid cards">${sold.map(card).join("")}</div>
  </div></section>`;
}

function listingPage(slug) {
  const item = listings().find((entry) => entry.slug === slug);
  if (!item) {
    return `<section><div class="wrap"><h1>Not listed</h1><p class="muted">That unit is not on the site.</p><a class="btn" href="#/inventory">Back to inventory</a></div></section>`;
  }
  const price = item.sold ? "Sold" : item.price;
  return `<section><div class="wrap grid split">
    <div>
      <a class="muted" href="#/inventory">← Inventory</a>
      <img src="${esc(img(item.image))}" alt="${esc(item.name)}" style="border-radius:16px;margin-top:12px;width:100%;max-height:560px;object-fit:cover">
    </div>
    <div>
      <p class="eyebrow">${item.sold ? "Sold" : esc(item.category)}</p>
      <h1 style="font-size:clamp(36px,5vw,56px)">${esc(item.name)}</h1>
      ${item.hours ? `<p class="muted">${esc(item.hours)}</p>` : ""}
      <p class="muted" style="font-size:18px">${esc(item.blurb || "")}</p>
      <p class="price" style="font-size:40px">${esc(price)}</p>
      <p class="muted">Call or text to confirm it is still available.</p>
      <div class="row">
        <a class="btn" data-phone href="tel:${phoneTel(SITE.settings.phone)}">${esc(SITE.settings.phone)}</a>
        <a class="btn ghost" href="#/contact">Ask about this unit</a>
      </div>
    </div>
  </div></section>`;
}

function servicesPage() {
  const s = SITE.settings;
  const blocks = (s.services || []).map((service) =>
    `<div class="feat"><h3 class="display" style="font-size:26px;margin:0 0 8px">${esc(service.title)}</h3><p class="muted">${esc(service.body)}</p></div>`
  ).join("");
  const photo = (s.gallery || [])[1] || (s.gallery || [])[0];
  return `<section><div class="wrap">
    <h1 style="font-size:clamp(40px,6vw,64px)">Services</h1>
    <p class="muted" style="max-width:640px">${esc(s.servicesIntro)}</p>
    <div class="grid services" style="margin-top:28px">${blocks}</div>
    ${photo ? `<img src="${esc(img(photo.src))}" alt="${esc(photo.alt || "")}" style="margin-top:28px;border-radius:16px;width:100%;max-height:420px;object-fit:cover">` : ""}
    <p style="margin-top:24px"><a class="btn" href="#/contact">Book service</a></p>
  </div></section>`;
}

function aboutPage() {
  const s = SITE.settings;
  const paragraphs = String(s.aboutBody || "").split(/\n\n+/).map((part) => `<p class="muted" style="font-size:18px">${esc(part)}</p>`).join("");
  const bullets = (s.aboutBullets || []).map((line) => `<li>${esc(line)}</li>`).join("");
  const photos = s.gallery || [];
  const top = photos[3] || photos[0];
  const left = photos[2] || photos[0];
  const right = photos[5] || photos[1] || photos[0];
  return `<section><div class="wrap grid split">
    <div>
      <h1 style="font-size:clamp(40px,6vw,64px)">${esc(s.aboutTitle)}</h1>
      ${paragraphs}
      <ul class="bullets">${bullets}</ul>
      <a class="btn" href="#/contact" style="margin-top:18px">Get in touch</a>
    </div>
    <div>
      ${top ? `<img src="${esc(img(top.src))}" alt="${esc(top.alt || "")}" style="border-radius:16px;width:100%;height:280px;object-fit:cover">` : ""}
      <div class="grid" style="grid-template-columns:1fr 1fr;margin-top:12px">
        ${left ? `<img src="${esc(img(left.src))}" alt="" style="border-radius:16px;height:160px;width:100%;object-fit:cover">` : ""}
        ${right ? `<img src="${esc(img(right.src))}" alt="" style="border-radius:16px;height:160px;width:100%;object-fit:cover">` : ""}
      </div>
    </div>
  </div></section>`;
}

function contactPage() {
  const s = SITE.settings;
  const s2 = SITE.settings;
  return `<section><div class="wrap grid split">
    <div>
      <h1 style="font-size:clamp(40px,6vw,64px)">Contact</h1>
      <p class="muted">Call or text for the fastest response. Seasonal for boat repair, available by appointment in the off-season.</p>
      <p><strong>Phone</strong><br><a data-phone href="tel:${phoneTel(s.phone)}" style="color:var(--red);font-size:22px">${esc(s.phone)}</a></p>
      <p><strong>Email</strong><br><a data-email href="mailto:${esc(s.email)}">${esc(s.email)}</a></p>
      <p><strong>Shop</strong><br><span data-address></span></p>
      <p><strong>Hours</strong><br><span data-hours style="white-space:pre-line"></span></p>
      <img src="${esc(img(s.heroImage))}" alt="The lot" style="border-radius:16px;margin-top:12px;max-height:280px;width:100%;object-fit:cover">
    </div>
    <form id="contact-form" class="feat">
      <h2>Send a message</h2>
      <input type="text" name="bot-field" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
      <label class="muted">Name<input required name="name"></label>
      <label class="muted">Phone or email<input required name="contact"></label>
      <label class="muted">What do you need?
        <select name="need">
          <option>Service / repair</option>
          <option>Buy a boat or vehicle</option>
          <option>Sell / consignment</option>
          <option>General question</option>
        </select>
      </label>
      <label class="muted">Message<textarea name="message" rows="4"></textarea></label>
      <button class="btn" type="submit" style="width:100%">Send</button>
      <p id="form-note" class="muted"></p>
    </form>
  </div></section>`;
}

function render() {
  if (!SITE) return;
  applyChrome();
  const current = route();
  const pages = { home, inventory: inventoryPage, services: servicesPage, about: aboutPage, contact: contactPage };
  app.innerHTML = current.name === "listing" ? listingPage(current.slug) : pages[current.name]();
  applyChrome();
  const form = document.querySelector("#contact-form");
  if (form) form.addEventListener("submit", onContact);
  window.scrollTo(0, 0);
}

async function onContact(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const note = document.querySelector("#form-note");
  const body = new URLSearchParams({
    "form-name": "contact",
    "bot-field": data.get("bot-field") || "",
    name: data.get("name") || "",
    contact: data.get("contact") || "",
    need: data.get("need") || "",
    message: data.get("message") || "",
  });
  note.textContent = "Sending…";
  try {
    const response = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
    if (!response.ok) throw new Error("not accepted");
    form.reset();
    note.textContent = "Sent. For the fastest answer, call the shop.";
  } catch {
    const mail = SITE.settings.email || "";
    location.href = `mailto:${mail}?subject=${encodeURIComponent("Website inquiry")}&body=${encodeURIComponent(`${data.get("name")}\n${data.get("contact")}\n${data.get("need")}\n\n${data.get("message") || ""}`)}`;
    note.textContent = "Opening your email app so the message still gets through.";
  }
}

async function boot() {
  const [settings, inventory] = await Promise.all([
    fetch("content/settings.json", { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error("settings"); return r.json(); }),
    fetch("content/inventory.json", { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error("inventory"); return r.json(); }),
  ]);
  SITE = { settings, items: inventory.items || [] };
  render();
}

document.querySelector("#menu").addEventListener("click", () => {
  document.querySelector("#links").classList.toggle("open");
});
document.querySelector("#links").addEventListener("click", (event) => {
  if (event.target.closest("a")) document.querySelector("#links").classList.remove("open");
});
window.addEventListener("hashchange", render);
boot().catch(() => {
  app.innerHTML = `<section><div class="wrap"><h1>Site files missing</h1><p class="muted">Open this from the published site, not as a loose file, so the inventory can load.</p></div></section>`;
});
