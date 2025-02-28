/**
 * Custom method to fetch the notifications store (the original one sucks)
 * @returns {Promise} - Fetch the notifications store
 */
export async function getStore() {
  try {
    const response = await fetch("/notif");
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
}

/**
 * Delete a notification method action
 * @param {notif} notif - notification object from the store
 */
export async function deleteOne(id, channel) {
  // Parse the payload
  const payload = new URLSearchParams();
  payload.append("id", id);
  payload.append("channel", channel);

  try {
    const res = await fetch(`/notif`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    // Remove the notification from the DOM
    document.querySelector(`[data-notif-id="${id}"]`).remove();

    const data = await res.json();
    return data.store;
  } catch (err) {
    console.error("Erreur lors de la suppression :", err);
  }
}

/**
 * Delete all notifications method action
 * (taken from the notification management page)
 */
export async function deleteAll(ids) {
  const payload = new URLSearchParams();

  // Add all the notifications to the payload
  ids.forEach((id) => payload.append("del_notif[]", id));
  payload.append("delete_all", "Tout supprimer");

  try {
    const res = await fetch(`/profile?mode=editprofile&page_profil=notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
    });

    if (!res.ok) throw new Error(`HTTP error! status ${res.status}`);
    return true;
  } catch (err) {
    console.error("Erreur lors de la suppression :", err);
  }
}

/**
 * Custom method action to mark a notification as read
 * @param {number} id - notification id
 */
export async function markAsRead(ids) {
  const payload = new URLSearchParams();
  ids.forEach((id) => payload.append("id[]", id));

  try {
    const res = await fetch(`/notif`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
    });

    if (!res.ok) throw new Error(`HTTP error! status ${res.status}`);
    //return true;
  } catch {
    console.error("Erreur lors de la suppression :", err);
  }
}
