// Importa os tipos do domínio e os dados mockados do dashboard
import type { Documento, Tarefa } from "../types/domain";
import { mockDocumentos, mockTarefas } from "../mocks/dashboard";

// Representa cada linha exibida na lista inferior do card de metas da semana
export interface ItemMetaSemanal {
  id: string; // Identificador único do indicador
  percentual: number; // Percentual exibido na lista e usado na barra de progresso
  quantidade: number; // Quantidade absoluta correspondente ao indicador
  rotulo: string; // Nome completo exibido ao lado do percentual
  corPonto: string; // Cor base da barra de progresso à direita
}

// Estrutura consolidada retornada pela função de produtividade semanal
export interface ResumoProdutividadeSemanal {
  percentualConcluido: number; // Percentual geral exibido dentro do gráfico de anel
  rotuloPrincipal: string; // Texto exibido abaixo do gráfico de anel
  itens: ItemMetaSemanal[]; // Lista enxuta com os dois indicadores principais
}

// Parâmetros opcionais aceitos no cálculo de produtividade
export interface EntradaProdutividade {
  tarefas?: Tarefa[]; // Lista opcional de tarefas (usa mockTarefas por padrão)
  documentos?: Documento[]; // Lista opcional de documentos (usa mockDocumentos por padrão)
  unidadeId?: string; // Filtra tarefas e documentos por uma unidade específica
}

// Define a cor conforme a faixa do percentual (baixa = vermelho, média = amarelo, alta = verde)
function corPorFaixa(percentual: number): string {
  if (percentual >= 75) return "#059669"; // Verde: alto / tudo concluído
  if (percentual >= 40) return "#D97706"; // Amarelo: parcial / em andamento
  return "#DC2626"; // Vermelho: baixo / atenção
}

// Calcula os percentuais de produtividade semanal com base em Tarefas concluídas e Documentos válidos
export function calcularProdutividadeSemanal(
  entrada?: EntradaProdutividade,
): ResumoProdutividadeSemanal {
  // Usa as listas recebidas por parâmetro ou cai nos mocks padrão do dashboard
  const baseTarefas = entrada?.tarefas ?? mockTarefas;
  const baseDocumentos = entrada?.documentos ?? mockDocumentos;

  // Filtra as tarefas pela unidade selecionada, caso unidadeId seja informado
  const tarefas = entrada?.unidadeId
    ? baseTarefas.filter((t) => t.unidadeId === entrada.unidadeId)
    : baseTarefas;

  // Filtra os documentos pela unidade selecionada, caso unidadeId seja informado
  const documentos = entrada?.unidadeId
    ? baseDocumentos.filter((d) => d.unidadeId === entrada.unidadeId)
    : baseDocumentos;

  // Garante denominadores maiores que zero para evitar divisão por zero
  const totalTarefas = Math.max(1, tarefas.length);
  const totalDocumentos = Math.max(1, documentos.length);

  // 1) Tarefas com status "Concluída" (define também o percentual geral do anel)
  const tarefasConcluidas = tarefas.filter(
    (t) => t.status === "Concluída",
  ).length;
  const pctTarefasConcluidas = Math.min(
    100,
    Math.round((tarefasConcluidas / totalTarefas) * 100),
  );

  // 2) Documentos válidos (validade superior a 15 dias a partir de agora)
  const agoraMs = Date.now();
  const docsValidos = documentos.filter((doc) => {
    const validadeMs = Date.parse(doc.dataValidade);
    if (Number.isNaN(validadeMs)) return false;
    const diasRestantes = (validadeMs - agoraMs) / (1000 * 60 * 60 * 24);
    return diasRestantes > 15;
  }).length;
  const pctDocsValidos = Math.round((docsValidos / totalDocumentos) * 100);

  // Retorna o resumo enxuto com os dois indicadores solicitados
  return {
    percentualConcluido: pctTarefasConcluidas,
    rotuloPrincipal: "Concluído",
    itens: [
      {
        id: "tarefas-concluidas",
        percentual: pctTarefasConcluidas,
        quantidade: tarefasConcluidas,
        rotulo: "Tarefas concluídas",
        corPonto: corPorFaixa(pctTarefasConcluidas),
      },
      {
        id: "documentos-validos",
        percentual: pctDocsValidos,
        quantidade: docsValidos,
        rotulo: "Documentos válidos",
        corPonto: corPorFaixa(pctDocsValidos),
      },
    ],
  };
}