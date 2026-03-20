import { getStore, deleteOne, deleteAll, markAsRead } from "./api.js";
import { interceptMethodCalls, animateToast, buildNotif, getAward } from "./utils.js";
import potion from "@poumon/potion";
const Notiffi = Blanket("Notiffi", function ({ getUser, warn, isConnected, createPopUp, parseHTML }) {
  const defaults = {
    button: "#notiffi_button",
    panel: "#notiffi_panel",
    disableIcon: false,
    type: {
      0: {
        name: "private_msg",
        icon: '<i class="bi bi-envelope-fill"></i>',
      },
      1: {
        name: "notif_report",
        icon: '<i class="bi bi-flag-fill"></i>',
      },
      2: {
        name: "friend_request",
        icon: '<i class="bi bi-person-fill-add"></i>',
      },
      3: {
        name: "group_req",
        icon: '<i class="bi bi-people-fill"></i>',
      },
      4: {
        name: "friend_conv",
        icon: '<i class="bi bi-people-fill"></i>',
      },
      5: {
        name: "wall_msg",
        icon: '<i class="bi bi-chat-fill"></i>',
      },
      6: {
        name: "abuse",
        icon: '<i class="bi bi-flag-fill"></i>',
      },
      7: {
        name: "topic_watch",
        icon: '<i class="bi bi-chat-fill"></i>',
      },
      8: {
        name: "mention",
        icon: '<i class="bi bi-at"></i>',
      },
      9: {
        name: "hashtag",
        icon: '<i class="bi bi-hash"></i>',
      },
      10: {
        name: "advert",
        icon: '<i class="bi bi-flag-fill"></i>',
      },
      11: {
        name: "like",
        icon: '<i class="bi bi-heart-fill"></i>',
      },
      12: {
        name: "dislike",
        icon: '<i class="bi bi-heart-half"></i>',
      },
      13: {
        name: "forum_watch",
        icon: '<i class="bi bi-chat-left-fill"></i>',
      },
      14: {
        name: "new_award",
        icon: '<i class="bi bi-star-fill"></i>',
      },
      15: {
        name: "follower_new_topic",
        icon: '<i class="bi bi-chat-left-fill"></i>',
      },
      16: {
        name: "follower_new_post",
        icon: '<i class="bi bi-chat-fill"></i>',
      },
    },
  };

  let config = { ...defaults };

  let store = [];
  let unread = null;

  const syncStore =
    isConnected() &&
    potion.sync("all_notifs", {
      notifs: [],
      isEmpty: true,
      text: "Aucune notification",
    });

  const syncUnread = isConnected() && potion.sync("unread_notifs", { count: "" });

  let refresh = 0;

  async function init(options = {}) {
    // Check if user is logged in
    if (!isConnected()) return;

    config = { ...defaults, ...options };

    createPopUp({
      button: config.button,
      panel: config.panel,
    });

    // Handling easier attribut config
    if (config.disableIcon == true) {
      config.disableIcon = true;
    }

    if (config.icons) {
      for (const key in config.icons) {
        if (config.type[key]) {
          config.type[key].icon = config.icons[key];
        }
      }
    }

    // Actions when the Toolbar original methods are called
    // Essentials to get the alert notifications updates
    const handleMethodCall = async (fnName) => {
      if (fnName === "refresh") {
        // Count the intercepted calls to avoid the first one (the first one is triggered by the page load)
        refresh++;

        // Fetch the notifications with a custom method
        const storeAPI = await getStore();

        // Update the store and the unread count
        store = storeAPI.store;
        displayNotifications(store);

        unread = storeAPI.unread;
        handleUnread(unread);

        // Create an alert notification with the last notification in store when it's not the first intercepted call (refresh > 1)
        if (refresh > 1 && !document.querySelector(`[data-notif-id="${store.at(-1).text.id}"]`)) {
          alertNotif(config.timeout ? config.timeout : 5000, store.at(-1));
        }
      }
    };
    manageNotifications();

    // Toolbar proxy
    Toolbar = interceptMethodCalls(Toolbar, handleMethodCall);
  }

  async function alertNotif(timeout, notif) {
    const { type, from } = notif.text;
    const rawName = from.name;

    // Blanket dependance
    const { avatar, name, text } = await buildNotif(notif, { getUser, parseHTML });

    const toast = potion("alert_notif", {
      alert: {
        type: config.type[type].name,
        icon: config.type[type].icon,
        name,
        isUser: rawName === "Anonymous" ? false : true,
        avatar: config.type === 14 ? getAward(notif) : avatar,
        text,
      },
    });
    const toastNode = parseHTML(toast).body.firstChild;

    document.body.appendChild(toastNode);
    animateToast(toastNode, { timeout });

    document.body.addEventListener("click", (e) => {
      if (e.target.closest("#alert_dismiss")) {
        toastNode.classList.remove("up");
        setTimeout(() => toastNode.remove(), 1000);
      }
    });
  }

  async function renderNotif(notifs) {
    let renderedNotifs = [];

    for (const n of notifs) {
      const { id, type, from } = n.text;
      const rawName = from.name;

      // Blanket dependance
      const { avatar, name, text } = await buildNotif(n, { getUser, parseHTML });

      renderedNotifs.push({
        id,
        read: n.read ? "" : "unread",
        type: config.type[type].name,
        ...(!config.disableIcon && { icon: config.type[type].icon }),
        name,
        isUser: rawName === "Anonymous" ? false : true,
        avatar: config.type[type] === 14 ? getAward(n) : avatar,
        text,
        time: n.time,
        async deleteNotif(e) {
          // TO DO : need to be fix ? somehow the first two notif get the same id arg only when i use it in this function
          const dataId = e.target.closest("[data-notif-id]").dataset.notifId;
          const data = await deleteOne(dataId, this.channel);

          store = data;
          displayNotifications();
          handleUnread();
        },
      });
    }
    return renderedNotifs.reverse();
  }

  /**
   * Display the notifications in the notification panel
   */
  async function displayNotifications() {
    if (store.length === 0) {
      syncStore.notifs = [];
      syncStore.isEmpty = true;
    } else {
      syncStore.notifs = await renderNotif(store);
      syncStore.isEmpty = false;
    }
  }

  async function manageNotifications() {
    const buttons = {
      deleteAll: document.querySelector("#notiffi_delete_all"),
      markAllRead: document.querySelector("#notiffi_mark_as_read"),
    };

    for (const key in buttons) {
      const button = buttons[key];
      if (!button) {
        warn(`Le bouton ${key} est introuvable.`);
        return;
      }

      const handlers = {
        deleteAll: async () => {
          const ids = store.map((notif) => notif.text.id);
          const deleted = await deleteAll(ids);
          if (deleted) {
            while (store.length > 0) {
              store.pop();
            }
            displayNotifications();
            handleUnread();
          }
        },
        markAllRead: async () => {
          const unreadNotifs = store.filter((notif) => !notif.read).map((notif) => notif.text.id);
          const read = await markAsRead(unreadNotifs);

          if (read) {
            store = store.map((item) => (item.read ? item : { ...item, read: 1 }));
            displayNotifications();
            handleUnread();
          }
        },
      };

      button.addEventListener("click", handlers[key]);
    }
  }

  /**
   * Update the unread count in the notification button
   */
  function handleUnread() {
    const unreadCount = store.filter((notif) => !notif.read).length;
    unread = unreadCount;

    if (!unreadCount) {
      syncUnread.count = "";
    } else {
      syncUnread.count = unread;
    }
  }

  return { init };
});

export default Notiffi;
