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
    this.isEnemy = isEnemy
  }
  draw() { // 그리기 함수
    c.save();
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
    recipient
  }) {
    const tl = gsap.timeline(); // 애니메이션 타임라인 생성
    this.health -= attack.damage; // 공격을 받은 캐릭터의 체력 감소
    let movementDistance = 20;
    if (this.isEnemy) movementDistance = -20;

    let healthBar = '.enemyHealthBar';
    if (this.isEnemy) healthBar = '.playerHealthBar'
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