-- ============================================
-- TORRES MOTORSPORT ENGINEERING - VEHICLES SEED DATA
-- Migración de datos desde vehicles.ts
-- ============================================

INSERT INTO vehicles (
    id, name, manufacturer, year, body_style, base_price,
    engine_type, engine_displacement, engine_cylinders, engine_naturally_aspirated,
    engine_base_horsepower, engine_base_torque, engine_redline,
    drivetrain, engine_layout, transmission_type, transmission_gears,
    weight, wheelbase, track_width, engine_bay_size, bolt_pattern,
    fuel_capacity, drag_coefficient, image_url,
    default_primary_color, default_secondary_color, default_accent_color
) VALUES

-- ===============================
-- JDM LEGENDS
-- ===============================

('nissan-skyline-r34', 'Skyline R34 GT-R', 'Nissan', 1999, 'coupe', 85000,
 'inline6', 2.6, 6, false, 280, 392, 8000,
 'AWD', 'front', 'manual', 6,
 1560, 2665, 1480, 48, '5x114.3', 65, 0.34,
 '/vehicles/r34.jpg', '#1a365d', '#334155', '#00d4ff'),

('toyota-supra-a80', 'Supra A80', 'Toyota', 1993, 'coupe', 75000,
 'inline6', 3.0, 6, false, 320, 440, 7200,
 'RWD', 'front', 'manual', 6,
 1510, 2550, 1520, 52, '5x114.3', 70, 0.32,
 '/vehicles/supra.jpg', '#dc2626', '#334155', '#00d4ff'),

('mazda-rx7-fd', 'RX-7 FD', 'Mazda', 1992, 'coupe', 65000,
 'rotary', 1.3, 2, false, 280, 314, 8500,
 'RWD', 'front', 'manual', 5,
 1280, 2425, 1460, 38, '5x114.3', 76, 0.31,
 '/vehicles/rx7.jpg', '#fbbf24', '#334155', '#00d4ff'),

('honda-nsx', 'NSX NA1', 'Honda', 1990, 'coupe', 120000,
 'v6', 3.0, 6, true, 290, 304, 8300,
 'RWD', 'mid', 'manual', 5,
 1230, 2530, 1510, 42, '5x114.3', 70, 0.32,
 '/vehicles/nsx.jpg', '#dc2626', '#334155', '#00d4ff'),

('mitsubishi-evo-ix', 'Lancer Evolution IX', 'Mitsubishi', 2005, 'sedan', 55000,
 'inline4', 2.0, 4, false, 286, 400, 7500,
 'AWD', 'front', 'manual', 6,
 1410, 2625, 1515, 35, '5x114.3', 55, 0.35,
 '/vehicles/evo.jpg', '#f8fafc', '#334155', '#00d4ff'),

('subaru-impreza-sti', 'Impreza WRX STI', 'Subaru', 2004, 'sedan', 48000,
 'flat4', 2.5, 4, false, 280, 392, 7500,
 'AWD', 'front', 'manual', 6,
 1470, 2540, 1495, 38, '5x100', 60, 0.36,
 '/vehicles/sti.jpg', '#1d4ed8', '#334155', '#00d4ff'),

-- ===============================
-- EUROPEAN PERFORMANCE
-- ===============================

('bmw-m3-e46', 'M3 CSL', 'BMW', 2003, 'coupe', 95000,
 'inline6', 3.2, 6, true, 360, 370, 8000,
 'RWD', 'front', 'sequential', 6,
 1385, 2730, 1500, 45, '5x120', 63, 0.32,
 '/vehicles/m3-e46.jpg', '#f8fafc', '#334155', '#00d4ff'),

('porsche-911-gt3-997', '911 GT3 RS', 'Porsche', 2010, 'coupe', 185000,
 'flat6', 3.8, 6, true, 450, 430, 8500,
 'RWD', 'rear', 'manual', 6,
 1370, 2355, 1497, 40, '5x130', 64, 0.32,
 '/vehicles/gt3.jpg', '#22c55e', '#334155', '#f97316'),

('mercedes-amg-gtr', 'AMG GT R', 'Mercedes-AMG', 2020, 'coupe', 165000,
 'v8', 4.0, 8, false, 577, 700, 7000,
 'RWD', 'front', 'dct', 7,
 1630, 2630, 1672, 55, '5x112', 75, 0.35,
 '/vehicles/amg-gtr.jpg', '#16a34a', '#334155', '#00d4ff'),

-- ===============================
-- AMERICAN MUSCLE
-- ===============================

('ford-mustang-gt500', 'Shelby GT500', 'Ford', 2020, 'coupe', 75000,
 'v8', 5.2, 8, false, 760, 847, 7500,
 'RWD', 'front', 'dct', 7,
 1916, 2720, 1598, 65, '5x114.3', 61, 0.33,
 '/vehicles/gt500.jpg', '#1e40af', '#334155', '#00d4ff'),

('chevrolet-camaro-zl1', 'Camaro ZL1 1LE', 'Chevrolet', 2019, 'coupe', 68000,
 'v8', 6.2, 8, false, 650, 881, 6500,
 'RWD', 'front', 'manual', 6,
 1747, 2811, 1594, 60, '5x120', 72, 0.35,
 '/vehicles/zl1.jpg', '#18181b', '#334155', '#00d4ff'),

('dodge-challenger-hellcat', 'Challenger SRT Hellcat', 'Dodge', 2021, 'coupe', 62000,
 'v8', 6.2, 8, false, 717, 881, 6200,
 'RWD', 'front', 'automatic', 8,
 2028, 2946, 1603, 70, '5x114.3', 70, 0.38,
 '/vehicles/hellcat.jpg', '#7c2d12', '#334155', '#00d4ff')

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    manufacturer = EXCLUDED.manufacturer,
    year = EXCLUDED.year,
    base_price = EXCLUDED.base_price,
    engine_base_horsepower = EXCLUDED.engine_base_horsepower,
    engine_base_torque = EXCLUDED.engine_base_torque,
    updated_at = NOW();
