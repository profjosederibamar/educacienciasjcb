export interface Habilidade {
  id: string;
  descricao: string;
  descritor?: string;
  objetosConhecimento: string[];
  sugestoesPedagogicas: string[];
  inclusaoAdaptacao: string[];
  linksSugeridos: { titulo: string; url: string }[];
  conexoes?: string[];
}

export interface Bimestre {
  numero: number;
  habilidades: Habilidade[];
}

export interface AnoEscolar {
  ano: number;
  bimestres: Bimestre[];
}

export interface CurriculumData {
  anos: AnoEscolar[];
}
