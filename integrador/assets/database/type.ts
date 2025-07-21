export interface Nivel {
  id?: number;
  recompensa?: number;
}

export interface NivelXUsuario {
  id?: number;
  puntaje: number;
  tiempo: number;
  palabra: string;
  intento: number;
  recompensa_intento: string;
  IdUsuario: number;
  IdNivel: number;
}

export interface Herramienta {
  id?: number;
  tipo: string;
  cantidad?: number;
  IdUsuario: number;
}

export interface Vida {
  id?: number;
  cantidad?: number;
  IdUsuario: number;
}

export interface Palabras {
  id?: number;
  palabra: string;
}

export interface Usuario {
  id?: number;
  nombre_completo: string;
  nombre_usuario: string;
  mail: string;
  contrasena: string;
  racha?: number;
  monedas?: number;
}