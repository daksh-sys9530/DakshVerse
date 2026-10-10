(() => {
  const regions = {
    americas: {
      label: "Americas",
      center: [12, -78],
      zoom: 2.7,
      text: "Two continents linked by oceans, migration, trade, and many different Indigenous and national histories. Trace how geography and resources shape relationships.",
    },
    europe: {
      label: "Europe",
      center: [50, 15],
      zoom: 3.2,
      text: "A connected region whose histories include ancient networks, empires, industrial change, shifting borders, and institutions built across countries.",
    },
    "middle-east": {
      label: "Middle East",
      center: [29, 42],
      zoom: 3.2,
      text: "A crossroads of continents and seas. Trade, energy, religion, water, and political borders shape stories here; each country and community has its own history.",
    },
    africa: {
      label: "Africa",
      center: [1, 20],
      zoom: 2.8,
      text: "A continent of extraordinary linguistic, ecological, and cultural diversity. Explore its kingdoms, trade networks, cities, colonial histories, and contemporary societies.",
    },
    india: {
      label: "India",
      center: [22, 79],
      zoom: 4,
      text: "The subcontinent’s history connects rivers, monsoon patterns, languages, religions, trade routes, and political change.",
    },
    "east-asia": {
      label: "East Asia",
      center: [35, 115],
      zoom: 3.5,
      text: "A region connected by land and sea routes, distinct traditions, major cities, and changing political relationships.",
    },
  };
  const note = document.querySelector("#region-note");
  let map;
  if (window.L && document.querySelector("#world-map")) {
    map = L.map("world-map", { scrollWheelZoom: false }).setView([22, 15], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(map);
    Object.values(regions).forEach((r) =>
      L.marker(r.center)
        .addTo(map)
        .bindPopup(`<strong>${r.label}</strong><br>${r.text}`),
    );
  } else if (document.querySelector("#world-map"))
    document.querySelector("#world-map").innerHTML =
      '<p class="section-note">The map needs an internet connection to load. Region notes still work below.</p>';
  document.querySelectorAll("[data-region]").forEach((button) =>
    button.addEventListener("click", () => {
      const r = regions[button.dataset.region];
      if (!r) return;
      document
        .querySelectorAll("[data-region]")
        .forEach((b) => b.classList.toggle("active", b === button));
      note.replaceChildren();
      const h = document.createElement("h4");
      h.textContent = r.label;
      const p = document.createElement("p");
      p.textContent = r.text;
      note.append(h, p);
      if (map) {
        map.flyTo(r.center, r.zoom, { duration: 1 });
        L.popup()
          .setLatLng(r.center)
          .setContent(`<strong>${r.label}</strong><br>${r.text}`)
          .openOn(map);
      }
    }),
  );
  const postForm = document.querySelector("#post-form"),
    journalGrid = document.querySelector(".journal-grid"),
    postKey = "dakshverse-posts-v1";
  const readPosts = () => {
    try {
      return JSON.parse(localStorage.getItem(postKey) || "[]");
    } catch {
      return [];
    }
  };
  const addPostCard = (post) => {
    const card = document.createElement("article");
    card.className = "journal-card";
    card.dataset.tags = `${post.category} ${post.title}`.toLowerCase();
    const cover = document.createElement("div");
    cover.className = "post-cover";
    cover.textContent = "✦";
    const body = document.createElement("div");
    body.style.padding = "13px";
    const label = document.createElement("p");
    label.className = "eyebrow";
    label.textContent = `${post.category.toUpperCase()} · PERSONAL NOTE`;
    const title = document.createElement("h3");
    title.textContent = post.title;
    const date = document.createElement("p");
    date.textContent = post.date;
    const content = document.createElement("p");
    content.textContent = post.content;
    body.append(label, title, date, content);
    card.append(cover, body);
    journalGrid.prepend(card);
  };
  readPosts().forEach(addPostCard);
  postForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(postForm),
      posts = readPosts();
    posts.push({
      title: String(d.get("title")).trim(),
      category: String(d.get("category")).trim(),
      content: String(d.get("content")).trim(),
      date: new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(),
      ),
    });
    try {
      localStorage.setItem(postKey, JSON.stringify(posts.slice(-50)));
      addPostCard(posts[posts.length - 1]);
      postForm.reset();
    } catch {
      postForm.querySelector(".section-note").textContent =
        "Your browser could not save this note.";
    }
  });
  const search = document.querySelector("#journal-search");
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    let count = 0;
    document.querySelectorAll(".journal-card").forEach((card) => {
      const match = `${card.innerText} ${card.dataset.tags}`
        .toLowerCase()
        .includes(q);
      card.hidden = !match;
      if (match) count++;
    });
    document.querySelector("#journal-empty").hidden = count !== 0;
  });
  const form = document.querySelector("#review-form"),
    list = document.querySelector("#review-list"),
    key = "dakshverse-site-reviews-v1";
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  };
  const render = () => {
    list.replaceChildren();
    read()
      .slice()
      .reverse()
      .forEach((r) => {
        const a = document.createElement("article");
        a.className = "review-item";
        const h = document.createElement("h3");
        h.textContent = "Website review";
        const meta = document.createElement("p");
        meta.className = "review-meta";
        meta.textContent = `${r.name} · ${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)} · ${r.date}`;
        const p = document.createElement("p");
        p.textContent = r.message;
        a.append(h, meta, p);
        list.append(a);
      });
  };
  render();
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form),
      reviews = read();
    reviews.push({
      name: String(d.get("name")).trim(),
      rating: Number(d.get("rating")),
      message: String(d.get("message")).trim(),
      date: new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(),
      ),
    });
    try {
      localStorage.setItem(key, JSON.stringify(reviews.slice(-50)));
      render();
      form.reset();
    } catch {
      document.querySelector(".site-review-form .section-note").textContent =
        "Your browser could not save this review.";
    }
  });
  const poll = document.querySelector("#poll-form"),
    message = document.querySelector("#poll-message");
  try {
    const v = localStorage.getItem("dakshverse-poll-v1");
    if (v) {
      const input = [...poll.querySelectorAll("input")].find(
        (i) => i.value === v,
      );
      if (input) input.checked = true;
      message.textContent = `Your saved vote: ${v}. You can change it any time.`;
    }
  } catch {}
  poll.addEventListener("submit", (e) => {
    e.preventDefault();
    const choice = new FormData(poll).get("topic");
    try {
      localStorage.setItem("dakshverse-poll-v1", choice);
      message.textContent = `Your vote for “${choice}” is saved in this browser.`;
    } catch {
      message.textContent = "Your browser could not save the vote.";
    }
  });
  const toggle = document.querySelector(".theme-toggle");
  try {
    if (localStorage.getItem("dakshverse-theme-v1") === "light")
      document.body.classList.add("light-theme");
  } catch {}
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    try {
      localStorage.setItem(
        "dakshverse-theme-v1",
        document.body.classList.contains("light-theme") ? "light" : "dark",
      );
    } catch {}
  });
})();
