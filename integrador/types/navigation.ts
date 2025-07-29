import { NivelXUsuario } from "@/assets/database/type";

export type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Shop: undefined;
  Game: {
    nivel: NivelXUsuario;
    onResultado: (nivelActualizado: NivelXUsuario | null) => void;
  };
  GameScreen: { nivel: NivelXUsuario };
};
