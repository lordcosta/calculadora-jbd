
async function carregarTabela() {
    const resposta = await fetch('tabelas.json');
    return await resposta.json();
}

function limpar() {
    document.getElementById("tipo").selectedIndex = 0;
    document.getElementById("metragem").value = "";
    document.getElementById("pagamento").selectedIndex = 0;
    document.getElementById("resultado").innerHTML = "";
}

async function calcular() {
    const tipo = document.getElementById("tipo").value;
    const metragem = parseFloat(document.getElementById("metragem").value);
    const pagamento = document.getElementById("pagamento").value;

    const resultadoDiv = document.getElementById("resultado");
    const tabelas = await carregarTabela();

    if (!tabelas[tipo] || !metragem || !pagamento) {
        resultadoDiv.innerHTML = "<p>Não foi possível calcular com os dados informados.</p>";
        return;
    }

    const tabela = tabelas[tipo][pagamento];
    let valorFinal = 0;

    if (metragem <= 400) {
        valorFinal = tabela.valor_fixo;
        resultadoDiv.innerHTML = `
            <p>Quantidade de Parcelas: ${tabela.parcelas}</p>
            <p>Valor da Parcela: R$ ${valorFinal.toFixed(2)}</p>
            <p>Valor Final Calculado: R$ ${valorFinal.toFixed(2)}</p>
            <p><em>Valor fixo (até 400 m²): R$ ${tabela.valor_fixo.toFixed(2)}</em></p>
        `;
    } else {
        const excedente = metragem - 400;
        valorFinal = tabela.valor_fixo + (excedente * tabela.valor_m2);
        resultadoDiv.innerHTML = `
            <p>Quantidade de Parcelas: ${tabela.parcelas}</p>
            <p>Valor da Parcela: R$ ${valorFinal.toFixed(2)}</p>
            <p>Valor Final Calculado: R$ ${valorFinal.toFixed(2)}</p>
            <p><em>Valor por m² (acima de 400 m²): R$ ${tabela.valor_m2.toFixed(2)}</em></p>
        `;
    }
}
