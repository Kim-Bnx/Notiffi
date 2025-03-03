# Notiffi
A forumactif plugin for a better notification system :

- Unlike the original toolbar, you now have access to the HTML structure of the notifications. Useful for a better personnalisation!
- Add some functionnaly like "mark all as read" or "delete everything" buttons.
- Better UI in general : add the notification date, the avatar of the user who notify you and the possibily to customize the notification depending of their type (new mp, new post, tag, ...).
- Improving the live alert notification in a cute little toaster.

▶️ [SEE THE DOCUMENTATION](https://blankthemerpg.forumactif.com/t203-notiffi)

![Notiffi demo](./Demo%20preview.gif)

## Try it 

Once you've cloned the repo, run `npm i`
- `npm run dev` to build instantly 
- `npm run serve` to try on a local serve

Don't forget to initialize the plugin in your HTML page

```html
<script>Notiffi.init()</script>
```

## Plugin options


```html
<script>Notiffi.init({
  button: '...',
  panel: '...',
  timeout: 5000,
  icons: {
    0: '...'
  },
})</script>
```

- `button: (string)`
CSS selector of the panel toggle

- `panel: (string)` CSS selector of the panel
- `timeout: (number)` alert duration before dismiss
- `disableIcon: (boolean)` disable the display of notification icon type
- `icons: : (objet)` customize the icon content 

```html
<script>Notiffi.init({
  icons: {
    0: 'Private message',
    1: ':triangular_flag_on_post:',
    2: '<i class="bi bi-person-fill-add"></i>'
  }
})</script>
```

### Notification type :
| Type ID | Type name |
|-------|-------|
|`0`| nouveau message privé|
|`1`| notif_report|
|`2`| invitation d'ami|
|`3`| demande d'ajout à un groupe|
|`4`| conversation avec un ami|
|`5`| message sur le mur de profil|
|`6`| report d'abus|
|`7`| nouveau poste dans un sujet suivi|
|`8`| mention|
|`9`| utilisation d'un tag suivi|
|`10`| nouvelle notification push|
|`11`| "j'aime" d'un poste|
|`12`| "je n'aime pas" d'un poste|
|`13`| nouveau sujet dans un forum suivi|
|`14`| nouvelle récompense obtenue|
|`15`| un membre suivi a posté un nouveau message|
|`16`| un membre suivi a créé un nouveau sujet|
