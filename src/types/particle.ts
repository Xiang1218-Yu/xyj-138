export interface BaseParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  opacity: number;
  size: number;
}

export interface ParticlePool<T extends BaseParticle> {
  particles: T[];
  maxParticles: number;
  emit: (config: Partial<T>) => void;
  update: (deltaTime: number) => void;
  reset: () => void;
}

export function createParticlePool<T extends BaseParticle>(
  maxParticles: number,
  factory: () => T
): ParticlePool<T> {
  const particles: T[] = [];

  for (let i = 0; i < maxParticles; i++) {
    particles.push(factory());
  }

  return {
    particles,
    maxParticles,
    emit(config: Partial<T>) {
      const deadParticle = particles.find((p) => p.life <= 0);
      if (deadParticle) {
        Object.assign(deadParticle, factory(), config, { life: config.maxLife || 60 });
      }
    },
    update(deltaTime: number) {
      for (const particle of particles) {
        if (particle.life > 0) {
          particle.x += particle.vx * deltaTime;
          particle.y += particle.vy * deltaTime;
          particle.life -= deltaTime * 60;
          particle.opacity = Math.max(0, particle.life / particle.maxLife);
        }
      }
    },
    reset() {
      for (const particle of particles) {
        particle.life = 0;
      }
    },
  };
}
