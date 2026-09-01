-- Adiciona o papel "leitor" (equipe que só opera o leitor de QR/presença), separado de
-- "credenciamento" (cadastro/edição/check-in de visitantes). Cada papel agora enxerga
-- só o cartão correspondente no hub — "admin" continua com acesso total.
ALTER TABLE administradores
  MODIFY COLUMN papel ENUM('admin', 'credenciamento', 'leitor') NOT NULL DEFAULT 'credenciamento';
