import Component from "../spa/component.js";

export default class PongPage extends Component {
  constructor() {
    super("static/html/pong.html");
  }

  // onInit()
  // {
  //     map = document.getElementById('pong');
  //     ctx = map.getContext('2d');
  //     ctx.fillStyle = 'black';
  //     ctx.fillRect(0, 0, map.clientWidth, map.height);

  //     width = map.width;
  //     height = map.height;
  // }

  onInit() {
    debugger;
    map = document.getElementById("pong");
    const modalContainer = map.closest("#pongGameContainer");
    if (modalContainer) {
      map.width = 900;
      map.height = 550;
    } else {
      map.width = map.clientWidth;
      map.height = map.clientHeight;
    }
    ctx = map.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, map.width, map.height);

    width = map.width;
    height = map.height;
  }
}
