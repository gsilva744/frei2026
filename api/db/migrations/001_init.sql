-- Estrutura inicial da API da 6ª Feira das Profissões 2026 (MySQL 8).
-- Evolui web/database/001_feira2026.sql: normaliza setores, adiciona autenticação
-- (administradores + refresh_tokens) e persiste `participa_como_colaborador`
-- (campo usado pelo front-end mas nunca gravado pela API anterior).

CREATE TABLE IF NOT EXISTS administradores (
  id CHAR(36) PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  senha_hash VARCHAR(100) NOT NULL,
  papel ENUM('admin', 'credenciamento') NOT NULL DEFAULT 'credenciamento',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em DATETIME NOT NULL,
  atualizado_em DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id CHAR(36) PRIMARY KEY,
  administrador_id CHAR(36) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expira_em DATETIME NOT NULL,
  revogado_em DATETIME NULL,
  criado_em DATETIME NOT NULL,
  FOREIGN KEY (administrador_id) REFERENCES administradores(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_admin ON refresh_tokens(administrador_id);

CREATE TABLE IF NOT EXISTS setores (
  id VARCHAR(40) PRIMARY KEY,
  nome VARCHAR(80) NOT NULL,
  andar VARCHAR(40) NOT NULL,
  cor VARCHAR(10) NOT NULL,
  ordem INT NOT NULL DEFAULT 0
);

INSERT INTO setores (id, nome, andar, cor, ordem) VALUES
  ('informatica',   'Informática',        '1º Andar', '#17356f', 1),
  ('comunicacao',   'Comunicação Visual', '3º Andar', '#2a4d94', 2),
  ('ingles',        'Inglês',             '2º Andar', '#0f2550', 3),
  ('administracao', 'Administração',      '2º Andar', '#f5c435', 4),
  ('mecanica',      'Mecânica',           'Pátio',    '#e0ad19', 5)
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

CREATE TABLE IF NOT EXISTS visitantes (
  id CHAR(36) PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  telefone VARCHAR(20) NOT NULL,
  vinculo ENUM('Aluno atual', 'Ex-aluno', 'Nunca estudei') NOT NULL,
  como_soube VARCHAR(100) NOT NULL,
  genero ENUM('Masculino', 'Feminino', 'Outro') NOT NULL,
  curso_interesse VARCHAR(150) NOT NULL,
  participa_como_colaborador BOOLEAN NOT NULL DEFAULT FALSE,
  codigo_qr VARCHAR(120) NOT NULL UNIQUE,
  qr_code_svg TEXT NULL,
  criado_em DATETIME NOT NULL,
  atualizado_em DATETIME NOT NULL
);

CREATE INDEX idx_visitantes_codigo_qr ON visitantes(codigo_qr);

CREATE TABLE IF NOT EXISTS presencas (
  id CHAR(36) PRIMARY KEY,
  visitante_id CHAR(36) NOT NULL,
  setor_id VARCHAR(40) NOT NULL,
  codigo_qr VARCHAR(120) NOT NULL,
  registrado_em DATETIME NOT NULL,
  FOREIGN KEY (visitante_id) REFERENCES visitantes(id) ON DELETE CASCADE,
  FOREIGN KEY (setor_id) REFERENCES setores(id),
  UNIQUE (visitante_id, setor_id)
);

CREATE INDEX idx_presencas_visitante ON presencas(visitante_id);
CREATE INDEX idx_presencas_setor ON presencas(setor_id);
