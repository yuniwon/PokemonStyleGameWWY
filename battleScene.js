// 전투 배경 이미지 시작 --------------------------------------------------------------
const battleBackgroundImg = new Image(); //전투 배경 이미지
battleBackgroundImg.src = './Images/battleBackground.png';
const battleBackground = new Sprite({ // 전투 배경 객체
  position: {
    x: 0,
    y: 0
  },
  img: battleBackgroundImg
});
// 전투 배경 이미지 끝 --------------------------------------------------------------
// 전투 객체 초기화 시작 --------------------------------------------------------------
let draggle;
let emby; // 앰비 객체 
let renderedSprites; // 렌더링된 스프라이트들
let BattleAnimationId; // 전투 애니메이션 아이디
let queue; // 전투 대기열
// 전투 객체 초기화 끝 --------------------------------------------------------------

// 전투 함수 시작 --------------------------------------------------------------
function initBattle() { // 전투 초기화 함수
  // 전투 관련 ui 생성 --------------------------------------------------------------
  document.querySelector('#ui1').style.display = 'block';
  document.querySelector('#battleWindow').style.display = 'flex';
  document.querySelector('#Msgbox').style.display = 'none';
  document.querySelector('.enemyHealthBar').style.width = '100%';
  document.querySelector('.playerHealthBar').style.width = '100%';
  document.querySelector('#battleWindowHeader').replaceChildren(); // 전투창 헤더 초기화

  draggle = new Monster(monsters.Draggle); // 드래글 객체
  emby = new Monster(monsters.Emby); // 앰비 객체
  renderedSprites = [draggle, emby];
  queue = [];

  emby.attacks.forEach(attack => { // 앰비의 공격을 버튼으로 만들기
    const button = document.createElement('button');
    // button.className = attack.name;
    button.innerHTML = attack.name; // 버튼에 공격이름 표시
    document.querySelector('#battleWindowHeader').append(button); // 버튼을 전투창 헤더에 추가
  });
  document.querySelectorAll('button').forEach(button => { // 전투시 버튼 클릭 이벤트
    button.addEventListener('click', (e) => { // 버튼 클릭시
      // 스킬네임 영어로 바꾸기 --------------------------------------------------------------
      let skillname = '';
      if (e.currentTarget.innerHTML === '태클') {
        skillname = 'Tackle';
      } else if (e.currentTarget.innerHTML === '파이어볼') {
        skillname = 'Fireball';
      }else if(e.currentTarget.innerHTML === '힐'){
        skillname = 'Heal';
      }
      const selectedAttack = attacks[skillname]; // 선택된 공격에 대한 정보표시
      // 스킬네임 영어로 바꾸기 끝 --------------------------------------------------------------
      // 앰비 혹은 적의 공격 // 선택된 공격에 대한 정보표시
      let recipient = ''; // 공격받는 대상
      if(skillname === 'Heal'){ // 힐일 경우
        recipient = emby;
      }else{
        recipient = draggle;
      }
      emby.attack({
        attack: selectedAttack,
        recipient: recipient,
        renderedSprites
      });

      // 적이 죽었을 때  --------------------------------------------------------------
      if (draggle.health <= 0) { // 드래글이 죽었을 때

        queue.push(() => {
          draggle.faint(); // 드래글 퇴장
        })
        queue.push(() => {

          // 암전효과
          gsap.to('#overlappingDiv', { // 암전효과
            opacity: 1,
            onComplete: () => { // 암전효과가 끝나면
              cancelAnimationFrame(BattleAnimationId); //전투 애니메이션 멈춤
              animate(); // 맵 애니메이션 실행
              document.querySelector('#ui1').style.display = 'none';
              document.querySelector('#battleWindow').style.display = 'none';
              gsap.to('#overlappingDiv', {
                opacity: 0,
              })
              audio.battle.stop();
              audio.Map.play();
            }
          })
        })

        battle.initiated = false;
        return;
      }
      // 드래글 혹은 적의 공격 // 랜덤으로 공격
      const randomAttack = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)];

      queue.push(() => {
        draggle.attack({
          attack: randomAttack,
          recipient: emby,
          renderedSprites
        });
        if (emby.health <= 0) {
          queue.push(() => {
            emby.faint();
          })
          queue.push(() => {
            // 암전효과
            gsap.to('#overlappingDiv', { // 암전효과
              opacity: 1,
              onComplete: () => { // 암전효과가 끝나면
                cancelAnimationFrame(BattleAnimationId); //전투 애니메이션 멈춤
                animate(); // 맵 애니메이션 실행
                document.querySelector('#ui1').style.display = 'none';
                document.querySelector('#battleWindow').style.display = 'none';
                gsap.to('#overlappingDiv', {
                  opacity: 0,
                })
                audio.battle.stop();
                audio.Map.play();
              }
            })
          })
          battle.initiated = false;
          return;
        }
      })
    })


    button.addEventListener('mouseenter', // 버튼에 마우스 올렸을 때
      (e) => {
        let skillname = '';
        if (e.currentTarget.innerHTML === '태클') {
          skillname = 'Tackle';
        } else if (e.currentTarget.innerHTML === '파이어볼') {
          skillname = 'Fireball';
        } else if (e.currentTarget.innerHTML === '힐') {
          skillname = 'Heal';
        }
        const selectedAttack = attacks[skillname]; // 선택된 공격에 대한 정보표시
        document.querySelector('#battleWindowContentButton1').innerHTML = `${selectedAttack.name}: <br>${selectedAttack.damage} damage <br>${selectedAttack.type}`;
        document.querySelector('#battleWindowContentButton1').style.color = selectedAttack.color;
      }
    );
  })
};

function animateBattle() { // 전투 애니메이션 함수
  BattleAnimationId = window.requestAnimationFrame(animateBattle);
  battleBackground.draw();

  renderedSprites.forEach(sprite => {
    sprite.draw();
  })
}

document.querySelector('#Msgbox').addEventListener('click', (e) => {
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    e.currentTarget.style.display = 'none';
  }
});