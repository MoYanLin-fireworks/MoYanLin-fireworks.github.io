class Config {
    constructor(text = '', size = 15, font = 'Anton') {
        this.text = text
        this.size = size
        this.font = font
    }

    init() {
        this.fc = new FireworksConfig();
        this.points = this.textToPoints()
        this.fireworks = [];
        this.titleParticles = []
        this.particles = []
        this.gravity = 0.1

        setTimeout(() => {
            setInterval(() => {
                this.fireworks.push(this.Firework(Math.random() * width, height, Math.random() - 0.5, -(Math.random() * 7 + 5)));
            }, 1000);
        }, 2000);
        this.fireworks.push(this.Firework(width / 2, height, 0, -9.5, 10, "gold", true));
        setInterval(() => {
            this.fireworks.push(this.Firework(width / 2, height, 0, -9.5, 10, "gold", true));
        }, 5000);

        for (let i = 0; i < 250; i++) {
            this.fc.circle(
                Math.random() * width,
                Math.random() * height,
                1,
                "rgb(200, 200, 200)"
            );
        }

        this.fc.background("black");
    }

    run() {
        this.fc.ctx.globalCompositeOperation = "source-over";
        this.fc.background("rgba(0, 0, 0, 0.1)");
        this.fc.ctx.drawImage(this.fc.canvasToImage(), 0, 0);
        this.fc.ctx.globalCompositeOperation = "lighter";

        for (let i = 0; i < this.fireworks.length; i++) {
            let firework = this.fireworks[i];
            firework.update();
            firework.render();
        }
        for (let i = 0; i < this.particles.length; i++) {
            let particle = this.particles[i];
            particle.update();
            particle.render();
        }

        for (let i = 0; i < this.titleParticles.length; i++) {
            let p = this.titleParticles[i];
            p.update();
            p.render();
        }

        requestAnimationFrame(this.run.bind(this));
    }

    Firework(x, y, vx, vy, radius = 5, color = "white", title = false) {
        let _that = this
        let data = {
            x,
            y,
            vx,
            vy,
            radius,
            title,
            color,
            update: function () {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += _that.gravity;

                if (this.vy >= 0) {
                    _that.fireworks.splice(_that.fireworks.indexOf(this), 1);

                    if (this.title) {
                        let scale = 0.3;
                        for (let i = 0; i < _that.points.length; i++) {
                            let p = _that.points[i];
                            let v = {
                                x: (p.x - 60) * scale + (Math.random() - 0.5) * 0.1,
                                y: (p.y - 20) * scale + (Math.random() - 0.5) * 0.1
                            }
                            let particle = _that.TitleParticle(this.x, this.y, v.x, v.y);
                            _that.titleParticles.push(particle);
                        }
                    }
                    else {
                        let color = [Math.random() * 256 >> 0, Math.random() * 256 >> 0, Math.random() * 256 >> 0];
                        for (let i = 0; i < Math.PI * 2; i += 0.1) {
                            let power = (Math.random() + 0.5) * 4;
                            let vx = Math.cos(i) * power;
                            let vy = Math.sin(i) * power;
                            _that.particles.push(_that.Particle(this.x, this.y, vx, vy, Math.random() + 3, color));
                        }
                    }
                }
            },
            render: function () {
                _that.fc.circle(this.x, this.y, this.radius, this.color);
            }
        }
        return data
    }

    TitleParticle(x, y, vx, vy) {
        let _that = this
        let data = {
            x,
            y,
            vx,
            vy,
            ay: 0.2,
            radius: 4,
            maxHealth: 200,
            health: 200,
            update: function () {
                this.x += this.vx;
                this.y += this.vy;
                this.vx *= 0.95;
                this.vy *= 0.95;
                this.vy += this.ay;
                this.ay *= 0.95;

                this.radius = (this.health / this.maxHealth) * 4;
                this.health--;
                if (this.health <= 0) {
                    _that.titleParticles.splice(_that.titleParticles.indexOf(this), 1);
                }
            },

            render: function () {
                _that.fc.circle(this.x, this.y, this.radius, "rgba(255, 255, 255, " + (this.health / this.maxHealth) + ")");
            }
        }
        return data
    }

    Particle(x, y, vx, vy, radius, color) {
        let _that = this
        let data = {
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            life: 100,
            color: color,
            radius: radius,
            update: function () {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += _that.gravity;

                this.vx *= 0.95;
                this.vy *= 0.95;

                this.life--;
                if (this.life <= 0) {
                    _that.particles.splice(_that.particles.indexOf(this), 1);
                }
            },

            render: function () {
                _that.fc.circle(this.x, this.y, 3 * (this.life / 100), "rgba(" + this.color[0] + ", " + this.color[1] + ", " + this.color[2] + ", " + (this.life / 100) + ")");
            }
        }
        return data
    }

    textToPoints() {
        let canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = this.size * 1.3;
        let ctx = canvas.getContext("2d");

        ctx.textBaseline = "middle";
        ctx.font = this.size + "px " + this.font;
        ctx.fillText(this.text, 0, canvas.height / 2);

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let data = imageData.data;

        let points = [];
        let index = (x, y) => (x + canvas.width * y) * 4;
        let threshold = 50;

        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > threshold) {
                let p = {
                    x: (i / 4) % canvas.width,
                    y: (i / 4) / canvas.width >> 0
                };

                if (data[index(p.x + 1, p.y) + 3] < threshold ||
                    data[index(p.x - 1, p.y) + 3] < threshold ||
                    data[index(p.x, p.y + 1) + 3] < threshold ||
                    data[index(p.x, p.y - 1) + 3] < threshold) {
                    points.push({
                        x: (i / 4) % canvas.width,
                        y: (i / 4) / canvas.width >> 0
                    });
                }
            }
        }

        return points;
    }
}