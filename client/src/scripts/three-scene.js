/* ========================================
   ORAVEL LIFESTYLE - Three.js 3D Background Scene
   ======================================== */

class ThreeScene {
  constructor(containerSelector) {
    this.containerSelector = containerSelector;
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.objects = [];
    this.particles = null;
    this.lights = [];
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    this.clock = null;
    this.isVisible = true;
    this.animationId = null;
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded, skipping 3D scene');
      return;
    }

    this.container = document.querySelector(this.containerSelector);
    if (!this.container) return;

    this.clock = new THREE.Clock();
    this.setupScene();
    this.createObjects();
    this.createParticles();
    this.setupLights();
    this.setupMouseTracking();
    this.setupResizeHandler();
    this.setupVisibilityObserver();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 12;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: window.devicePixelRatio <= 1.5
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setClearColor(0x000000, 0);

    this.container.appendChild(this.renderer.domElement);
  }

  createObjects() {
    const colors = [0xd4a574, 0xb76e79, 0x8b5cf6, 0x6366f1, 0xf5f0eb];
    const geometries = [];

    // Icosahedrons
    for (let i = 0; i < 3; i++) {
      geometries.push({
        geo: new THREE.IcosahedronGeometry(0.5 + Math.random() * 1, 0),
        wireframe: Math.random() > 0.5
      });
    }

    // Torus Knots
    for (let i = 0; i < 2; i++) {
      geometries.push({
        geo: new THREE.TorusKnotGeometry(0.4 + Math.random() * 0.4, 0.12, 64, 8),
        wireframe: Math.random() > 0.6
      });
    }

    // Octahedrons
    for (let i = 0; i < 4; i++) {
      geometries.push({
        geo: new THREE.OctahedronGeometry(0.3 + Math.random() * 0.8, 0),
        wireframe: Math.random() > 0.4
      });
    }

    // Tetrahedrons
    for (let i = 0; i < 3; i++) {
      geometries.push({
        geo: new THREE.TetrahedronGeometry(0.4 + Math.random() * 0.6, 0),
        wireframe: Math.random() > 0.5
      });
    }

    // Spheres
    for (let i = 0; i < 4; i++) {
      geometries.push({
        geo: new THREE.SphereGeometry(0.2 + Math.random() * 0.3, 16, 16),
        wireframe: false
      });
    }

    geometries.forEach((item, index) => {
      const color = colors[index % colors.length];
      const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3 + Math.random() * 0.4,
        roughness: 0.2 + Math.random() * 0.3,
        transparent: true,
        opacity: 0.25 + Math.random() * 0.35,
        wireframe: item.wireframe
      });

      const mesh = new THREE.Mesh(item.geo, material);
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        -5 - Math.random() * 10
      );

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      this.objects.push({
        mesh: mesh,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.008,
          y: (Math.random() - 0.5) * 0.008
        },
        floatSpeed: 0.3 + Math.random() * 0.7,
        floatAmplitude: 0.3 + Math.random() * 0.8,
        initialY: mesh.position.y
      });

      this.scene.add(mesh);
    });
  }

  createParticles() {
    const count = 180;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 50;
      positions[i + 2] = (Math.random() - 0.5) * 30 - 5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xd4a574,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  setupLights() {
    const ambient = new THREE.AmbientLight(0x1a1a2e, 0.5);
    this.scene.add(ambient);

    const light1 = new THREE.PointLight(0xd4a574, 1, 50);
    light1.position.set(10, 10, 10);
    this.scene.add(light1);
    this.lights.push({ light: light1, speed: 0.3, radius: 12, axis: 'xz' });

    const light2 = new THREE.PointLight(0x8b5cf6, 0.8, 50);
    light2.position.set(-10, -5, 5);
    this.scene.add(light2);
    this.lights.push({ light: light2, speed: 0.2, radius: 10, axis: 'xy' });

    const light3 = new THREE.PointLight(0xb76e79, 0.6, 50);
    light3.position.set(0, 5, -10);
    this.scene.add(light3);
    this.lights.push({ light: light3, speed: 0.25, radius: 8, axis: 'yz' });
  }

  setupMouseTracking() {
    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => {
      if (!this.camera || !this.renderer) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  setupVisibilityObserver() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const observer = new IntersectionObserver((entries) => {
      this.isVisible = entries[0].isIntersecting;
    }, { threshold: 0.1 });

    observer.observe(hero);
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    if (!this.isVisible) return;

    const elapsed = this.clock.getElapsedTime();

    // Smooth mouse movement
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    // Rotate and float objects
    this.objects.forEach(obj => {
      obj.mesh.rotation.x += obj.rotationSpeed.x;
      obj.mesh.rotation.y += obj.rotationSpeed.y;
      obj.mesh.position.y = obj.initialY + Math.sin(elapsed * obj.floatSpeed) * obj.floatAmplitude;
    });

    // Rotate particles
    if (this.particles) {
      this.particles.rotation.y = elapsed * 0.02;
      this.particles.rotation.x = elapsed * 0.01;
    }

    // Move lights in circular paths
    this.lights.forEach((item, i) => {
      const t = elapsed * item.speed;
      if (item.axis === 'xz') {
        item.light.position.x = Math.cos(t) * item.radius;
        item.light.position.z = Math.sin(t) * item.radius;
      } else if (item.axis === 'xy') {
        item.light.position.x = Math.cos(t) * item.radius;
        item.light.position.y = Math.sin(t) * item.radius;
      } else {
        item.light.position.y = Math.cos(t) * item.radius;
        item.light.position.z = Math.sin(t) * item.radius;
      }
    });

    // Camera parallax
    this.camera.position.x += (this.mouse.x * 2 - this.camera.position.x) * 0.02;
    this.camera.position.y += (this.mouse.y * 1.5 - this.camera.position.y) * 0.02;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

window.ThreeScene = ThreeScene;
