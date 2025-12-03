/**
 * Interactive Dot Canvas Animation
 * Creates a field of particles that react to mouse movement.
 */
export default function initDotCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    let width, height;
    let particles = [];
    let animationFrameId;

    // Mouse state
    const mouse = { x: -9999, y: -9999 };

    // Configuration
    const config = {
        particleCount: 250, // Increased density for more activity
        baseRadius: 1.4, // Slightly larger for better visibility
        color: "rgba(37, 99, 235, 1)", // Fully opaque for more visibility
        hoverRadius: 180, // Larger interaction zone
        pushForce: 0.05, // Stronger push for more reaction
        returnSpeed: 0.04, // Faster return for more liveliness
    };

    // Particle Class
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            // Spawn randomly across the entire rectangular canvas
            this.x = Math.random() * width;
            this.y = Math.random() * height;

            this.originX = this.x;
            this.originY = this.y;

            this.vx = (Math.random() - 0.5) * 0.3; // Increased drift for more movement
            this.vy = (Math.random() - 0.5) * 0.3;

            this.size = config.baseRadius;
            this.targetSize = config.baseRadius;
        }

        update() {
            // 1. Calculate distance to mouse
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 2. Interaction Logic
            if (distance < config.hoverRadius) {
                // Calculate push vector
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (config.hoverRadius - distance) / config.hoverRadius;

                // Push away from mouse
                const directionX = forceDirectionX * force * config.pushForce * 100;
                const directionY = forceDirectionY * force * config.pushForce * 100;

                this.x -= directionX;
                this.y -= directionY;

                // Enlarge (Subtle)
                this.targetSize = config.baseRadius * 2.5;
            } else {
                // Return to origin (magnetic pull)
                if (this.x !== this.originX) {
                    this.x -= (this.x - this.originX) * config.returnSpeed;
                }
                if (this.y !== this.originY) {
                    this.y -= (this.y - this.originY) * config.returnSpeed;
                }

                // Reset size
                this.targetSize = config.baseRadius;
            }

            // 3. Apply subtle drift
            this.originX += this.vx;
            this.originY += this.vy;

            // 4. Bounce off edges (for origin drift)
            if (Math.abs(this.originX - this.x) > 10) this.vx *= -1;
            if (Math.abs(this.originY - this.y) > 10) this.vy *= -1;

            // 5. Smooth size transition
            this.size += (this.targetSize - this.size) * 0.1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = config.color;
            ctx.fill();
        }
    }

    // Resize Handler with High DPI Support
    const handleResize = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Set actual size in memory (scaled to account for extra pixel density)
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        // Normalize coordinate system to use css pixels
        ctx.scale(dpr, dpr);

        // Store logical width/height for calculations
        width = rect.width;
        height = rect.height;

        initParticles();
    };

    // Initialize Particles
    const initParticles = () => {
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }
    };

    // Mouse Handlers
    const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
        mouse.x = -9999;
        mouse.y = -9999;
    };

    // Animation Loop
    const animate = () => {
        ctx.clearRect(0, 0, width, height);
        particles.forEach((p) => {
            p.update();
            p.draw();
        });
        animationFrameId = requestAnimationFrame(animate);
    };

    // Setup
    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    handleResize();
    animate();

    // Cleanup function
    return () => {
        window.removeEventListener("resize", handleResize);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
        cancelAnimationFrame(animationFrameId);
    };
}
