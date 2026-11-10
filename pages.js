// Dados de fallback (caso a API não tenha o endpoint /produto ou esteja offline)
const PRODUTOS_FALLBACK = [
    { id: 1, nome: "Ração Premium para Gatos Adultos", categoria: "Alimentação", preco: 89.90, estoque: 50 },
    { id: 2, nome: "Sachê de Atum para Gatos", categoria: "Alimentação", preco: 4.50, estoque: 200 },
    { id: 3, nome: "Arranhador de Sisal em Torre", categoria: "Móveis", preco: 149.90, estoque: 15 },
    { id: 4, nome: "Areia Sanitária com Sílica", categoria: "Higiene", preco: 39.90, estoque: 80 },
    { id: 5, nome: "Caixa de Transporte Pequena", categoria: "Acessórios", preco: 79.90, estoque: 30 },
    { id: 6, nome: "Brinquedo Ratão de Pelúcia", categoria: "Brinquedos", preco: 19.90, estoque: 120 },
    { id: 7, nome: "Cama Redonda Acolchoada", categoria: "Conforto", preco: 99.90, estoque: 25 },
    { id: 8, nome: "Coleira com Guizo Reflectiva", categoria: "Acessórios", preco: 24.90, estoque: 60 },
    { id: 9, nome: "Escova Removedora de Pelos", categoria: "Higiene", preco: 34.90, estoque: 45 },
    { id: 10, nome: "Petiscos de Frango Crocante", categoria: "Alimentação", preco: 15.90, estoque: 150 }
];

// Mapeamento de imagens temáticas (usando emojis como placeholder visual)
const EMOJIS_PRODUTOS = {
    1: "🍖",  // Ração
    2: "🐟",  // Sachê de atum
    3: "🏰",  // Arranhador
    4: "🪣",  // Areia
    5: "📦",  // Caixa de transporte
    6: "🐭",  // Ratão de pelúcia
    7: "🛏️",  // Cama
    8: "🔔",  // Coleira
    9: "🧹",  // Escova
    10: "🍗"  // Petiscos
};

// Cores por categoria para as tags
const CORES_CATEGORIA = {
    "Alimentação": "#f59e0b",
    "Móveis": "#8b5cf6",
    "Higiene": "#06b6d4",
    "Acessórios": "#ec4899",
    "Brinquedos": "#10b981",
    "Conforto": "#6366f1"
};

function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function criarCard(produto) {
    const categoria = produto.categoria || "Geral";
    const corCategoria = CORES_CATEGORIA[categoria] || "#6366f1";
    const emoji = EMOJIS_PRODUTOS[produto.id] || "🐾";
    const estoqueBaixo = produto.estoque < 20;

    return `
        <div class="card" data-categoria="${categoria}">
            <div class="card-img-wrapper" style="position: relative; text-align: center; padding: 10px 0;">
                <span style="font-size: 4.5rem; line-height: 1;">${emoji}</span>
                <span class="badge-categoria" style="
                    position: absolute; top: 0; right: 0;
                    background: ${corCategoria}; color: white;
                    padding: 4px 10px; border-radius: 20px;
                    font-size: 0.7rem; font-weight: 600;
                ">${categoria}</span>
            </div>
            <h3 class="nome-produto">${produto.nome}</h3>
            <div class="info">
                <span class="descricao" style="color: ${estoqueBaixo ? '#dc2626' : 'var(--text-muted)'}; font-size: 0.85rem;">
                    ${estoqueBaixo ? '⚠️ Últimas unidades' : '✅ Em estoque'} (${produto.estoque} un.)
                </span>
                <span class="preco">${formatarPreco(produto.preco)}</span>
            </div>
            <button class="btn_enviar btn-adicionar" onclick="adicionarCarrinho(${produto.id}, '${produto.nome.replace(/'/g, "\\'")}')" style="margin-top: auto;">
                🛒 Adicionar ao Carrinho
            </button>
        </div>
    `;
}

function renderizarProdutos(produtos) {
    const grid = document.getElementById("grid-produtos");
    const contador = document.getElementById("contador-produtos");
    const loading = document.getElementById("loading");
    
    if (!grid) return;

    loading.style.display = "none";
    contador.textContent = `${produtos.length} itens`;

    if (produtos.length === 0) {
        grid.innerHTML = `<p class="text-center" style="grid-column: 1 / -1; color: var(--text-muted);">Nenhum produto encontrado.</p>`;
        return;
    }

    grid.innerHTML = produtos.map(criarCard).join("");
}

function adicionarCarrinho(id, nome) {
    // Armazena no localStorage para o carrinho.html ler depois
    let carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");
    const itemExistente = carrinho.find(item => item.id === id);
    
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({ id, nome, quantidade: 1 });
    }
    
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    mostrarToast(`✅ "${nome}" adicionado ao carrinho!`, "bg-success");
}

async function carregarProdutos() {
    try {
        const resposta = await fetch("http://localhost:3000/produto");
        if (!resposta.ok) throw new Error("API indisponível");
        
        let produtos = await resposta.json();
        
        // Se a API não retornar categoria/estoque, mescla com o fallback
        produtos = produtos.map(p => {
            const fallback = PRODUTOS_FALLBACK.find(f => f.id === p.id);
            return {
                id: p.id,
                nome: p.nome,
                categoria: p.categoria || (fallback ? fallback.categoria : "Geral"),
                preco: p.preco,
                estoque: p.estoque ?? (fallback ? fallback.estoque : 0)
            };
        });

        renderizarProdutos(produtos);
    } catch (error) {
        console.warn("Erro ao buscar produtos da API:", error);
        document.getElementById("erro-api").style.display = "block";
        renderizarProdutos(PRODUTOS_FALLBACK);
    }
}

// Inicializa quando a página carregar
document.addEventListener("DOMContentLoaded", carregarProdutos);