let despesasPorMes = {};
    let receitaPorMes = {};
    const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

    const ctx = document.getElementById('grafico').getContext('2d');
    const grafico = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [{
          label: 'Despesas por Mês (€)',
          data: Array(12).fill(0),
          backgroundColor: '#273c75'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    function adicionarDespesa() {
      const mes = document.getElementById('mes').value;
      const receitaInput = parseFloat(document.getElementById('receita').value);
      const descricao = document.getElementById('descricao').value;
      const valor = parseFloat(document.getElementById('valor').value);

      if (isNaN(receitaInput) || receitaInput <= 0) {
        alert("Informe o valor recebido no mês.");
        return;
      }

      if (!descricao || isNaN(valor) || valor <= 0) {
        alert("Preencha a descrição e valor da despesa corretamente.");
        return;
      }

      receitaPorMes[mes] = receitaInput;

      if (!despesasPorMes[mes]) despesasPorMes[mes] = [];
      despesasPorMes[mes].push({ descricao, valor });

      atualizarLista();
      atualizarTotal();
      atualizarGrafico();
      
      document.getElementById('descricao').value = '';
      document.getElementById('valor').value = '';
    }

    function atualizarLista() {
      const lista = document.getElementById('lista-despesas');
      lista.innerHTML = '';
      const mes = document.getElementById('mes').value;
      if (!despesasPorMes[mes]) return;

      despesasPorMes[mes].forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${item.descricao} - € ${item.valor.toFixed(2)}
          <button onclick="removerDespesa('${mes}', ${index})" style="background:red;color:white;border:none;padding:5px;">X</button>`;
        lista.appendChild(li);
      });
    }

    function atualizarTotal() {
      const mes = document.getElementById('mes').value;
      const total = despesasPorMes[mes]?.reduce((acc, cur) => acc + cur.valor, 0) || 0;
      const receita = receitaPorMes[mes] || 0;
      const saldo = receita - total;

      document.getElementById('total').textContent = total.toFixed(2);
      document.getElementById('saldo').textContent = saldo.toFixed(2);
    }

    function removerDespesa(mes, index) {
      despesasPorMes[mes].splice(index, 1);
      atualizarLista();
      atualizarTotal();
      atualizarGrafico();
    }

    function atualizarGrafico() {
      const totais = meses.map(mes =>
        despesasPorMes[mes]?.reduce((acc, cur) => acc + cur.valor, 0) || 0
      );
      grafico.data.datasets[0].data = totais;
      grafico.update();
    }

    document.getElementById('mes').addEventListener('change', () => {
      const mes = document.getElementById('mes').value;
      document.getElementById('receita').value = receitaPorMes[mes] || '';
      atualizarLista();
      atualizarTotal();
    });

    function exportarExcel() {
      let csv = "Mês,Receita,Descrição da Despesa,Valor da Despesa\n";
      for (const mes of meses) {
        const receita = receitaPorMes[mes] || 0;
        const despesas = despesasPorMes[mes] || [];
        if (despesas.length === 0) {
          csv += `${mes},${receita.toFixed(2)},,\n`;
        } else {
          despesas.forEach(item => {
            csv += `${mes},${receita.toFixed(2)},${item.descricao},${item.valor.toFixed(2)}\n`;
          });
        }
      }

      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'controle_despesas.csv';
      link.click();
    }