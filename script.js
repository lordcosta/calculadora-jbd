
let tabelas = {};

async function carregarTabela() {
  const resposta = await fetch('tabelas.json');
  tabelas = await resposta.json();
  atualizarPagamentos();
}

function atualizarPagamentos() {
  const tipo = document.getElementById("tipo").value;
  const pagamentoSelect = document.getElementById("pagamento");
  pagamentoSelect.innerHTML = "";

  if (!tabelas[tipo]) return;

  const opcoes = new Set(Object.keys(tabelas[tipo].ate_400));
  for (const faixa of tabelas[tipo].acima_400) {
    Object.keys(faixa.valores).forEach(p => opcoes.add(p));
  }

  [...opcoes].forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.text = p;
    pagamentoSelect.appendChild(opt);
  });
}

function limpar() {
  document.getElementById("tipo").value = "residencial";
  document.getElementById("metragem").value = "";
  atualizarPagamentos();
  document.getElementById("resultado").innerHTML = "";
}

function calcular() {
  const tipo = document.getElementById("tipo").value;
  const metragem = parseFloat(document.getElementById("metragem").value);
  const pagamento = document.getElementById("pagamento").value;
  const res = document.getElementById("resultado");

  if (!tabelas[tipo] || isNaN(metragem) || metragem <= 0 || !pagamento) {
    res.innerHTML = "<p>Não foi possível calcular com os dados informados.</p>";
    return;
  }

  let total = 0;
  let parcelas = 1;
  let demonstrativo = `Tipo: ${tipo === "residencial" ? "Residencial" : "Não Residencial"} | Metragem: ${metragem} m² | Forma: ${pagamento}<br/>`;

  if (metragem <= 400) {
    const dados = tabelas[tipo].ate_400[pagamento];
    if (!dados) {
      res.innerHTML = "<p>Não foi possível calcular com os dados informados.</p>";
      return;
    }
    total = dados.total;
    parcelas = dados.parcelas;
    demonstrativo += `Valor fixo (até 400 m²): R$ ${total.toFixed(2)}`;
  } else {
    const base = tabelas[tipo].ate_400[pagamento];
    const excedente = metragem - 400;
    let valor_m2 = null;

    for (const faixa of tabelas[tipo].acima_400) {
      if (metragem >= faixa.min && metragem <= faixa.max) {
        valor_m2 = faixa.valores[pagamento];
        break;
      }
    }

    if (!base || valor_m2 === null) {
      res.innerHTML = "<p>Não foi possível calcular com os dados informados.</p>";
      return;
    }

    total = base.total + (excedente * valor_m2);
    parcelas = base.parcelas;
    demonstrativo += `
      Valor base (400 m²): R$ ${base.total.toFixed(2)}<br/>
      Excedente: ${excedente} m² × R$ ${valor_m2.toFixed(2)} = R$ ${(excedente * valor_m2).toFixed(2)}<br/>
      Valor final: R$ ${total.toFixed(2)}`;
  }

  const valorParcela = total / parcelas;
  res.innerHTML = `
    <p>Quantidade de Parcelas: ${parcelas}</p>
    <p>Valor da Parcela: R$ ${valorParcela.toFixed(2)}</p>
    <p>Valor Final Calculado: R$ ${total.toFixed(2)}</p>
    <br/>
    <em>${demonstrativo}</em>
  `;
}

window.onload = carregarTabela;
