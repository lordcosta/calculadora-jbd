
function calcular() {
  const tipo = document.getElementById('tipo').value;
  const metragem = parseFloat(document.getElementById('metragem').value);
  const formaPagamento = document.getElementById('formaPagamento').value;
  const resultadoDiv = document.getElementById('resultado');

  fetch('tabelas.json')
    .then(response => response.json())
    .then(tabelas => {
      const tabela = tabelas[tipo];
      if (!tabela) {
        resultadoDiv.innerHTML = "Tipo de imóvel não encontrado.";
        return;
      }

      let valorFinal = 0;
      let qtdParcelas = 1;
      let mensagem = "";

      if (metragem <= 400) {
        valorFinal = tabela.valor_fixo;
        mensagem = `<i>Valor fixo (até 400 m²): R$ ${valorFinal.toFixed(2)}</i>`;
      } else {
        const valor_m2 = tabela.valor_m2;
        valorFinal = metragem * valor_m2;
        mensagem = `<i>Valor por m² (acima de 400 m²): R$ ${valor_m2.toFixed(2)}</i>`;
      }

      if (formaPagamento === "Parcelado em até 6x") {
        qtdParcelas = 6;
      } else if (formaPagamento === "Parcelado em até 12x") {
        qtdParcelas = 12;
      }

      const valorParcela = valorFinal / qtdParcelas;

      resultadoDiv.innerHTML = `
        Quantidade de Parcelas: ${qtdParcelas}<br>
        Valor da Parcela: R$ ${valorParcela.toFixed(2)}<br>
        Valor Final Calculado: R$ ${valorFinal.toFixed(2)}<br><br>
        ${mensagem}
      `;
    })
    .catch(() => {
      resultadoDiv.innerHTML = "Não foi possível calcular com os dados informados.";
    });
}

function limparCampos() {
  document.getElementById('tipo').selectedIndex = 0;
  document.getElementById('metragem').value = '';
  document.getElementById('formaPagamento').selectedIndex = 0;
  document.getElementById('resultado').innerHTML = '';
}
