document.addEventListener("DOMContentLoaded", () => {
    const tipoSelect = document.getElementById("tipo");
    const pagamentoSelect = document.getElementById("pagamento");
    const metragemInput = document.getElementById("metragem");
    const resultadoDiv = document.getElementById("resultado");

    let dados = {};
    fetch("tabelas.json")
        .then(res => res.json())
        .then(json => {
            dados = json;
            dados.tiposUnicos.forEach(tipo => {
                const opt = document.createElement("option");
                opt.value = tipo;
                opt.textContent = tipo;
                tipoSelect.appendChild(opt);
            });
            dados.pagamentosUnicos.forEach(pag => {
                const opt = document.createElement("option");
                opt.value = pag;
                opt.textContent = pag;
                pagamentoSelect.appendChild(opt);
            });
        });

    document.getElementById("calcForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const tipo = tipoSelect.value;
        const metragem = parseFloat(metragemInput.value);
        const pagamento = pagamentoSelect.value;

        if (!tipo || !metragem || !pagamento) {
            resultadoDiv.innerHTML = "<strong>Preencha todos os campos.</strong>";
            return;
        }

        let valorFinal = 0;
        let parcelas = 1;
        let demonstrativo = "";

        if (metragem <= 400) {
            const linha = dados.valoresFixos.find(v =>
                v.Tipo === tipo && v.Pagamento === pagamento);
            if (linha) {
                valorFinal = linha.Valor;
                demonstrativo += `Valor fixo (até 400 m²): R$ ${valorFinal.toFixed(2)}`;
            }
        } else {
            const base = dados.valoresFixos.find(v => v.Tipo === tipo && v.Pagamento === pagamento);
            const excedente = metragem - 400;
            const faixa = dados.valoresExcedente.find(f =>
                f.Tipo === tipo &&
                f.Pagamento === pagamento &&
                excedente >= f.FaixaMin &&
                excedente <= f.FaixaMax);
            if (base && faixa) {
                const valorExcedente = excedente * faixa.ValorM2;
                valorFinal = base.Valor + valorExcedente;
                demonstrativo = `
                    Valor base (400 m²): R$ ${base.Valor.toFixed(2)}<br>
                    Excedente: ${excedente} m² × R$ ${faixa.ValorM2.toFixed(2)} = R$ ${valorExcedente.toFixed(2)}<br>
                    <strong>Total: R$ ${valorFinal.toFixed(2)}</strong>
                `;
            } else {
                demonstrativo = "Não foi possível calcular com os dados informados.";
            }
        }

        if (pagamento.includes("x")) parcelas = parseInt(pagamento.replace("x", ""));
        resultadoDiv.innerHTML = `
            Quantidade de Parcelas: ${parcelas}<br>
            Valor da Parcela: R$ ${(valorFinal / parcelas).toFixed(2)}<br>
            Valor Final Calculado: R$ ${valorFinal.toFixed(2)}<br><br>
            <em>${demonstrativo}</em>
        `;
    });
});


// Função para limpar campos e resultado
document.getElementById("limparBtn").addEventListener("click", () => {
    document.getElementById("tipo").selectedIndex = 0;
    document.getElementById("pagamento").selectedIndex = 0;
    document.getElementById("metragem").value = "";
    document.getElementById("resultado").innerHTML = "";
});
