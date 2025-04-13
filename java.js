/*
  --------------------------------------------------------------------------------------
  Função para obter a lista existente do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
const getList = async () => {
  const table = document.getElementById('tbody');
  // Limpa a tabela antes de adicionar novos dados
  table.innerHTML = '';
  let url = 'http://127.0.0.1:5000/operacoes';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.operacoes.forEach(operacao => insertList(operacao.id, operacao.sigla_acao, operacao.quantidade, operacao.valor, operacao.tp_operacao));
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Chamada da função para carregamento inicial dos dados
  --------------------------------------------------------------------------------------
*/
getList()


/*
  --------------------------------------------------------------------------------------
  Função para colocar uma operação na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const postItem = async (inputSigla, inputQtd, inputValor, inputTp_operacao) => {
  const formData = new FormData();
  formData.append('sigla_acao', inputSigla);
  formData.append('quantidade', inputQtd);
  formData.append('valor', inputValor);
  formData.append('tp_operacao', inputTp_operacao);

  let url = 'http://127.0.0.1:5000/operacao';
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Função para criar um botão close para cada operação da lista
  --------------------------------------------------------------------------------------
*/
const insertButton = (parent) => {
  let span = document.createElement("span");
  let txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  parent.appendChild(span);
}


/*
  --------------------------------------------------------------------------------------
  Função para remover um item da lista de acordo com o click no botão close
  --------------------------------------------------------------------------------------
*/
const removeElement = () => {
  let close = document.getElementsByClassName("close");
  // var table = document.getElementById('myTable');
  let i;
  for (i = 0; i < close.length; i++) {
    close[i].onclick = function () {
      let div = this.parentElement.parentElement;
      const id_operacao = div.getElementsByTagName('td')[0].innerHTML
      if (confirm("Você tem certeza?")) {
        div.remove()
        deleteItem(id_operacao)
        alert("Removido!" + id_operacao)
      }
    }
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para deletar uma operação da lista do servidor via requisição DELETE
  --------------------------------------------------------------------------------------
*/
const deleteItem = (operacao) => {
  console.log(operacao)
  let url = 'http://127.0.0.1:5000/operacao?id=' + operacao;
  fetch(url, {
    method: 'delete'
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo item com nome, quantidade e valor 
  --------------------------------------------------------------------------------------
*/
const newItem = async () => {
  let inputSigla = document.getElementById("inputSigla").value;
  let inputQtd = document.getElementById("inputQtd").value;
  let inputValor = document.getElementById("inputValor").value;
  let inputTp_operacao = document.getElementById("inputTp_operacao").value;
  
  if (inputSigla === '') {
    alert("Selecione uma ação!");
  }else if (inputTp_operacao != 'Compra' && inputTp_operacao != 'Venda') {
    alert("Tipo de operação inválido! Use 'Compra' ou 'Venda'.");
  } else if (isNaN(inputQtd) || isNaN(inputValor) || inputQtd <= 0 || inputValor <= 0) {
    alert("Quantidade e valor precisam ser números!");
  } else {

    await postItem(inputSigla, inputQtd, inputValor, inputTp_operacao)
    await getList()
    alert("Item adicionado!")
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para inserir items na lista apresentada
  --------------------------------------------------------------------------------------
*/
const insertList = ( id, sigla, qtd, valor, tp_operacao) => {
  var ordem = [id, sigla, qtd, valor, tp_operacao];
  var table = document.getElementById('tbody');
  var row = table.insertRow();

  for (var i = 0; i < ordem.length; i++) {
    var cel = row.insertCell(i);
    cel.textContent = ordem[i];
  }
  insertButton(row.insertCell(-1))
  document.getElementById("inputSigla").value = "";
  document.getElementById("inputQtd").value = "";
  document.getElementById("inputValor").value = "";
  document.getElementById("inputTp_operacao").value = "";
  
  removeElement()
}



/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  Validação do formulário de pesquisa de ações
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

// Ticker da ação cujos dados quer consultar
var symbol = 'PETR4';

function validar() {
  var aux = document.getElementById('txtSymbol').value;
  symbol = aux;

  if (aux === undefined || aux == null || aux.length < 5) {
    document.getElementById('error').style.display = 'block';
    document.getElementById('error').innerHTML = 'Código de ação inválido!';
    document.getElementById('txtSymbol').focus();
  }
  else {
    document.getElementById('error').style.display = 'none';
    lineChartData = [['', 0, 0]];
    symbol = aux;
    urlDaily = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}.SA&interval=5min&apikey=${apiKey}`;
    // Solicitando os dados para a API
    requestData(urlDaily);
  }
}


/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  Programação do uso da API AlphaVantage
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

// Sua chave para acesso à API
var apiKey = '01RPANWO626ZX44C';

// URL para solicitar dados de cotação diária de uma ação
var urlDaily =
  `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}.SA&interval=5min&apikey=${apiKey}`;

// Variáveis globais para receber os dados utilizados pelos gráficos
var barChartData;
var lineChartData = [[, ,]];

// Função para requisitar os ddos da API
async function requestData(url) {

  const options = {
    method: 'GET',
    mode: 'cors',
    cache: 'default'
  };

  await fetch(url, options)
    .then(response => {
      response.json()
      .then(data => showData(data))
    })
    .catch(e => showError(e.message))
}

// Função para informar possíveis erros
function showError(msg) {
  document.getElementById('error').style.display = 'block';
  document.getElementById('error').innerHTML = 'Erro: ' + msg;
  document.getElementById('txtSymbol').focus();
}

//	Função para exibição dos dados 
function showData(data) {

  let aux = data['Time Series (Daily)'];
  let rowsCount = 0;
  let maxima = 0;
  let minima = 99999999;
  let media = 0;

  document.getElementById('series-table').tBodies[0].innerHTML = '';

  for (const field in aux) {
    let auxDate = new Date(field);
    let day = ((auxDate.getDate() + 1) < 10) ? ('0' + (auxDate.getDate() + 1)) : (auxDate.getDate() + 1);
    let month = ((auxDate.getMonth() + 1) < 10) ? ('0' + (auxDate.getMonth() + 1)) : (auxDate.getMonth() + 1);
    let year = auxDate.getFullYear();
    let formatDate = day + '/' + month + '/' + year;

    let openValue = parseFloat(aux[field]['1. open']).toFixed(2);
    let closeValue = parseFloat(aux[field]['4. close']).toFixed(2);

    // Adicionando os últimos 4 registros na tabela da página index
    if (rowsCount < 5) {
      addTableContent(formatDate, openValue, closeValue);
    }

    if (maxima < parseFloat(aux[field]['4. close'])) {
      maxima = parseFloat(aux[field]['4. close']);
    }

    if (minima > parseFloat(aux[field]['4. close'])) {
      minima = parseFloat(aux[field]['4. close']);
    }

    media += parseFloat(aux[field]['4. close']);

    lineChartData[rowsCount] = [formatDate,
      parseFloat(aux[field]['1. open']),
      parseFloat(aux[field]['4. close'])
    ];

    //lineChartData.push(auxValues );
    rowsCount++;
  } // for	

  media = media / rowsCount;

  if (minima == 99999999) { minima = 0; }

  // Informando valores para o gráfico de colunas
  barChartData = [['', maxima, media, minima]];
  google.charts.load('current', { packages: ['corechart', 'bar'] });
  google.charts.setOnLoadCallback(drawMultSeries);

  // Informando valores para o gráfico de linhas		
  google.charts.load('current', { packages: ['corechart', 'line'] });
  google.charts.setOnLoadCallback(drawCurveTypes);
}

//	Função para adicionar dados à tabela da página index.html
function addTableContent(date, open, close) {
  var myTable = document.getElementById('series-table').tBodies[0];
  myTable.innerHTML = myTable.innerHTML + `<tr><td>${date}</td><td>${open}</td><td>${close}</td></tr>`;
}


/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  Gráficos Google Charts para os valores recebidos via API
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

// Gráfico de colunas para valores de referência
function drawMultSeries() {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Preço');
  data.addColumn('number', 'Máxima');
  data.addColumn('number', 'Média');
  data.addColumn('number', 'Mínima');

  data.addRows(barChartData);

  var options = {
    title: 'Referências de preço do ativo',
    hAxis: {
      title: 'Referência',
    },
    vAxis: {
      title: 'Valores'
    }
  };

  var chart = new google.visualization.ColumnChart(document.getElementById('chart-column'));
  chart.draw(data, options);
}


// Gráfico de linha para série diária de valores
function drawCurveTypes() {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Data');
  data.addColumn('number', 'Abertura');
  data.addColumn('number', 'Fechamento');

  data.addRows(lineChartData.reverse());

  var options = {
    title: 'Série diária de preço do ativo',
    hAxis: {
      title: 'Data'
    },
    vAxis: {
      title: 'Valores'
    },
    series: {
      1: { curveType: 'function' }
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('chart-line'));
  chart.draw(data, options);
}

