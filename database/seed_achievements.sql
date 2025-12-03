-- ============================================
-- TORRES MOTORSPORT ENGINEERING - ACHIEVEMENTS SEED DATA
-- Logros predefinidos del juego
-- ============================================

INSERT INTO achievements (id, name, description, icon, category, max_progress, reward_experience, reward_currency)
VALUES

-- Logros de Bronce (Principiante)
('first-build', 'Primera Construcción', 'Guarda tu primera configuración de vehículo', 'Wrench', 'bronze', 1, 100, 1000),
('first-part', 'Primera Pieza', 'Instala tu primera pieza de modificación', 'Settings', 'bronze', 1, 50, 500),
('10-parts', 'Mecánico Novato', 'Instala 10 piezas en total', 'Tool', 'bronze', 10, 200, 2000),
('first-turbo', 'Boost Inicial', 'Instala tu primer turbo', 'Wind', 'bronze', 1, 150, 1500),
('color-change', 'Artista', 'Cambia el color de tu vehículo por primera vez', 'Palette', 'bronze', 1, 50, 500),

-- Logros de Plata (Intermedio)
('50-parts', 'Mecánico Experto', 'Instala 50 piezas en total', 'Wrench', 'silver', 50, 500, 5000),
('300hp', 'Potencia Respetable', 'Alcanza 300 CV en un vehículo', 'Gauge', 'silver', 1, 300, 3000),
('500hp', 'Potencia Seria', 'Alcanza 500 CV en un vehículo', 'Flame', 'silver', 1, 500, 5000),
('all-jdm', 'Coleccionista JDM', 'Posee todos los vehículos JDM', 'Car', 'silver', 6, 1000, 10000),
('10-builds', 'Constructor', 'Guarda 10 configuraciones diferentes', 'Save', 'silver', 10, 400, 4000),

-- Logros de Oro (Avanzado)
('1000hp', 'Cuatro Cifras', 'Alcanza 1000 CV en un vehículo', 'Zap', 'gold', 1, 1000, 15000),
('all-vehicles', 'Coleccionista Total', 'Posee todos los vehículos del juego', 'Crown', 'gold', 12, 2000, 25000),
('100-parts', 'Maestro Mecánico', 'Instala 100 piezas en total', 'Award', 'gold', 100, 1500, 15000),
('sub-3-quarter', 'Relámpago', 'Logra un tiempo de 1/4 de milla inferior a 10 segundos', 'Timer', 'gold', 1, 1200, 12000),
('top-speed-350', 'Velocidad Extrema', 'Alcanza 350 km/h de velocidad máxima', 'Rocket', 'gold', 1, 1000, 10000),

-- Logros de Platino (Legendario)
('1500hp', 'Fuerza Brutal', 'Alcanza 1500 CV en un vehículo', 'Flame', 'platinum', 1, 2500, 50000),
('perfect-build', 'Construcción Perfecta', 'Maximiza todas las estadísticas de un vehículo', 'Star', 'platinum', 1, 3000, 75000),
('master-tuner', 'Maestro del Tuning', 'Completa todos los demás logros', 'Trophy', 'platinum', 16, 5000, 100000)

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    reward_experience = EXCLUDED.reward_experience,
    reward_currency = EXCLUDED.reward_currency;
