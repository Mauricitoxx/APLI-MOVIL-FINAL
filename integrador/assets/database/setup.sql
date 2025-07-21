CREATE TABLE IF NOT EXISTS Usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_completo TEXT NOT NULL,
    nombre_usuario TEXT NOT NULL UNIQUE,
    mail TEXT NOT NULL UNIQUE,
    contraseña TEXT NOT NULL,
    racha INTEGER DEFAULT 0,
    monedas INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Nivel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recompensa INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS NivelXUsuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    puntaje INTEGER,
    tiempo INTEGER, -- en segundos
    palabra TEXT,
    intento INTEGER,
    recompensa_intento TEXT,
    IdUsuario INTEGER,
    IdNivel INTEGER,
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(id),
    FOREIGN KEY (IdNivel) REFERENCES Nivel(id)
);

CREATE TABLE IF NOT EXISTS Herramienta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,
    cantidad INTEGER DEFAULT 0,
    IdUsuario INTEGER,
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(id)
);

CREATE TABLE IF NOT EXISTS Vida (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cantidad INTEGER DEFAULT 3,
    IdUsuario INTEGER,
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(id)
);

CREATE TABLE IF NOT EXISTS Palabras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    palabra TEXT UNIQUE
);

-- Carga de datos
-- Usuarios
INSERT INTO Usuario (nombre_completo, nombre_usuario, mail, contraseña)
VALUES
('Juan Pérez', 'juanp', 'juan@example.com', '123456'),
('Ana López', 'analo', 'ana@example.com', 'abcdef');

-- Niveles
INSERT INTO Nivel (recompensa) VALUES
(10), (20), (30);

-- NivelesXUsuario
INSERT INTO NivelXUsuario (puntaje, tiempo, palabra, intento, recompensa_intento, IdUsuario, IdNivel)
VALUES
(85, 45, 'sol', 1, '5', 1, 1),
(90, 40, 'luz', 1, '10', 2, 1);

-- Vidas
INSERT INTO Vida (cantidad, IdUsuario) VALUES
(3, 1),
(2, 2);

-- Herramientas
INSERT INTO Herramienta (tipo, cantidad, IdUsuario)
VALUES
('Pista', 2, 1),
('Congelar tiempo', 1, 1),
('Reintento', 1, 2);

-- Palabras
INSERT INTO Palabras (palabra) VALUES
('sol'), ('luz'), ('estrella'), ('luna'), ('planeta');
