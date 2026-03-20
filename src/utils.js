/** * Fetch the user avatar from its profile page * @param {object} user - user object from the store * @returns avatar image URL */
export async function getUser(user) {
  const { id } = user;

  const { name } = user;
  const parser = new DOMParser();
  const parsedName = parser.parseFromString(name, "text/html");

  const textName = parsedName.querySelector("*").textContent;

  // Check if the user is already in the cache avoiding a new fetch
  if (Notiffi.users[id]) return Notiffi.users[id];

  try {
    const response = await fetch(`/u${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();
    const doc = parser.parseFromString(html, "text/html");

    // Récupération de l'avatar
    const img = doc.querySelector(`img[alt="${textName}"]`);
    const avatar = img ? `<img loading="lazy" src=${img.src} />` : "";

    // Stocker dans le cache
    Notiffi.users[id] = { avatar };

    return Notiffi.users[id];
  } catch (error) {
    console.error(`Error fetching avatar for user ${textName}`, error);
    return null;
  }
}

export function getAward(notif) {
  return `<img src="${notif.text.award.award_image}" />`;
}

export function createPopUp({ button, panel }) {
  const buttonElement = document.querySelector(button);
  const panelElement = document.querySelector(panel);

  if (!buttonElement || !panelElement) {
    console.error("Notiffi popup : button or panel selector not found.");
    return;
  }

  function togglepanel() {
    buttonElement.classList.toggle("active");
    panelElement.classList.toggle("open");
  }

  function closepanel() {
    buttonElement.classList.remove("active");
    panelElement.classList.remove("open");
  }

  function handleClickOutside(event) {
    if (!buttonElement.contains(event.target) && !panelElement.contains(event.target) && panelElement.classList.contains("open")) {
      closepanel();
    }
  }

  // Ajout des listeners
  buttonElement.addEventListener("click", togglepanel);
  document.addEventListener("click", handleClickOutside);
}
