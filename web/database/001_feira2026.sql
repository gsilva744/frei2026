-- Banco da 6ª Feira das Profissões 2026 (Cloudflare D1 / SQLite)
-- Execute este arquivo uma única vez no banco D1 antes de publicar o site.
-- Os comentários abaixo também servem como guia para manutenção manual.

PRAGMA foreign_keys = ON;

-- Uma linha por inscrição. CPF e codigo_qr não podem se repetir.
CREATE TABLE IF NOT EXISTS visitantes (
  id TEXT PRIMARY KEY,                 -- Identificador técnico: vis-UUID
  nome TEXT NOT NULL,                  -- Nome completo informado no formulário
  email TEXT NOT NULL,                 -- E-mail de contato
  cpf TEXT NOT NULL UNIQUE,             -- CPF formatado: 000.000.000-00
  telefone TEXT NOT NULL,               -- Telefone formatado: (00) 00000-0000
  vinculo TEXT NOT NULL,                -- Aluno atual | Ex-aluno | Nunca estudei
  como_soube TEXT NOT NULL,             -- Canal de divulgação da feira
  genero TEXT NOT NULL,                 -- Masculino | Feminino | Outro
  curso_interesse TEXT NOT NULL,        -- Curso escolhido pelo visitante
  codigo_qr TEXT NOT NULL UNIQUE,       -- Texto codificado no QR Code
  qr_code_svg TEXT,                     -- Imagem SVG do QR Code; opcional, mas enviada pelo site
  criado_em TEXT NOT NULL,              -- ISO 8601, ex.: 2026-08-26T15:00:00.000Z
  atualizado_em TEXT NOT NULL            -- ISO 8601 da última edição
);

-- Uma linha por entrada de um visitante em uma atração/setor.
CREATE TABLE IF NOT EXISTS presencas (
  id TEXT PRIMARY KEY,                 -- Identificador técnico: pre-UUID
  visitante_id TEXT NOT NULL,           -- Referência ao visitante cadastrado
  codigo_qr TEXT NOT NULL,              -- Cópia do código lido, facilita auditoria manual
  setor TEXT NOT NULL,                  -- informatica | comunicacao | ingles | administracao | mecanica
  registrado_em TEXT NOT NULL,          -- ISO 8601 gerado pelo servidor
  FOREIGN KEY (visitante_id) REFERENCES visitantes(id) ON DELETE CASCADE,
  UNIQUE (visitante_id, setor)          -- Não contabiliza a mesma pessoa duas vezes no setor
);

-- Índices deixam o leitor QR e o painel rápidos mesmo com muitas inscrições.
CREATE INDEX IF NOT EXISTS idx_visitantes_codigo_qr ON visitantes(codigo_qr);
CREATE INDEX IF NOT EXISTS idx_presencas_visitante ON presencas(visitante_id);
CREATE INDEX IF NOT EXISTS idx_presencas_setor ON presencas(setor);
