export async function buildNotif(n, { getUser }) {
  const { from } = n.text;

  let name = "";
  let avatar = "";
  let text = Toolbar.compileNotif(n);
  let color = "";

  function textNotif(notif, color) {
    const { from } = notif.text;
    return Toolbar.compileNotif(notif).replace(new RegExp(`(<a href="/u${from.id}")`, "g"), `$1 style="color: ${color}"`);
  }

  if (from) {
    const userData = await getUser(from);
    name = from.name === "Anonymous" ? "" : from.name;
    avatar = userData.avatar;
    color = userData.color;
    text = textNotif(n, color);
  }

  return { name, avatar, text, color };
}

export function getAward(notif) {
  return `<img src="${notif.text.award.award_image}" />`;
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
