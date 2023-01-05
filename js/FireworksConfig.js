class FireworksConfig {
    constructor() {
        this.canvas = this.createCanvas();
        this.init()
        this.fillPageWithCanvas();
        this.makeFunctionsGlobal();
    }

    init() {
        this.variables = [
            { variable: this.RadToDeg, name: "RadToDeg" },
            { variable: this.DegToRad, name: "DegToRad" },
            { variable: this.PI, name: "PI" },
            { variable: this.TWO_PI, name: "TWO_PI" },
            { variable: this.TAU, name: "TAU" }
        ];

        if (this.canvas) {
            this.ctx = this.canvas.getContext("2d");

            if (this.updateSizeOnResize) {
                window.addEventListener("resize", () => {
                    this.setSize(window.innerWidth, window.innerHeight);
                });
            }

            this.mouse = { x: 0, y: 0, lastX: 0, lastY: 0, movementX: 0, movementY: 0, left: false, middle: false, right: false, down: false };
            this.touches = [];
            if (this.globalFunctions) {
                window.mouse = this.mouse;
                window.touches = this.touches;
            }

            this.canvas.addEventListener("contextmenu", event => {
                this.eventFunctions["contextmenu"] && OnContextMenu(event);

                if (this.contextMenuDisabled) {
                    event.preventDefault();
                    return false;
                }
                return true;
            });

            this.canvas.addEventListener("touchmove", event => {
                if (this.disableScrollOnMobile)
                    event.preventDefault();

                this.updateTouches();
                this.mouse.x = this.touches[0].x;
                this.mouse.y = this.touches[0].y;

                this.eventFunctions["touchmove"] && OnTouchMove(event);
            });
        }
    }

    createCanvas() {
        let canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        return canvas;
    }

    updateTouches() {
        let br = this.canvas.getBoundingClientRect();

        this.touches = [];
        for (let i = 0; i < event.touches.length; i++) {
            var e = event.touches[i];
            var x = (e.pageX - br.left) / (br.width / this.width);
            var y = (e.pageY - br.top) / (br.height / this.height);
            this.touches[i] = { x, y, id: e.identifier, force: e.force };
        }

        if (this.globalFunctions)
            window.touches = this.touches;
    }

    fillPageWithCanvas() {
        this.canvas.style.position = "fixed";
        this.canvas.style.top = "0px";
        this.canvas.style.left = "0px";
        this.setSize(window.innerWidth, window.innerHeight);
        this.disableScrollOnMobile = true;
        this.contextMenuDisabled = true;
        this.updateSizeOnResize = true;
    }

    setSize(width, height) {
        if (this.canvas) {
            this.canvas.width = this.width = width;
            this.canvas.height = this.height = height;
            window.width = this.width;
            window.height = this.height;
        }
        else {
            console.error("There is no canvas!");
        }
    }

    makeFunctionsGlobal() {
        this.globalFunctions = true;
        this.variables.forEach(item => {
            window[item.name] = item.variable;
        });

        window.fps = this.fps;
        window.deltaTime = this.deltaTime;
    }

    circle(x, y, radius, color, strokeColor, lineWidth) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        if (strokeColor) this.ctx.strokeStyle = strokeColor;
        if (lineWidth) this.ctx.lineWidth = lineWidth;
        this.ctx.fill();
        if (strokeColor) this.ctx.stroke();
    }

    canvasToImage() {
        let img = new Image();
        img.src = this.canvas.toDataURL();
        return img;
    }

    background(color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
}