const token = "DB5AJF6-MWN4BHA-HWC7CN8-EXDVDFG";
const output = "json";
const file_type = "png";

const form = document.getElementById("screenshot-form");
const input = document.getElementById("url-input");
const gallery = document.getElementById("gallery");

// --- Галерея: вивести всі скріни ---
function renderGallery() {
  gallery.innerHTML = "";
  const items = JSON.parse(localStorage.getItem("gallery") || "[]");
  if (!items.length) {
    gallery.innerHTML =
      '<div style="color:#bbb;text-align:center;width:100%;padding:20px;">Поки що немає скріншотів</div>';
    return;
  }
  items.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.screenshot}" alt="Скріншот" class="screenshot-img"/>
      <a class="site-url" href="${item.url}" target="_blank">${item.url}</a>
      <div class="date">${item.date}</div>
      <div class="tags">
        <span class="tag">${item.tag}</span>
      </div>
      <div class="card-actions">
        <button data-idx="${i}" class="download-btn">Скачати</button>
        <button data-idx="${i}" class="copy-btn">Копіювати</button>
        <button data-idx="${i}" class="delete-btn">Видалити</button>
      </div>
    `;
    gallery.appendChild(card);
  });
}

function saveToGallery(screenshot, url) {
  let items = JSON.parse(localStorage.getItem("gallery") || "[]");
  items.unshift({
    screenshot,
    url,
    date: new Date().toLocaleDateString(),
    tag: file_type,
  });
  localStorage.setItem("gallery", JSON.stringify(items));
  renderGallery();
}

// --- Обробка форми ---
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const urlToScreenshot = input.value.trim();
  if (!urlToScreenshot) return;

  form.querySelector("button[type=submit]").disabled = true;

  fetch(
    `https://shot.screenshotapi.net/v3/screenshot?token=${token}&url=${encodeURIComponent(
      urlToScreenshot
    )}&output=${output}&file_type=${file_type}`,
    { method: "GET", redirect: "follow" }
  )
    .then((response) => response.json())
    .then((result) => {
      if (result.screenshot) {
        saveToGallery(result.screenshot, urlToScreenshot);
        input.value = "";
      } else {
        alert("Не вдалося отримати скріншот.");
      }
    })
    .catch((error) => {
      alert("Сталася помилка: " + error);
    })
    .finally(() => {
      form.querySelector("button[type=submit]").disabled = false;
    });
});

gallery.addEventListener("click", function (e) {
  const idx = e.target.dataset.idx;
  let items = JSON.parse(localStorage.getItem("gallery") || "[]");
  if (e.target.classList.contains("delete-btn")) {
    items.splice(idx, 1);
    localStorage.setItem("gallery", JSON.stringify(items));
    renderGallery();
  } else if (e.target.classList.contains("download-btn")) {
    const link = document.createElement("a");
    link.href = items[idx].screenshot;
    link.download = `screenshot-${Date.now()}.png`;
    link.click();
  } else if (e.target.classList.contains("copy-btn")) {
    navigator.clipboard.writeText(items[idx].screenshot).then(() => {
      e.target.innerText = "Скопійовано!";
      setTimeout(() => (e.target.innerText = "Копіювати"), 1500);
    });
  }
});

renderGallery();
