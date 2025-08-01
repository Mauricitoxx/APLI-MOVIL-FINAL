import { NivelXUsuario } from "@/assets/database/type";

export type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Shop: undefined;
  User: undefined;
  Game: {
    nivel: NivelXUsuario;
    onResultado: (resultado: NivelXUsuario | null) => void;
    resultado?: NivelXUsuario | null;
  };
  GameScreen: { 
    nivel: NivelXUsuario;
    onResultado: (resultado: NivelXUsuario | null) => void;
    resultado?: NivelXUsuario | null;
  };
};
