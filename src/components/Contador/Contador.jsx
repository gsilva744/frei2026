import { useEffect, useState } from "react";
import "./contador.css";

const dataDaFeira = new Date("2026-09-19T10:00:00");
const tempoZerado = { dias: 0, horas: 0, minutos: 0, segundos: 0 };

function calcularTempoRestante() {
  const diferenca = dataDaFeira.getTime() - Date.now();
  if (diferenca <= 0) {
    return tempoZerado;
  }
  const segundosTotais = Math.floor(diferenca / 1000);
  return {
    dias: Math.floor(segundosTotais / 86400),
    horas: Math.floor((segundosTotais % 86400) / 3600),
    minutos: Math.floor((segundosTotais % 3600) / 60),
    segundos: segundosTotais % 60,
  };
}

/* Comeca zerado para o servidor e o navegador mostrarem o mesmo HTML */
function Contador() {
  const [tempo, setTempo] = useState(tempoZerado);

  useEffect(() => {
    setTempo(calcularTempoRestante());
    const intervalo = setInterval(() => setTempo(calcularTempoRestante()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  const itens = [
    { rotulo: "Dias", valor: tempo.dias },
    { rotulo: "Horas", valor: tempo.horas },
    { rotulo: "Min", valor: tempo.minutos },
    { rotulo: "Seg", valor: tempo.segundos },
  ];

  return (
    <div className="contador-card">
      <h3>⏰ Data e Hora Feira 2026</h3>
      <p>Horário: 09h às 18h · Dia: 19/09</p>
      <div className="contador-valores">
        {itens.map((item) => (
          <div className="contador-item" key={item.rotulo}>
            <span className="contador-numero">{String(item.valor).padStart(2, "0")}</span>
            <span className="contador-rotulo">{item.rotulo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Contador;
