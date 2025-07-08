let tabelas = {};

fetch('tabelas.json')
  .then(response => response.json())
  .then(data => { tabelas = data; });

function calcular() {
  const tipo = document.getElementById("tipo").value;
  const metragem = parseFloat(document.getElementById("metragem").value);
  const pagamento = document.getElementById("pagamento").value;
  const resultado = document.getElementById("resultado");

  if (isNaN(metragem) || metragem <= 0) {
    resultado.innerHTML = "Informe uma metragem válida.";
    return;
  }

  let valorFinal = 0;
  let parcelas = 1;
  let valorParcela = 0;
  let descricao = "";

  if (metragem <= 400) {
    const item = tabelas.fixos.find(v =>
      v.tipo === tipo && v.pagamento === pagamento
    );
    if (item) {
      valorFinal = item.valor;
      valorParcela = item.valor;
      descricao = `Valor fixo (até 400 m²): R$ ${item.valor.toFixed(2)}`;
    }
  } else {
    const item = tabelas.excedente.find(v =>
      v.tipo === tipo &&
      v.pagamento === pagamento &&
      metragem >= v.faixa_min &&
      metragem <= v.faixa_max
    );
    if (item) {
      const metrosExcedentes = metragem - 400;
      valorFinal = metrosExcedentes * item.valor_m2;
      valorParcela = valorFinal;
      descricao = `Valor excedente (${metrosExcedentes} m² × R$ ${item.valor_m2.toFixed(2)}/m²)`;
    }
  }

  if (valorFinal > 0) {
    if (pagamento.includes("x")) {
      parcelas = parseInt(pagamento);
      valorParcela = valorFinal / parcelas;
    }
    resultado.innerHTML = `
      Quantidade de Parcelas: ${parcelas}<br/>
      Valor da Parcela: R$ ${valorParcela.toFixed(2)}<br/>
      Valor Final Calculado: R$ ${valorFinal.toFixed(2)}<br/><br/>
      <i>${descricao}</i>
    `;
  } else {
    resultado.innerHTML = "Não foi possível calcular com os dados informados.";
  }
}

function limpar() {
  document.getElementById("tipo").value = "Residencial";
  document.getElementById("metragem").value = "";
  document.getElementById("pagamento").value = "À vista";
  document.getElementById("resultado").innerHTML = "";
}