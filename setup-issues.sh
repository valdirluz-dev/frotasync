#!/usr/bin/env bash

set -e

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

if [ -z "$REPO" ]; then
  echo "❌ Não foi possível determinar o repositório do GitHub. Certifique-se de estar na pasta do projeto."
  exit 1
fi

echo "🎯 Repositório: $REPO"

echo "🚀 Criando os novos Milestones via GitHub API..."

# Não interrompe se o milestone já existir (HTTP 422)
set +e
gh api "repos/$REPO/milestones" -f title="Módulo — Gestão Global de Documentos" > /dev/null 2>&1
gh api "repos/$REPO/milestones" -f title="Módulo — Gestão Global de Tarefas" > /dev/null 2>&1
set -e

echo "📌 Reatribuindo Issues de Documentos Globais..."
gh issue edit 14 --repo "$REPO" --milestone "Módulo — Gestão Global de Documentos"
gh issue edit 15 --repo "$REPO" --milestone "Módulo — Gestão Global de Documentos"
gh issue edit 16 --repo "$REPO" --milestone "Módulo — Gestão Global de Documentos"
gh issue edit 17 --repo "$REPO" --milestone "Módulo — Gestão Global de Documentos"
gh issue edit 18 --repo "$REPO" --milestone "Módulo — Gestão Global de Documentos"

echo "📌 Reatribuindo Issues de Tarefas Globais..."
gh issue edit 19 --repo "$REPO" --milestone "Módulo — Gestão Global de Tarefas"
gh issue edit 20 --repo "$REPO" --milestone "Módulo — Gestão Global de Tarefas"
gh issue edit 21 --repo "$REPO" --milestone "Módulo — Gestão Global de Tarefas"
gh issue edit 22 --repo "$REPO" --milestone "Módulo — Gestão Global de Tarefas"
gh issue edit 23 --repo "$REPO" --milestone "Módulo — Gestão Global de Tarefas"

echo "✅ Milestones criados e issues reatribuídas com sucesso!"