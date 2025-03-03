# Notiffi
A forumactif plugin for a better notification system :

- Unlike the original toolbar, you now have access to the HTML structure of notifications, allowing for better customization!
- Adds functionalities like "Mark all as read" and "Delete all" buttons.
- Improved UI: displays the notification date, the avatar of the user who notified you, and allows customization based on the notification type (new PM, new post, mention, etc.).
- Enhances live alert notifications with a cute little toaster.

▶️ [SEE THE DOCUMENTATION](https://blankthemerpg.forumactif.com/t203-notiffi)

![Notiffi demo](./Demo%20preview.gif)

## Try it 

Once you've cloned the repo, run `npm i`

- `npm run dev` → builds the project instantly.
- `npm run serve` → starts a local server to test the plugin.

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

- `button: (string)` CSS selector for the panel toggle
- `panel: (string)` CSS selector of the panel
- `timeout: (number)` duration before an alert disappears (in milliseconds)
- `disableIcon: (boolean)` disable the display of notification type icon
- `icons: : (objet)` customize the icon content 

Example :

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
|---------|----------|
| `0` | New private message |
| `1` | Report notification |
| `2` | Friend invitation |
| `3` | Group join request |
| `4` | Friend conversation |
| `5` | Wall post |
| `6` | Abuse report |
| `7` | New post in a followed topic |
| `8` | Mention |
| `9` | Followed tag used |
| `10` | New push notification |
| `11` | Post liked |
| `12` | Post disliked |
| `13` | New topic in a followed forum |
| `14` | New achievement unlocked |
| `15` | Followed member posted a message |
| `16` | Followed member created a new topic |
