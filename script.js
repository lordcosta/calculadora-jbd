function calcular() {
    const tipo = document.getElementById("tipo").value;
    const metragem = parseFloat(document.getElementById("metragem").value);
    const pagamento = document.getElementById("pagamento").value;

    const resultadoDiv = document.getElementById("resultado");

    if (!tipo || !metragem || !pagamento) {
        resultadoDiv.innerHTML = "<p>Preencha todos os campos para calcular.</p>";
        return;
    }

    let valorFixo = 0;
    let valorExcedente = 0;
    let faixa = null;

    const tabelaFixa = {
        "Residencial": {
            "À vista": 2100,
            "6x": 2400,
            "12x": 2760,
            "20x": 3100,
            "Pagamento Final": 3100
        },
        "Não Residencial": {
            "À vista": 3000,
            "6x": 3600,
            "12x": 4200,
            "20x": 5000,
            "Pagamento Final": 5000
        }
    };

    const tabelaExcedente = {
        "Residencial": {
            "À vista": [
                { min: 401, max: 1500, valor: 0.67 },
                { min: 1501, max: 2500, valor: 0.6 },
                { min: 2501, max: 3500, valor: 0.52 }
            ]
        }
    };

    if (metragem <= 400) {
        valorFixo = tabelaFixa[tipo][pagamento];
        resultadoDiv.innerHTML = `
        <p>Quantidade de Parcelas: 1</p>
        <p>Valor da Parcela: R$ ${valorFixo.toFixed(2)}</p>
        <p>Valor Final Calculado: R$ ${valorFixo.toFixed(2)}</p>
        <p><i>Valor fixo (até 400 m²): R$ ${valorFixo.toFixed(2)}</i></p>
        `;
        return;
    }

    const faixas = tabelaExcedente[tipo]?.[pagamento] || [];
    for (let f of faixas) {
        if (metragem >= f.min && metragem <= f.max) {
            faixa = f;
            break;
        }
    }

    if (!faixa) {
        resultadoDiv.innerHTML = `
        <p>Quantidade de Parcelas: 1</p>
        <p>Valor da Parcela: R$ 0.00</p>
        <p>Valor Final Calculado: R$ 0.00</p>
        <p><i>Não foi possível calcular com os dados informados.</i></p>
        `;
        return;
    }

    valorFixo = tabelaFixa[tipo][pagamento];
    valorExcedente = (metragem - 400) * faixa.valor;
    const valorFinal = valorFixo + valorExcedente;

    resultadoDiv.innerHTML = `
    <p>Quantidade de Parcelas: 1</p>
    <p>Valor da Parcela: R$ ${valorFinal.toFixed(2)}</p>
    <p>Valor Final Calculado: R$ ${valorFinal.toFixed(2)}</p>
    <p><i>Valor fixo (até 400 m²): R$ ${valorFixo.toFixed(2)}</i><br>
    Excedente (${metragem - 400} m² × R$ ${faixa.valor.toFixed(2)}): R$ ${valorExcedente.toFixed(2)}</p>
    `;
}

function limpar() {
    document.getElementById("tipo").value = "Residencial";
    document.getElementById("metragem").value = "";
    document.getElementById("pagamento").value = "À vista";
    document.getElementById("resultado").innerHTML = "";
}