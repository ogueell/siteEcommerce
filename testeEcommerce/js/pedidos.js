const chavePedidos = "loja-virtual-pedidos";
const listaPedidosElement = document.getElementById("lista-pedidos");
const pedidosVaziosElement = document.getElementById("pedidos-vazios");
const anoAtualElement = document.getElementById("ano-atual");
const formatterMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const formatterData = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function carregarPedidos() {
  try {
    const pedidosSalvos = JSON.parse(localStorage.getItem(chavePedidos) || "[]");
    return Array.isArray(pedidosSalvos) ? pedidosSalvos : [];
  } catch (erro) {
    console.error("Não foi possível carregar os pedidos.", erro);
    return [];
  }
}

function criarItemPedido(produto) {
  const item = document.createElement("li");
  item.className = "pedido-produto";
  item.innerHTML = `
    <span class="pedido-produto-emoji" aria-hidden="true">${produto.imagem || "📦"}</span>
    <span>
      <strong>${produto.nome}</strong>
      <small>${produto.quantidade} x ${formatterMoeda.format(produto.preco)}</small>
    </span>
    <strong>${formatterMoeda.format(produto.subtotal)}</strong>
  `;
  return item;
}

function criarCardPedido(pedido) {
  const card = document.createElement("article");
  card.className = "pedido-card";
  const produtos = Array.isArray(pedido.produtos) ? pedido.produtos : [];
  const dataPedido = new Date(pedido.data);
  const dataFormatada = Number.isNaN(dataPedido.getTime())
    ? "Data não disponível"
    : formatterData.format(dataPedido);

  card.innerHTML = `
    <div class="pedido-cabecalho">
      <div>
        <p class="pedido-label">Pedido</p>
        <h3>${pedido.numeroPedido || "Número não disponível"}</h3>
      </div>
      <span class="pedido-status">${pedido.status || "Recebido"}</span>
    </div>
    <p class="pedido-data">Realizado em ${dataFormatada}</p>
    <ul class="pedido-produtos"></ul>
    <div class="pedido-total">
      <span>Total do pedido</span>
      <strong>${formatterMoeda.format(Number(pedido.total) || 0)}</strong>
    </div>
  `;

  const listaProdutos = card.querySelector(".pedido-produtos");
  produtos.forEach((produto) => listaProdutos.appendChild(criarItemPedido(produto)));
  return card;
}

function renderizarPedidos() {
  const pedidos = carregarPedidos();
  listaPedidosElement.innerHTML = "";
  pedidosVaziosElement.hidden = pedidos.length > 0;

  pedidos.forEach((pedido) => {
    listaPedidosElement.appendChild(criarCardPedido(pedido));
  });
}

anoAtualElement.textContent = new Date().getFullYear();
renderizarPedidos();
