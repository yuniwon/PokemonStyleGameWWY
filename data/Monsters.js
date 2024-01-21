const embyImg = new Image(); // 앰비 이미지
embyImg.src = './Images/embySprite.png';
const draggleImg = new Image(); // 드래글 이미지
draggleImg.src = './Images/draggleSprite.png';


const monsters = {
  Emby: { // 앰비 객체
    position: {
      x: 280,
      y: 330
    },
    img: embyImg,
    frames: {
      max: 4,
      hold: 100
    },
    animate: true,
    name: 'Emby',
  },
  Draggle: { // 드래글 객체
    position: {
      x: 800,
      y: 100
    },
    img: draggleImg,
    frames: {
      max: 4,
      hold: 100
    },
    animate: true,
    isEnemy: true,
    name: 'Draggle',
  }
}