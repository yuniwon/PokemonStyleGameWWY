class Sprite { // 스프라이트 객체
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
    isEnemy = false,
    rotation = 0,
    name
  }) {
    this.position = position;
    this.img = img;
    this.frames = {
      ...frames,
      val: 0,
      elapsed: 0
    };
    this.img.onload = () => {
      this.width = this.img.width / this.frames.max;
      this.height = this.img.height;
    }
    this.animate = animate;
    this.sprites = sprites;
    this.opacity = 1;
    this.health = 100;
    this.isEnemy = isEnemy;
    this.rotation = rotation;
    this.name = name;
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

  attack({
    attack,
    recipient,
    renderedSprites
  }) {
    document.querySelector('#Msgbox').style.display = 'block';
    document.querySelector('#Msgbox').innerHTML = `${this.name} used ${attack.name}!`;

    this.health -= attack.damage; // 공격을 받은 캐릭터의 체력 감소
    let movementDistance = 20;
    if (this.isEnemy) movementDistance = -20;
    let healthBar = '.enemyHealthBar';
    if (this.isEnemy) healthBar = '.playerHealthBar'
    let rotation = 1;
    if (this.isEnemy) rotation = -2.5;
    console.log(attack.name)
    switch (attack.name) {
      case 'Tackle':
        const tl = gsap.timeline(); // 애니메이션 타임라인 생성
        tl.to(this.position, {
          x: this.position.x - movementDistance,
        }).to(this.position, {
          x: this.position.x + movementDistance * 2,
          duration: 0.1,
          onComplete: () => {
            // 적이 맞았을 때
            gsap.to(healthBar, {
              // width: `${recipient.health}%`
              width: this.health + '%'
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
      case 'Fireball':
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
        // renderedSprites.push(fireball);
        renderedSprites.splice(1, 0, fireball);

        gsap.to(fireball.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          duration: 0.5,
          onComplete: () => {
            renderedSprites.splice(1, 1);
            // 적이 맞았을 때
            gsap.to(healthBar, {
              // width: `${recipient.health}%`
              width: this.health + '%'
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
};

class Boundary { // 충돌박스 객체
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
    c.fillStyle = 'rgba(255, 0, 0, 0.5)';
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}