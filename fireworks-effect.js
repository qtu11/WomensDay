/**
 * Fireworks Effect - Hiệu ứng pháo hoa màu hồng
 * Tạo hiệu ứng pháo hoa nổ với màu sắc hồng tím lãng mạn
 */

class FireworksEffect {
    constructor(canvasSelector, options = {}) {
        this.canvas = document.querySelector(canvasSelector);
        this.ctx = this.canvas.getContext('2d');
        this.options = {
            maxParticles: 150,
            gravity: 0.5,
            friction: 0.99,
            colors: [
                { r: 220, g: 38, b: 127 },   // Hồng đậm (Rose Pink)
                { r: 255, g: 182, b: 193 },  // Hồng nhạt (Light Pink)
                { r: 255, g: 20, b: 147 },   // Hồng đậm (Deep Pink)
                { r: 255, g: 192, b: 203 },  // Hồng nhạt (Pink)
                { r: 255, g: 105, b: 180 },  // Hồng đậm (Hot Pink)
                { r: 255, g: 218, b: 185 },  // Hồng nhạt (Peach Puff)
                { r: 255, g: 228, b: 225 },  // Hồng rất nhạt (Misty Rose)
                { r: 238, g: 130, b: 238 }   // Hồng tím (Violet)
            ],
            particleSpeed: 8,
            particleSize: 3,
            trailLength: 8,
            explosionRadius: 100,
            ...options
        };
        
        this.particles = [];
        this.fireworks = [];
        this.isRunning = false;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
    }
    
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    setupEventListeners() {
        // Click để tạo pháo hoa
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.createFirework(x, y);
        });
        
        // Random fireworks
        setInterval(() => {
            if (this.isRunning && Math.random() < 0.3) {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * (this.canvas.height * 0.6) + (this.canvas.height * 0.2);
                this.createFirework(x, y);
            }
        }, 800);
    }
    
    createFirework(x, y) {
        const firework = {
            x: x,
            y: this.canvas.height, // Bắt đầu từ dưới màn hình
            targetX: x,
            targetY: y,
            speed: 0,
            maxSpeed: 15,
            acceleration: 0.3,
            trail: [],
            color: this.getRandomColor(),
            exploded: false,
            particles: []
        };
        
        this.fireworks.push(firework);
    }
    
    explode(firework) {
        firework.exploded = true;
        
        // Tạo particles cho vụ nổ
        const particleCount = Math.floor(Math.random() * 30) + 20;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
            const speed = Math.random() * this.options.particleSpeed + 3;
            
            const particle = {
                x: firework.x,
                y: firework.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: this.getRandomColor(),
                life: 1.0,
                decay: Math.random() * 0.02 + 0.01,
                size: Math.random() * this.options.particleSize + 1,
                trail: []
            };
            
            firework.particles.push(particle);
            this.particles.push(particle);
        }
    }
    
    getRandomColor() {
        return this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
    }
    
    updateFireworks() {
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const firework = this.fireworks[i];
            
            if (!firework.exploded) {
                // Di chuyển firework lên trên
                firework.speed += firework.acceleration;
                firework.y -= firework.speed;
                
                // Thêm trail
                firework.trail.push({ x: firework.x, y: firework.y });
                if (firework.trail.length > this.options.trailLength) {
                    firework.trail.shift();
                }
                
                // Kiểm tra vụ nổ
                if (firework.speed > 0 && firework.y <= firework.targetY) {
                    this.explode(firework);
                }
                
                // Xóa firework nếu ra khỏi màn hình
                if (firework.y < -50) {
                    this.fireworks.splice(i, 1);
                }
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Cập nhật vị trí
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += this.options.gravity;
            
            // Áp dụng friction
            particle.vx *= this.options.friction;
            particle.vy *= this.options.friction;
            
            // Giảm life
            particle.life -= particle.decay;
            
            // Thêm trail
            particle.trail.push({ x: particle.x, y: particle.y });
            if (particle.trail.length > 5) {
                particle.trail.shift();
            }
            
            // Xóa particle khi hết life
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    drawFireworks() {
        this.fireworks.forEach(firework => {
            if (!firework.exploded) {
                // Vẽ trail
                this.ctx.strokeStyle = `rgba(${firework.color.r}, ${firework.color.g}, ${firework.color.b}, 0.6)`;
                this.ctx.lineWidth = 3;
                this.ctx.lineCap = 'round';
                
                this.ctx.beginPath();
                this.ctx.moveTo(firework.trail[0].x, firework.trail[0].y);
                for (let i = 1; i < firework.trail.length; i++) {
                    this.ctx.lineTo(firework.trail[i].x, firework.trail[i].y);
                }
                this.ctx.stroke();
                
                // Vẽ firework
                this.ctx.fillStyle = `rgba(${firework.color.r}, ${firework.color.g}, ${firework.color.b}, 1)`;
                this.ctx.beginPath();
                this.ctx.arc(firework.x, firework.y, 4, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Vẽ glow effect
                this.ctx.shadowColor = `rgba(${firework.color.r}, ${firework.color.g}, ${firework.color.b}, 0.8)`;
                this.ctx.shadowBlur = 15;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            // Vẽ trail
            if (particle.trail.length > 1) {
                this.ctx.strokeStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.life * 0.3})`;
                this.ctx.lineWidth = 1;
                this.ctx.lineCap = 'round';
                
                this.ctx.beginPath();
                this.ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
                for (let i = 1; i < particle.trail.length; i++) {
                    this.ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
                }
                this.ctx.stroke();
            }
            
            // Vẽ particle
            const alpha = particle.life;
            this.ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Vẽ glow effect
            this.ctx.shadowColor = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${alpha * 0.5})`;
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }
    
    animate() {
        if (!this.isRunning) return;
        
        // Clear canvas với fade effect
        this.ctx.fillStyle = `rgba(255, 240, 245, ${0.02})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update và draw
        this.updateFireworks();
        this.updateParticles();
        this.drawFireworks();
        this.drawParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    start() {
        this.isRunning = true;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    toggle() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    // Tạo pháo hoa tự động
    startAutoFireworks() {
        setInterval(() => {
            if (this.isRunning) {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * (this.canvas.height * 0.4) + (this.canvas.height * 0.2);
                this.createFirework(x, y);
            }
        }, 1500);
    }
}

// Export cho module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FireworksEffect };
}
