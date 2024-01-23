const canvas = document.querySelector('canvas'); // 캔버스 선택
const c = canvas.getContext('2d'); // 캔버스를 2d로 그림
// audio.Map.play();
// console.log(gsap)


// console.log(collisions);
canvas.width = 1024; // 캔버스 크기
canvas.height = 576; // 캔버스 크기

const offset = { // 배경의 위치를 저장하는 객체
  x: -740,
  y: -650
}

const collisionsMap = []; // 충돌박스를 담을 배열
for (let i = 0; i < collisions.length; i += 70) { // 충돌박스 그리기
  collisionsMap.push(collisions.slice(i, i + 70));
};
const battleZonesMap = []; // 배틀존을 담을 배열
for (let i = 0; i < battleZoneData.length; i += 70) { // 충돌박스 그리기
  battleZonesMap.push(battleZoneData.slice(i, i + 70));
};
// console.log(battleZonesMap);

const boundaries = []; // 충돌박스를 담을 배열
collisionsMap.forEach((row, rowIndex) => { // 충돌박스를 담을 배열
  row.forEach((col, colIndex) => {
    if (col === 1025) {
      boundaries.push(new Boundary({
        position: {
          x: colIndex * Boundary.width + offset.x,
          y: rowIndex * Boundary.height + offset.y
        }
      }));
    }
  });
});

const battleZones = []; //배틀존 박스를 담을 배열
battleZonesMap.forEach((row, rowIndex) => {
  row.forEach((col, colIndex) => {
    if (col === 1025) {
      battleZones.push(new Boundary({
        position: {
          x: colIndex * Boundary.width + offset.x,
          y: rowIndex * Boundary.height + offset.y
        }
      }));
    }
  });
});

// console.log(boundaries);
// c.fillStyle = 'white'; // 배경색
// c.fillRect(0, 0, canvas.width, canvas.height); // 배경 그리기


const img = new Image(); // 배경 이미지
img.src = './Images/Pellet Town.png';

const foregroundImg = new Image(); // 배경 이미지
foregroundImg.src = './Images/forgroundObjects.png'

const playerDownImg = new Image(); // 플레이어 이미지
playerDownImg.src = './Images/PlayerDown.png';
const playerUpImg = new Image();
playerUpImg.src = './Images/PlayerUp.png';
const playerLeftImg = new Image();
playerLeftImg.src = './Images/PlayerLeft.png';
const playerRightImg = new Image();
playerRightImg.src = './Images/PlayerRight.png';

img.onload = () => { //  그림이 로드되면 실행
  c.drawImage(img, -740, -600); // 웹페이지가 로드되기 전에 그림을 그리면 안그려짐
  //   c.drawImage(playerImg,
  //     0,
  //     0,
  //     playerImg.width / 4, // 128 / 4
  //     playerImg.height, // 32
  //     canvas.width / 2 - (playerImg.width / 4) / 2, // 1024 / 2 - 32 / 2
  //     canvas.height / 2 - playerImg.height / 2, // 576 / 2 - 32 / 2
  //     playerImg.width / 4, // 128 / 4
  //     playerImg.height); // 32
}

const player = new Sprite({ // 플레이어 객체
  position: {
    x: canvas.width / 2 - 192 / 4 / 2,
    y: canvas.height / 2 - 68 / 2
  },
  img: playerDownImg,
  frames: {
    max: 4,
    hold: 20
  },
  sprites: {
    up: playerUpImg,
    down: playerDownImg,
    left: playerLeftImg,
    right: playerRightImg,
  }
});
const background = new Sprite({ // 배경 객체
  position: {
    x: offset.x,
    y: offset.y
  },
  img: img
});

const foreground = new Sprite({ // 전경 객체
  position: {
    x: offset.x,
    y: offset.y
  },
  img: foregroundImg
});

const keys = { // 키보드 입력을 받기 위한 객체
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}


const movables = [background, ...boundaries, foreground, ...battleZones]; // 움직이는 객체들을 담을 배열
function rectangularCollision({
  rect1,
  rect2
}) { // 충돌박스와 충돌박스가 충돌했는지 확인하는 함수
  if (rect1.position.x < rect2.position.x + rect2.width &&
    rect1.position.x + rect1.width > rect2.position.x &&
    rect1.position.y < rect2.position.y + rect2.height &&
    rect1.position.y + rect1.height > rect2.position.y) {
    return true;
  }
  return false;
}

const battle = {
  initiated: false,
}
console.log("여기까지 오나?");
function animate() { // 애니메이션 함수
  const animationId = window.requestAnimationFrame(animate); // 1초에 60번 실행
  // console.log(animationId);
  background.draw(); // 배경 그리기
  boundaries.forEach(boundary => { // 충돌박스 그리기
    boundary.draw();
  });
  battleZones.forEach(battleZone => { // 배틀존 박스 그리기
    battleZone.draw();
  });
  console.log(player);
  player.draw(); // 플레이어 그리기
  foreground.draw(); // 전경 그리기

  // 충돌박스와 플레이어가 충돌했는지 확인 // 각 면으로부터의 거리를 구해서 충돌했는지 확인
  let moving = true;
  player.animate = false;

  if (battle.initiated) return;
  // 전투 활성화
  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i];
      const overlappingArea = // 전투지역에 플레이어가 반 이상 들어가야 전투판정이 나게 함
        Math.max(0,
          Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) -
          Math.max(player.position.x, battleZone.position.x)) *
        Math.max(0, Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) -
          Math.max(player.position.y, battleZone.position.y));
      if (rectangularCollision({
          rect1: player,
          rect2: battleZone
        }) && overlappingArea > (player.width * player.height) / 2 &&
        Math.random() < 0.01) { // 전투 확률 // 1% 확률로 전투
        // 전투중에 맵 애니메이션 멈춤
        window.cancelAnimationFrame(animationId);
        battle.initiated = true;
        audio.Map.stop();
        audio.initBattle.play();
        audio.battle.play();
        gsap.to('#overlappingDiv', {
          opacity: 1,
          repeat: 3,
          yoyo: true,
          duration: 0.4,
          onComplete: () => {
            gsap.to('#overlappingDiv', {
              opacity: 1,
              duration: 0.4,
              onComplete: () => {
                initBattle();
                animateBattle();
                gsap.to('#overlappingDiv', {
                  opacity: 0,
                  duration: 0.4,
                  // onComplete: () => {
                  //   window.requestAnimationFrame(animateBattle);
                  // }
                })
              }
            })
          }
        })
        break;
      };
    };
  };


  if (keys.w.pressed && lastKey === 'w') { // 방향키를 누르면 배경이 움직이게 함
    player.animate = true;
    player.img = player.sprites.up;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (rectangularCollision({
          rect1: player,
          rect2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + 3
            }
          }
        })) {
        moving = false;
        break;
      };
    }
    if (moving) {
      movables.forEach(movable => {
        movable.position.y += 3;
      });
    };
  } else if (keys.a.pressed && lastKey === 'a') {
    player.animate = true;
    player.img = player.sprites.left;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (rectangularCollision({
          rect1: player,
          rect2: {
            ...boundary,
            position: {
              x: boundary.position.x + 3,
              y: boundary.position.y
            }
          }
        })) {
        moving = false;
        break;
      };
    }
    if (moving) {
      movables.forEach(movable => {
        movable.position.x += 3;
      });
    }
  } else if (keys.s.pressed && lastKey === 's') {
    player.animate = true;
    player.img = player.sprites.down;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (rectangularCollision({
          rect1: player,
          rect2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - 3
            }
          }
        })) {
        moving = false;
        break;
      };
    }
    if (moving) {
      movables.forEach(movable => {
        movable.position.y -= 3;
      });
    }
  } else if (keys.d.pressed && lastKey === 'd') {
    player.animate = true;
    player.img = player.sprites.right;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (rectangularCollision({
          rect1: player,
          rect2: {
            ...boundary,
            position: {
              x: boundary.position.x - 3,
              y: boundary.position.y
            }
          }
        })) {
        moving = false;
        break;
      };
    }
    if (moving) {
      movables.forEach(movable => {
        movable.position.x -= 3;
      });
    }
  }

};

// animate();

let lastKey = ''; // 마지막으로 눌린 키를 저장 (방향키를 누르고 있을 때, 다른 방향키를 누르면 그 방향으로 움직이게 하기 위함)

window.addEventListener('keydown', (e) => { // 키보드 입력을 받음
  switch (e.key) {
    case 'w':
      keys.w.pressed = true;
      lastKey = 'w';
      break;
    case 's':
      keys.s.pressed = true;
      lastKey = 's';
      break;
    case 'a':
      keys.a.pressed = true;
      lastKey = 'a';
      break;
    case 'd':
      keys.d.pressed = true;
      lastKey = 'd';
      break;
  }
});
window.addEventListener('keyup', (e) => { // 키보드 입력을 받음
  switch (e.key) {
    case 'w':
      keys.w.pressed = false;

      break;
    case 's':
      keys.s.pressed = false;

      break;
    case 'a':
      keys.a.pressed = false;

      break;
    case 'd':
      keys.d.pressed = false;

      break;
  }
});
let clicked = false;
addEventListener('click', (e) => {
  if (clicked) return;
  audio.Map.play();
  clicked = true;
});