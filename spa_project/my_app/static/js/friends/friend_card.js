import Component from "../spa/component.js";

export default class FriendCard extends Component
{
  constructor(friend) {
    super('static/html/friends/friend_card.html');
    this.friend = friend;
  }

  renderCard() {
    return fetch(this.templateUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(template => {
        const statusClass = this.friend.status === 'online' ? 'online' : 'offline';
        let friendCard = template;
        friendCard = friendCard.replace('src=""', `src="${this.friend.photo}"`);
        friendCard = friendCard.replace('<a href=""', `<a href="perfil.html?user=${this.friend.id}"`);
        friendCard = friendCard.replace('</a>', `${this.friend.name}</a>`);
        friendCard = friendCard.replace('class="status"', `class="status ${statusClass}"`);
        return friendCard;
      })
      .catch(error => {
        console.error('Error fetching the template:', error);
      });
  }
}
