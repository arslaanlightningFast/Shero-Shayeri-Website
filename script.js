// Sher-o-Shayari
// - Renders shayari cards
// - Filters by category
// - Searches by text
// - Copy-to-clipboard per card

const shayariData = [
  {
    id: "love-1",
    category: "Love",
    text: "Main bas itna chahta hoon… tujhe woh mil jaye jiski tujhe sach mein zarurat hai, kyunki tujh mein hi mera sukoon hai.",
  },
  {
    id: "love-2",
    category: "Love",
    text: "Hijr ki raatein lambi sahi… par teri yaadein har lamhe ko roshan kar deti hain.",
  },
  {
    id: "love-3",
    category: "Love",
    text: "Teri khamoshi mein bhi main mohabbat dhoondh leta hoon… kyunki tere bina bole bhi lafz meri dua ban jaate hain.",
  },
  {
    id: "sad-1",
    category: "Sad",
    text: "Jo vaade toot gaye, woh yaad ban ke dil mein reh gaye -- ab bas khamoshi jawab deti hai.",
  },
  {
    id: "sad-2",
    category: "Sad",
    text: "Aansu na bhi girein toh kya -- dil ki nami kam nahi hoti, yaadein raat bhar bheegoti rehti hain.",
  },
  {
    id: "sad-3",
    category: "Sad",
    text: "Maine khud ko samjhaya, 'bhool ja'… par tera naam har saans mein thahar jata hai.",
  },
  {
    id: "mot-1",
    category: "Motivation",
    text: "Agar raasta mushkil ho toh bhi chalte rehna -- success aksar silent steps se aati hai.",
  },
  {
    id: "mot-2",
    category: "Motivation",
    text: "Khud par yakeen rakh -- kyunki jo dreams tum dekhte ho, wahi tumhe change karke reality ban jaate hain.",
  },
  {
    id: "mot-3",
    category: "Motivation",
    text: "Haar mat maanna -- bas pace badalna seekho; manzil tumhara naam phir se pukaregi.",
  },
  {
    id: "love-4",
    category: "Love",
    text: "Tu paas ho toh duniya beautiful lagti hai, aur door ho toh yaadon ki roshni kaafi hoti hai.",
  },
];

const gridEl = document.getElementById("shayariGrid");
const emptyEl = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");

let activeCategory = "All";
let searchQuery = "";

function escapeHtml(str) {
  // Keeping it simple and safe for text rendering.
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function matchesFilters(item) {
  const categoryOk = activeCategory === "All" || item.category === activeCategory;
  if (!categoryOk) return false;
  if (!searchQuery.trim()) return true;

  const q = searchQuery.trim().toLowerCase();
  return item.text.toLowerCase().includes(q);
}

function cardTemplate(item) {
  return `
    <article class="card" data-id="${item.id}">
      <div class="card-content">
        <div class="category-tag">${escapeHtml(item.category)}</div>
        <p class="shayari">${escapeHtml(item.text)}</p>

        <div class="actions" aria-label="Card actions">
          <button class="btn copy" type="button">Copy</button>
        </div>
      </div>
    </article>
  `;
}

function render() {
  const filtered = shayariData.filter(matchesFilters);

  emptyEl.hidden = filtered.length !== 0 ? true : false;
  emptyEl.textContent = filtered.length === 0 ? "No shayari found. Try another search." : "";

  gridEl.innerHTML = filtered.map(cardTemplate).join("");

  // Fade-in animation when cards enter viewport.
  const cards = gridEl.querySelectorAll(".card");
  if (!cards.length) return;

  // IntersectionObserver is widely supported; fallback shows cards immediately.
  if (!("IntersectionObserver" in window)) {
    cards.forEach((c) => c.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );

  cards.forEach((c) => observer.observe(c));
}

function wireEvents() {
  // Category buttons
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category || "All";
      filterButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      render();
    });
  });

  // Search
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value || "";
    render();
  });

  // Delegate click handling for copy (works after re-render).
  gridEl.addEventListener("click", async (e) => {
    const card = e.target.closest(".card");
    if (!card) return;

    const id = card.dataset.id;
    const item = shayariData.find((s) => s.id === id);
    if (!item) return;

    if (e.target.closest(".copy")) {
      await copyText(item.text);
      // Small visual feedback: briefly change button text.
      const copyBtn = e.target.closest(".copy");
      const old = copyBtn.textContent;
      copyBtn.textContent = "Copied!";
      copyBtn.disabled = true;
      setTimeout(() => {
        copyBtn.textContent = old;
        copyBtn.disabled = false;
      }, 900);
    }
  });
}

async function copyText(text) {
  // Prefer modern Clipboard API.
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for older browsers.
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "absolute";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

// Init
wireEvents();
render();

