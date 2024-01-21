// animate(); // 애니메이션 함수 실행

const battleBackgroundImg = new Image(); //전투 배경 이미지
battleBackgroundImg.src = './Images/battleBackground.png';
const battleBackground = new Sprite({ // 전투 배경 객체
  position: {
    x: 0,
    y: 0
  },
  img: battleBackgroundImg
});

const draggle = new Sprite(monsters.Draggle); // 드래글 객체
const emby = new Sprite(monsters.Emby); // 앰비 객체

const renderedSprites = [draggle, emby];
const button = document.createElement('button');
button.innerHTML = 'Tackle';
document.querySelector('#battleWindowHeader').append(button);

function animateBattle() { // 전투 애니메이션 함수
  window.requestAnimationFrame(animateBattle);
  battleBackground.draw();

  renderedSprites.forEach(sprite => {
    sprite.draw();
  })
}
animateBattle(); // 애니메이션 함수 실행

const queue = []; // 전투 대기열

document.querySelectorAll('button').forEach(button => { // 전투시 버튼 클릭 이벤트
  button.addEventListener('click', (e) => {
    console.log(attacks[e.currentTarget.innerHTML])
    const selectedAttack = attacks[e.currentTarget.innerHTML];
    emby.attack({
      attack: selectedAttack,
      recipient: draggle,
      renderedSprites
    });

    queue.push(() => {
      draggle.attack({
        attack: attacks.Tackle,
        recipient: emby,
        renderedSprites
      });
    })
  })
})

document.querySelector('#Msgbox').addEventListener('click', (e) => {
  if (queue.length > 0) {
    queue[0]();
    queue.shift()();
  } else {
    e.currentTarget.style.display = 'none';
  }
});