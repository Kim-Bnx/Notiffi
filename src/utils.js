export async function buildNotif(n, { getUser, parseHTML }) {
  console.log(n);

  const { from } = n.text;
  console.log("is from", from);

  let id = from.id,
    name = "",
    avatar = "",
    text = Toolbar.compileNotif(n);

  if (from && from.name !== "Anonymous") {
    const parseName = parseHTML(from.name);
    const textName = parseName.querySelector("*").textContent;

    console.log("parse name: ", parseName);
    console.log("text content name: ", textName);

    const userData = await getUser({ parseName, id });
    name = textName;
    avatar = userData.avatar;
  }

  return { name, avatar, text };
}

export function getAward(notif) {
  return notif.text.award.award_image;
}

/**
 * Intercept method calls on the Toolbar original script and execute a function
 * @param {*} obj - Toolbar
 * @param {*} fn - function called when a method is intercepted
 * @returns {Proxy}
 */
export function interceptMethodCalls(obj, fn) {
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
}

/**
 * Ajoute une classe d'entrée, puis retire le node après délai.
 * @param {HTMLElement} node
 * @param {Object} options
 * @param {string} [options.enterClass="up"]
 * @param {number} options.timeout - durée avant sortie
 * @param {number} [options.exitDuration=1000] - durée animation de sortie
 */
export function animateToast(node, { enterClass = "up", timeout, exitDuration = 1000 } = {}) {
  if (!node) return;

  node.getBoundingClientRect(); // garantit styles init
  requestAnimationFrame(() => node.classList.add(enterClass));

  setTimeout(() => {
    node.classList.remove(enterClass);
    setTimeout(() => node.remove(), exitDuration);
  }, timeout);
}
