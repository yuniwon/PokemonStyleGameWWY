// 2차원 비트맵 객체 생성 클래스
class Sprite { 
  constructor({
    position,
    velocity,
    img,
    frames = {
      max: 1,
      hold: 10
    },
    sprites,
    animate = false,
    rotation = 0,
  }) {
    this.position = position;
    this.img = new Image();
    this.frames = {
      ...frames,
      val: 0,
      elapsed: 0
    };
    this.img.onload = () => {
      this.width = this.img.width / this.frames.max;
      this.height = this.img.height;
    }
    this.img.src = img.src;
    this.animate = animate;
    this.sprites = sprites;
    this.opacity = 1;

    this.rotation = rotation;

  }
  draw() { // 그리기 함수
    c.save();
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );

    c.rotate(this.rotation);
    c.translate(
      -(this.position.x + this.width / 2),
      -(this.position.y + this.height / 2)
    );
    c.globalAlpha = this.opacity;
    c.drawImage(this.img,
      this.frames.val * this.width,
      0,
      this.img.width / this.frames.max, // 128 / 4
      this.img.height, // 32
      this.position.x, // 1024 / 2 - 32 / 2
      this.position.y, // 576 / 2 - 32 / 2
      this.img.width / this.frames.max, // 128 / 4
      this.img.height);
    c.restore();
    if (!this.animate) return;
    if (this.frames.max > 1) {
      this.frames.elapsed++;
    }
    if (this.frames.elapsed % this.frames.hold === 0) {
      if (this.frames.val < this.frames.max - 1) {
        this.frames.val++;
      } else this.frames.val = 0;
    }

  }


};
// 스프라이트를 상속하는 몬스터 클래스 
// 스프라이트의 모든 속성을 사용할 수 있음
// 스프라이트 클래스에 너무 많은 것을 넣으면 코드가 복잡해지므로
// 몬스터 클래스를 따로 만듦
class Monster extends Sprite { 
  constructor({
    position,
    velocity,
    img,
    frames = {
      max: 1,
      hold: 10
    },
    sprites,
    animate = false,
    rotation = 0,
    isEnemy = false,
    name,
    attacks,
  }) {
    super({
      position,
      velocity,
      img,
      frames,
      sprites,
      animate,
      rotation,
    });
    this.health = 100;
    this.isEnemy = isEnemy;
    this.name = name;
    this.attacks = attacks;
  }
  faint() { // 쓰러짐
    document.querySelector('#Msgbox').innerHTML = `${this.name} 이/가 쓰러졌다!`;
    document.querySelector('#Msgbox').style.display = 'block';
    gsap.to(this.position, {
      y: this.position.y + 20,
    });
    gsap.to(this, {
      opacity: 0,
      // duration: 1,
    });
    audio.victory.play(); // 승리 효과음
  };


  attack({ // 공격
    attack,
    recipient,
    renderedSprites
  }) {
    document.querySelector('#Msgbox').style.display = 'block';
    document.querySelector('#Msgbox').innerHTML = `${this.name} 이/가 ${attack.name}을 사용했다!`;

    recipient.health -= attack.damage; // 공격을 받은 캐릭터의 체력 감소
    console.log(this.health)
    let movementDistance = 20;
    if (this.isEnemy) movementDistance = -20;

    let healthBar = '.enemyHealthBar';
    if (this.isEnemy) healthBar = '.playerHealthBar'
    let rotation = 1;
    if (this.isEnemy) rotation = -2.5;
    console.log(attack.name)
    switch (attack.name) {
      case '태클': // 태클 공격
        const tl = gsap.timeline(); // 애니메이션 타임라인 생성
        tl.to(this.position, {
          x: this.position.x - movementDistance,
        }).to(this.position, {
          x: this.position.x + movementDistance * 2,
          duration: 0.1,
          onComplete: () => {
            // 적이 맞았을 때
            audio.tackleHit.play(); // 태클 효과음
            gsap.to(healthBar, {
              // width: `${recipient.health}%`
              width: recipient.health + '%'
            })
            gsap.to(recipient.position, {
              x: recipient.position.x + movementDistance * 2,
              yoyo: true,
              repeat: 5,
              duration: 0.08
            });
            gsap.to(recipient, {
              opacity: 0.5,
              repeat: 5,
              yoyo: true,
              duration: 0.08
            })
          }
        }).to(this.position, {
          x: this.position.x,
        });
        break;
      case '파이어볼': // 파이어볼 공격
        const fireballImg = new Image();
        fireballImg.src = './Images/fireball.png';
        const fireball = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y
          },
          img: fireballImg,
          frames: {
            max: 4,
            hold: 10
          },
          animate: true,
          rotation,
        });
        renderedSprites.splice(1, 0, fireball);
        audio.initFireball.play(); // 파이어볼 효과음
        gsap.to(fireball.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          duration: 0.5,
          onComplete: () => {
            renderedSprites.splice(1, 1);
            // 적이 맞았을 때
            audio.fireballHit.play(); // 파이어볼 효과음
            gsap.to(healthBar, {
              width: recipient.health + '%'
            })
            gsap.to(recipient.position, {
              x: recipient.position.x + movementDistance * 2,
              yoyo: true,
              repeat: 5,
              duration: 0.08
            });
            gsap.to(recipient, {
              opacity: 0.5,
              repeat: 5,
              yoyo: true,
              duration: 0.08
            })
          }
        })
        break;
      case 'Heal':
        this.heal({
          attack,
          recipient
        });
        break;
      case 'Slash':
        this.slash({
          attack,
          recipient
        });
        break;
      default:
        console.log('Invalid attack');
    }


  }
}

// 맵의 경계와 전투지역의 경계를 나타내는 클래스
//data에 저장된 경계 정보를 이용하여 경계를 그림
class Boundary { // 충돌박스
  static width = 48;
  static height = 48;
  constructor({
    position
  }) {
    this.position = position;
    this.width = 48;
    this.height = 48;
  }
  draw() { // 충돌박스 그리기
    c.fillStyle = 'rgba(255, 0, 0, 0.0)'; // 빨간색, 투명도 0.0 (투명)
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}