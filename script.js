let dadosMunicipio = {};

document.getElementById('municipio').addEventListener('change', function () {
    const municipio = this.value;
    if (!municipio) return;

    fetch(`data/${municipio}.json`)
        .then(res => res.json())
        .then(data => {
            dadosMunicipio = data;
            const formas = data.formas_pagamento;
            const selectForma = document.getElementById('forma_pagamento');
            selectForma.innerHTML = '';
            formas.forEach(forma => {
                const opt = document.createElement('option');
                opt.value = forma.nome;
                opt.textContent = forma.nome;
                selectForma.appendChild(opt);
            });
        });
});

function calcular() {
    const tipo = document.getElementById('tipo').value;
    const metragem = parseFloat(document.getElementById('metragem').value);
    const formaNome = document.getElementById('forma_pagamento').value;

    if (!dadosMunicipio || !tipo || !formaNome || !metragem) return;

    const faixa = dadosMunicipio.faixas.find(f => f.tipo === tipo);
    const forma = dadosMunicipio.formas_pagamento.find(f => f.nome === formaNome);

    let valorTotal = 0;
    let valorBase = 0;
    let excedente = 0;

    if (metragem <= faixa.limite) {
        valorTotal = faixa.valor_fixo;
    } else {
        valorBase = faixa.valor_fixo;
        excedente = (metragem - faixa.limite) * faixa.valor_m2_excedente;
        valorTotal = valorBase + excedente;
    }

    const valorParcela = valorTotal / forma.parcelas;

    document.getElementById('demonstrativo').innerHTML = `
        Tipo: ${tipo}<br>
        Metragem: ${metragem} m²<br>
        Forma de Pagamento: ${forma.nome}<br>
        Valor Base: R$ ${valorBase.toFixed(2)}<br>
        Excedente: R$ ${excedente.toFixed(2)}<br>
        Total: R$ ${valorTotal.toFixed(2)}<br>
        Parcelas: ${forma.parcelas} x R$ ${valorParcela.toFixed(2)}
    `;
}
