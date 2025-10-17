/**
 * Text Animation Effect - Hiệu ứng chữ ghép lại
 * Tạo hiệu ứng các chấm tròn ghép lại thành chữ cái
 */

class TextAnimation {
    constructor(canvasSelector, options = {}) {
        this.canvas = document.querySelector(canvasSelector);
        this.context = this.canvas.getContext('2d');
        this.options = {
            gap: 13,
            fontSize: 500,
            fontFamily: 'Avenir, Helvetica Neue, Helvetica, Arial, sans-serif',
            dotColor: { r: 255, g: 255, b: 255, a: 1 },
            animationSpeed: 0.14,
            dotSize: 5,
            ...options
        };
        
        this.dots = [];
        this.width = 0;
        this.height = 0;
        this.cx = 0;
        this.cy = 0;
        this.sequence = [];
        this.currentAction = null;
        this.interval = null;
        
        this.init();
    }

    init() {
        this.adjustCanvas();
        this.setupEventListeners();
        this.startRenderLoop();
    }

    adjustCanvas() {
        this.canvas.width = window.innerWidth - 100;
        this.canvas.height = window.innerHeight - 30;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.adjustCanvas();
        });
    }

    startRenderLoop() {
        const requestFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };

        const loop = () => {
            this.clearFrame();
            this.render();
            requestFrame.call(window, loop);
        };

        loop();
    }

    clearFrame() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawCircle(point, color) {
        this.context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        this.context.beginPath();
        this.context.arc(point.x, point.y, point.z, 0, 2 * Math.PI, true);
        this.context.closePath();
        this.context.fill();
    }

    createDot(x, y) {
        return {
            p: {
                x: x,
                y: y,
                z: this.options.dotSize,
                a: 1,
                h: 0
            },
            e: 0.07,
            s: true,
            c: { ...this.options.dotColor, a: 1 },
            t: { x: x, y: y, z: this.options.dotSize, a: 1, h: 0 },
            q: [],
            
            clone: function() {
                return {
                    x: this.p.x,
                    y: this.p.y,
                    z: this.p.z,
                    a: this.p.a,
                    h: this.p.h
                };
            },

            _draw: function(context, drawCircle) {
                this.c.a = this.p.a;
                drawCircle(this.p, this.c);
            },

            _moveTowards: function(n) {
                const dx = this.p.x - n.x;
                const dy = this.p.y - n.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                const e = this.e * d;

                if (this.p.h === -1) {
                    this.p.x = n.x;
                    this.p.y = n.y;
                    return true;
                }

                if (d > 1) {
                    this.p.x -= ((dx / d) * e);
                    this.p.y -= ((dy / d) * e);
                } else {
                    if (this.p.h > 0) {
                        this.p.h--;
                    } else {
                        return true;
                    }
                }
                return false;
            },

            _update: function() {
                if (this._moveTowards(this.t)) {
                    const p = this.q.shift();
                    if (p) {
                        this.t.x = p.x || this.p.x;
                        this.t.y = p.y || this.p.y;
                        this.t.z = p.z || this.p.z;
                        this.t.a = p.a || this.p.a;
                        this.p.h = p.h || 0;
                    } else {
                        if (this.s) {
                            this.p.x -= Math.sin(Math.random() * 3.142);
                            this.p.y -= Math.sin(Math.random() * 3.142);
                        } else {
                            this.move({
                                x: this.p.x + (Math.random() * 50) - 25,
                                y: this.p.y + (Math.random() * 50) - 25
                            });
                        }
                    }
                }

                let d = this.p.a - this.t.a;
                this.p.a = Math.max(0.1, this.p.a - (d * 0.05));
                d = this.p.z - this.t.z;
                this.p.z = Math.max(1, this.p.z - (d * 0.05));
            },

            move: function(p, avoidStatic) {
                if (!avoidStatic || (avoidStatic && this.distanceTo(p) > 1)) {
                    this.q.push(p);
                }
            },

            distanceTo: function(n) {
                const dx = this.p.x - n.x;
                const dy = this.p.y - n.y;
                return Math.sqrt(dx * dx + dy * dy);
            },

            render: function(context, drawCircle) {
                this._update();
                this._draw(context, drawCircle);
            }
        };
    }

    createShapeCanvas() {
        const shapeCanvas = document.createElement('canvas');
        const shapeContext = shapeCanvas.getContext('2d');
        
        const fit = () => {
            shapeCanvas.width = Math.floor(window.innerWidth / this.options.gap) * this.options.gap;
            shapeCanvas.height = Math.floor(window.innerHeight / this.options.gap) * this.options.gap;
            shapeContext.fillStyle = 'red';
            shapeContext.textBaseline = 'middle';
            shapeContext.textAlign = 'center';
        };

        fit();
        window.addEventListener('resize', fit);

        return { canvas: shapeCanvas, context: shapeContext };
    }

    processCanvas(shapeCanvas, shapeContext) {
        const pixels = shapeContext.getImageData(0, 0, shapeCanvas.width, shapeCanvas.height).data;
        const dots = [];
        let x = 0, y = 0;
        let fx = shapeCanvas.width, fy = shapeCanvas.height;
        let w = 0, h = 0;

        for (let p = 0; p < pixels.length; p += (4 * this.options.gap)) {
            if (pixels[p + 3] > 0) {
                dots.push({ x: x, y: y });
                w = x > w ? x : w;
                h = y > h ? y : h;
                fx = x < fx ? x : fx;
                fy = y < fy ? y : fy;
            }
            x += this.options.gap;
            if (x >= shapeCanvas.width) {
                x = 0;
                y += this.options.gap;
                p += this.options.gap * 4 * shapeCanvas.width;
            }
        }

        return { dots: dots, w: w + fx, h: h + fy };
    }

    createLetterShape(letter) {
        const { canvas: shapeCanvas, context: shapeContext } = this.createShapeCanvas();
        
        const setFontSize = (size) => {
            shapeContext.font = `bold ${size}px ${this.options.fontFamily}`;
        };

        const isNumber = (n) => {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };

        let s = 0;
        setFontSize(this.options.fontSize);
        s = Math.min(
            this.options.fontSize,
            (shapeCanvas.width / shapeContext.measureText(letter).width) * 0.8 * this.options.fontSize,
            (shapeCanvas.height / this.options.fontSize) * (isNumber(letter) ? 1 : 0.45) * this.options.fontSize
        );
        setFontSize(s);

        shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
        shapeContext.fillText(letter, shapeCanvas.width / 2, shapeCanvas.height / 2);

        return this.processCanvas(shapeCanvas, shapeContext);
    }

    compensate() {
        const area = { w: this.canvas.width, h: this.canvas.height };
        this.cx = area.w / 2 - this.width / 2;
        this.cy = area.h / 2 - this.height / 2;
    }

    switchShape(shapeData, fast = false) {
        const area = { w: this.canvas.width, h: this.canvas.height };
        this.width = shapeData.w;
        this.height = shapeData.h;
        this.compensate();

        // Thêm dots mới nếu cần
        if (shapeData.dots.length > this.dots.length) {
            const size = shapeData.dots.length - this.dots.length;
            for (let d = 1; d <= size; d++) {
                this.dots.push(this.createDot(area.w / 2, area.h / 2));
            }
        }

        let d = 0;
        let i = 0;
        const dotsCopy = [...shapeData.dots];

        while (dotsCopy.length > 0) {
            i = Math.floor(Math.random() * dotsCopy.length);
            this.dots[d].e = fast ? 0.25 : (this.dots[d].s ? 0.14 : 0.11);
            
            if (this.dots[d].s) {
                this.dots[d].move({
                    z: Math.random() * 20 + 10,
                    a: Math.random(),
                    h: 18
                });
            } else {
                this.dots[d].move({
                    z: Math.random() * 5 + 5,
                    h: fast ? 18 : 30
                });
            }

            this.dots[d].s = true;
            this.dots[d].move({
                x: dotsCopy[i].x + this.cx,
                y: dotsCopy[i].y + this.cy,
                a: 1,
                z: 5,
                h: 0
            });

            dotsCopy.splice(i, 1);
            d++;
        }

        // Xử lý các dots thừa
        for (let i = d; i < this.dots.length; i++) {
            if (this.dots[i].s) {
                this.dots[i].move({
                    z: Math.random() * 20 + 10,
                    a: Math.random(),
                    h: 20
                });
                this.dots[i].s = false;
                this.dots[i].e = 0.04;
                this.dots[i].move({
                    x: Math.random() * area.w,
                    y: Math.random() * area.h,
                    a: 0.3,
                    z: Math.random() * 4,
                    h: 0
                });
            }
        }
    }

    formatTime(date) {
        const h = date.getHours();
        let m = date.getMinutes();
        m = m < 10 ? '0' + m : m;
        return h + ':' + m;
    }

    timedAction(fn, delay, max, reverse) {
        clearInterval(this.interval);
        this.currentAction = reverse ? max : 1;
        fn(this.currentAction);
        
        if (!max || (!reverse && this.currentAction < max) || (reverse && this.currentAction > 0)) {
            this.interval = setInterval(() => {
                this.currentAction = reverse ? this.currentAction - 1 : this.currentAction + 1;
                fn(this.currentAction);
                if ((!reverse && max && this.currentAction === max) || (reverse && this.currentAction === 0)) {
                    clearInterval(this.interval);
                }
            }, delay);
        }
    }

    performAction(value) {
        this.sequence = typeof value === 'object' ? value : this.sequence.concat(value.split('|'));
        
        this.timedAction((index) => {
            const current = this.sequence.shift();
            if (!current) return;

            const action = current.split(' ')[0];
            const actionValue = current.split(' ')[1];

            switch (action) {
                case '#countdown':
                    const countValue = parseInt(actionValue) || 10;
                    this.timedAction((index) => {
                        if (index === 0) {
                            if (this.sequence.length === 0) {
                                this.switchShape(this.createLetterShape(''));
                            } else {
                                this.performAction(this.sequence);
                            }
                        } else {
                            this.switchShape(this.createLetterShape(index), true);
                        }
                    }, 1000, countValue, true);
                    break;

                case '#time':
                    const t = this.formatTime(new Date());
                    if (this.sequence.length > 0) {
                        this.switchShape(this.createLetterShape(t));
                    } else {
                        this.timedAction(() => {
                            const newTime = this.formatTime(new Date());
                            if (newTime !== t) {
                                this.switchShape(this.createLetterShape(newTime));
                            }
                        }, 1000);
                    }
                    break;

                default:
                    this.switchShape(this.createLetterShape(current[0] === '#' ? 'HacPai' : current));
            }
        }, 2000, this.sequence.length);
    }

    // Hàm chính để bắt đầu hiệu ứng
    animate(text) {
        this.performAction(text);
    }

    render() {
        for (let d = 0; d < this.dots.length; d++) {
            this.dots[d].render(this.context, this.drawCircle.bind(this));
        }
    }
}

// Hàm tiện ích để sử dụng dễ dàng
function createTextAnimation(canvasSelector, options = {}) {
    return new TextAnimation(canvasSelector, options);
}

// Export cho module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TextAnimation, createTextAnimation };
}
