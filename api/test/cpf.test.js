import { test } from "node:test";
import assert from "node:assert/strict";
import { cpfValido, somenteDigitos } from "../src/utils/cpf.js";

test("somenteDigitos remove tudo que não é dígito", () => {
  assert.equal(somenteDigitos("123.456.789-09"), "12345678909");
  assert.equal(somenteDigitos(null), "");
});

test("cpfValido aceita um CPF com dígito verificador correto", () => {
  assert.equal(cpfValido("52998224725"), true);
});

test("cpfValido rejeita dígitos repetidos", () => {
  assert.equal(cpfValido("11111111111"), false);
});

test("cpfValido rejeita dígito verificador incorreto", () => {
  assert.equal(cpfValido("52998224726"), false);
});

test("cpfValido rejeita tamanho incorreto", () => {
  assert.equal(cpfValido("123"), false);
});
