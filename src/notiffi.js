import { getStore, deleteOne, deleteAll, markAsRead } from "./api.js";
import { getUser, textNotif, getAward, createPopUp } from "./utils.js";
import potion from "@poumon/potion";

const Notiffi = {
  isLogged: _userdata["session_logged_in"],
  store: [],
  unread: null,
  ...(_userdata["session_logged_in"] && {
    syncStore: potion.sync("all_notifs", {
      notifs: [],
      isEmpty: true,
      text: "Aucune notification",
    }),
  }),
  ...(_userdata["session_logged_in"] && { syncUnread: potion.sync("unread_notifs", { count: "" }) }),
  refresh: 0,
  users: {},
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

  init: async function (options = {}) {
    // Check if user is logged in
    if (!_userdata["session_logged_in"]) return;

    createPopUp({
      button: options.button || "#notiffi_button",
      panel: options.panel || "#notiffi_panel",
    });

    // Handling options
    if (options.disableIcon == true) {
      this.disableIcon = true;
    }

    if (options.icons) {
      for (const key in options.icons) {
        if (this.type[key]) {
          this.type[key].icon = options.icons[key];
        }
      }
    }

    // Actions when the Toolbar original methods are called
    // Essentials to get the alert notifications updates
    const handleMethodCall = async (fnName) => {
      if (fnName === "refresh") {
        // Count the intercepted calls to avoid the first one (the first one is triggered by the page load)
        this.refresh++;

        // Fetch the notifications with a custom method
        const storeAPI = await getStore();

        // Update the store and the unread count
        this.store = storeAPI.store;
        this.displayNotifications(this.store);

        this.unread = storeAPI.unread;
        this.handleUnread(this.unread);

        // Create an alert notification with the last notification in store when it's not the first intercepted call (refresh > 1)
        if (this.refresh > 1 && !document.querySelector(`[data-notif-id="${this.store.at(-1).text.id}"]`)) {
          this.alertNotif(options.timeout ? options.timeout : 5000, this.store.at(-1));
        }
      }
    };
    this.manageNotifications();

    // Toolbar proxy
    Toolbar = this.interceptMethodCalls(Toolbar, handleMethodCall);
  },

  alertNotif: async function (timeout, notif) {
    const { from, type } = notif.text;

    let avatar = "";
    let text = Toolbar.compileNotif(notif);

    if (from) {
      const userData = await getUser(from);
      avatar = userData.avatar;
      text = textNotif(notif, userData.color);
    }

    const toast = potion("alert_notif", {
      alert: {
        type: this.type[type].name,
        icon: this.type[type].icon,
        avatar: type === 14 ? getAward(notif) : avatar,
        text,
      },
    });
    const parser = new DOMParser();
    const toastNode = parser.parseFromString(toast, "text/html").body.firstChild;

    document.body.appendChild(toastNode);

    // Forcer un reflow pour garantir l'application des styles initiaux
    toastNode.getBoundingClientRect();

    // Ajouter la classe après le reflow
    requestAnimationFrame(() => {
      toastNode.classList.add("up");
    });

    setTimeout(() => {
      toastNode.classList.remove("up");
      setTimeout(() => toastNode.remove(), 1000); // Attendre la fin de l'animation
    }, timeout);

    document.body.addEventListener("click", (e) => {
      if (e.target.closest("#alert_dismiss")) {
        toastNode.classList.remove("up");
        setTimeout(() => toastNode.remove(), 1000);
      }
    });
  },

  renderNotif: async function (notifs) {
    let renderedNotifs = [];

    for (const n of notifs) {
      const { id, from, type } = n.text;

      let avatar = "";
      let text = Toolbar.compileNotif(n);

      if (from) {
        const userData = await getUser(from);
        avatar = userData.avatar;
        text = textNotif(n, userData.color);
      }

      renderedNotifs.push({
        id,
        read: n.read ? "" : "unread",
        type: this.type[type].name,
        ...(!this.disableIcon && { icon: this.type[type].icon }),
        avatar: type === 14 ? getAward(n) : avatar,
        text,
        time: n.time,
        async deleteNotif(e) {
          // TO DO : need to be fix ? somehow the first two notif get the same id arg only when i use it in this function
          const dataId = e.target.closest("[data-notif-id]").dataset.notifId;
          const data = await deleteOne(dataId, this.channel);

          Notiffi.store = data;
          Notiffi.displayNotifications();
          Notiffi.handleUnread();
        },
      });
    }
    return renderedNotifs.reverse();
  },

  /**
   * Display the notifications in the notification panel
   */
  displayNotifications: async function () {
    if (this.store.length === 0) {
      this.syncStore.notifs = [];
      this.syncStore.isEmpty = true;
    } else {
      this.syncStore.notifs = await this.renderNotif(this.store);
      this.syncStore.isEmpty = false;
    }
  },

  manageNotifications: function () {
    const buttons = {
      deleteAll: document.querySelector("#notiffi_delete_all"),
      markAllRead: document.querySelector("#notiffi_mark_as_read"),
    };

    for (const key in buttons) {
      const button = buttons[key];
      if (!button) {
        console.error(`NOTIFFI: Le bouton ${key} est introuvable.`);
        return;
      }

      const handlers = {
        deleteAll: async () => {
          const ids = this.store.map((notif) => notif.text.id);
          const deleted = await deleteAll(ids);
          if (deleted) {
            while (this.store.length > 0) {
              this.store.pop();
            }
            this.displayNotifications();
            this.handleUnread();
          }
        },
        markAllRead: async () => {
          const unreadNotifs = this.store.filter((notif) => !notif.read).map((notif) => notif.text.id);
          const read = await markAsRead(unreadNotifs);
          if (read) {
            this.handleUnread();
          }
        },
      };

      button.addEventListener("click", handlers[key]);
    }
  },

  /**
   * Update the unread count in the notification button
   */
  handleUnread: function () {
    const unreadCount = this.store.filter((notif) => !notif.read).length;
    this.unread = unreadCount;

    if (!unreadCount) {
      this.syncUnread.count = "";
    } else {
      this.syncUnread.count = this.unread;
    }
  },

  /**
   * Intercept method calls on the Toolbar original script and execute a function
   * @param {*} obj - Toolbar
   * @param {*} fn - function called when a method is intercepted
   * @returns {Proxy}
   */
  interceptMethodCalls: function (obj, fn) {
    return new Proxy(obj, {
      get(target, prop) {
        if (typeof target[prop] === "function") {
          return new Proxy(target[prop], {
            apply: (target, thisArg, argumentsList) => {
              fn(prop, argumentsList);
              return Reflect.apply(target, thisArg, argumentsList);
            },
          });
        } else {
          return Reflect.get(target, prop);
        }
      },
    });
  },
};

export default Notiffi;
