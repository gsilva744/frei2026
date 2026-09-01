-- O código QR não é mais gerado no cadastro: ele vem de outro sistema/impressão física
-- e só é vinculado ao visitante no check-in da equipe de credenciamento. Por isso
-- codigo_qr passa a aceitar NULL (o índice UNIQUE já existente continua funcionando —
-- MySQL permite múltiplos NULLs numa coluna UNIQUE) e visitantes ganha data_chegada,
-- preenchida no momento do check-in.

ALTER TABLE visitantes
  MODIFY COLUMN codigo_qr VARCHAR(120) NULL;

ALTER TABLE visitantes
  ADD COLUMN data_chegada DATETIME NULL AFTER participa_como_colaborador;
