
const SHIPPING_CONFIG = {
  apiUrl: "https://site-wjimports.onrender.com",
  height: 10,
  width: 15,
  length: 20,
  defaultWeight: 0.30
};

const WHATSAPP_NUMBER = "5513996905523";

// ============================================================
// PRODUTOS
// ============================================================

const products = [
  {
    id: 1,
    name: "Perfume Yara",
    category: "Perfumes",
    price: 129.90,
    image: "images/yara.jpg"
  },
  {
    id: 2,
    name: "Perfume Asad",
    category: "Perfumes",
    price: 149.90,
    image: "images/asad.jpg"
  },
  {
    id: 3,
    name: "Perfume Khamrah",
    category: "Perfumes",
    price: 159.90,
    image: "images/khamrah.jpg"
  },
  {
    id: 4,
    name: "Perfume Fakhar",
    category: "Perfumes",
    price: 139.90,
    image: "images/fakhar.jpg"
  },
  {
    id: 13,
    name: "Kit Perfume 01",
    category: "Kits",
    price: 199.90,
    image: "images/kit1.jpg"
  },
  {
    id: 14,
    name: "Kit Perfume 02",
    category: "Kits",
    price: 219.90,
    image: "images/kit2.jpg"
  },
  {
    id: 15,
    name: "Kit Perfume 03",
    category: "Kits",
    price: 229.90,
    image: "images/kit3.jpg"
  },
  {
    id: 16,
    name: "Produto Importado 01",
    category: "Importados",
    price: 99.90,
    image: "images/produto1.jpg"
  },
  {
    id: 17,
    name: "Produto Importado 02",
    category: "Importados",
    price: 109.90,
    image: "images/produto2.jpg"
  },
  {
    id: 18,
    name: "Produto Importado 03",
    category: "Importados",
    price: 119.90,
    image: "images/produto3.jpg"
  },
  {
    id: 19,
    name: "Produto Importado 04",
    category: "Importados",
    price: 129.90,
    image: "images/produto4.jpg"
  },
  {
    id: 20,
    name: "Produto Importado 05",
    category: "Importados",
    price: 139.90,
    image: "images/produto5.jpg"
  },
  {
    id: 21,
    name: "Produto Importado 06",
    category: "Importados",
    price: 149.90,
    image: "images/produto6.jpg"
  },
  {
    id: 22,
    name: "Produto Importado 07",
    category: "Importados",
    price: 159.90,
    image: "images/produto7.jpg"
  },
  {
    id: 23,
    name: "Produto Importado 08",
    category: "Importados",
    price: 169.90,
    image: "images/produto8.jpg"
  }
];

// ============================================================
// ESTADO
// ============================================================

let cart = [];
let currentShippingRates = [];
let selectedShipping = null;
let modalImages = [];
let currentModalImageIndex = 0;

// ============================================================
// UTILITÁRIOS
// ============================================================

function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp")
    .replace(/</g, "&lt")
    .replace(/>/g, "&gt")
    .replace(/"/g, "&quot")
    .replace(/'/g, "&#039");
}

function normalizeCep(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 8);
}

function formatCep(value) {
  const cep = normalizeCep(value);
  if (cep.length <= 5) {
    return cep;
  }
  return cep.slice(0, 5) + "-" + cep.slice(5);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ============================================================
// CATEGORIAS
// ============================================================

function renderCategories() {
  const grid = document.getElementById("categoryGrid");
  const filter = document.getElementById("categoryFilter");
  if (!grid || !filter) return;

  const categories = [...new Set(products.map(product => product.category))];

  grid.innerHTML = "";
  filter.innerHTML = `<option value="Todos">Todas</option>`;

  categories.forEach(category => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-card";
    button.innerHTML = `
      <strong>${escapeHtml(category)}</strong>
      <span>${products.filter(p => p.category === category).length} produtos</span>
    `;
    button.addEventListener("click", () => {
      filter.value = category;
      renderProducts();
      document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth" });
    });
    grid.appendChild(button);

    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    filter.appendChild(option);
  });
}

// ============================================================
// PRODUTOS
// ============================================================

function renderProducts() {
  const grid = document.getElementById("productGrid");
  const search = document.getElementById("search");
  const categoryFilter = document.getElementById("categoryFilter");
  const sort = document.getElementById("sort");
  const resultText = document.getElementById("resultText");

  if (!grid) return;

  const searchValue = search?.value?.trim().toLowerCase() || "";
  const categoryValue = categoryFilter?.value || "Todos";
  const sortValue = sort?.value || "default";

  let filtered = products.filter(product => {
    const matchesSearch =
      !searchValue ||
      product.name.toLowerCase().includes(searchValue) ||
      product.category.toLowerCase().includes(searchValue);
    const matchesCategory =
      categoryValue === "Todos" || product.category === categoryValue;
    return matchesSearch && matchesCategory;
  });

  if (sortValue === "low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortValue === "high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortValue === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }

  grid.innerHTML = "";

  filtered.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image-wrap" onclick="openProductImage(${product.id})">
        <img class="product-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.style.display='none'">
      </div>
      <div class="product-info">
        <small>${escapeHtml(product.category)}</small>
        <h3>${escapeHtml(product.name)}</h3>
        <strong class="product-price">${formatMoney(product.price)}</strong>
        <button class="btn primary full" type="button" onclick="addToCart(${product.id})">
          Adicionar ao carrinho
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  if (resultText) {
    resultText.textContent =
      filtered.length === 1
        ? "1 produto encontrado."
        : `${filtered.length} produtos encontrados.`;
  }
}

// ============================================================
// CARRINHO
// ============================================================

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCart();
  showToast("Produto adicionado ao carrinho.");
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCart();
}

function changeCartQuantity(productId, change) {
  const item = cart.find(product => product.id === productId);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  updateCart();
}

function getCartSubtotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function updateCart() {
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  const quantity = cart.reduce((total, item) => total + item.quantity, 0);

  if (cartCount) {
    cartCount.textContent = quantity;
  }

  if (cartTotal) {
    cartTotal.textContent = formatMoney(getCartSubtotal());
  }

  if (!cartItems) return;

  if (!cart.length) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <p>Seu carrinho está vazio.</p>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = cart
    .map(
      item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${formatMoney(item.price)}</span>
      </div>
      <div class="cart-item-actions">
        <button type="button" onclick="changeCartQuantity(${item.id}, -1)">−</button>
        <span>${item.quantity}</span>
        <button type="button" onclick="changeCartQuantity(${item.id}, 1)">+</button>
        <button type="button" onclick="removeFromCart(${item.id})" aria-label="Remover produto">×</button>
      </div>
    </div>
  `
    )
    .join("");
}

function openCart() {
  const modal = document.getElementById("cartModal");
  if (!modal) return;
  modal.classList.add("open");
  updateCart();
}

function closeCart() {
  const modal = document.getElementById("cartModal");
  if (!modal) return;
  modal.classList.remove("open");
}

// ============================================================
// IMAGENS
// ============================================================

function openProductImage(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;

  modalImages = [product.image];
  currentModalImageIndex = 0;

  const modal = document.getElementById("imageModal");
  const image = document.getElementById("modalImage");
  const counter = document.getElementById("modalImageCounter");

  if (!modal || !image) return;

  image.src = product.image;
  image.alt = product.name;

  if (counter) {
    counter.textContent = "1/1";
  }

  modal.classList.add("open");
}

function closeImage(event) {
  if (
    event &&
    event.target &&
    !event.target.classList.contains("image-modal") &&
    !event.target.classList.contains("close-image")
  ) {
    return;
  }
  const modal = document.getElementById("imageModal");
  if (!modal) return;
  modal.classList.remove("open");
}

function changeModalImage(direction, event) {
  if (event) {
    event.stopPropagation();
  }
  if (modalImages.length <= 1) return;

  currentModalImageIndex += direction;
  if (currentModalImageIndex < 0) {
    currentModalImageIndex = modalImages.length - 1;
  }
  if (currentModalImageIndex >= modalImages.length) {
    currentModalImageIndex = 0;
  }

  const image = document.getElementById("modalImage");
  const counter = document.getElementById("modalImageCounter");

  if (image) {
    image.src = modalImages[currentModalImageIndex];
  }
  if (counter) {
    counter.textContent = `${currentModalImageIndex + 1}/${modalImages.length}`;
  }
}

// ============================================================
// VIA CEP
// ============================================================

async function lookupCep() {
  const cepInput = document.getElementById("cep");
  const status = document.getElementById("addressStatus");
  if (!cepInput) return;

  const cep = normalizeCep(cepInput.value);
  if (cep.length !== 8) {
    return;
  }

  if (status) {
    status.textContent = "Consultando endereço...";
    status.className = "address-status loading";
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) {
      throw new Error("Não foi possível consultar o CEP.");
    }

    const data = await response.json();
    if (data.erro) {
      throw new Error("CEP não encontrado.");
    }

    const street = document.getElementById("addressStreet");
    const neighborhood = document.getElementById("addressNeighborhood");
    const city = document.getElementById("addressCity");
    const state = document.getElementById("addressState");

    if (street) street.value = data.logradouro || "";
    if (neighborhood) neighborhood.value = data.bairro || "";
    if (city) city.value = data.localidade || "";
    if (state) state.value = (data.uf || "").toUpperCase();

    if (status) {
      status.textContent =
        "✓ Endereço localizado. Você pode editar os campos se necessário.";
      status.className = "address-status success";
    }
  } catch (error) {
    console.error(error);
    if (status) {
      status.textContent =
        error.message || "Não foi possível localizar o endereço.";
      status.className = "address-status error";
    }
  }
}

// ============================================================
// FRETE — NOMES DAS TRANSPORTADORAS
// ============================================================

function getCarrierName(rate) {
  const text = [
    rate.name,
    rate.company,
    rate.carrier,
    rate.service,
    rate.serviceName,
    rate.description,
    rate.label
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("sedex")) {
    return "SEDEX";
  }
  if (
    text.includes("pac") ||
    text.includes("econômico") ||
    text.includes("economico")
  ) {
    return "PAC";
  }
  if (text.includes("jadlog")) {
    return "Jadlog";
  }
  if (
    text.includes("j&t") ||
    text.includes("j & t") ||
    text.includes("jnt") ||
    text.includes("j and t")
  ) {
    return "J&T Express";
  }
  if (text.includes("loggi")) {
    return "Loggi";
  }

  return rate.name || rate.service || rate.company || "Transportadora";
}

// ============================================================
// NORMALIZAR RESULTADO SUPERFRETE
// ============================================================

function normalizeShippingRate(rate) {
  if (!rate || typeof rate !== "object") {
    return null;
  }

  const priceRaw =
    rate.price ?? rate.amount ?? rate.value ?? rate.total ?? rate.cost ?? rate.valor;
  const price = Number(
    String(priceRaw ?? "")
      .replace(",", ".")
      .replace(/[^\d.-]/g, "")
  );

  const deliveryTime =
    rate.deliveryTime ??
    rate.delivery_time ??
    rate.deadline ??
    rate.delivery_days ??
    rate.days ??
    rate.prazo ??
    rate.delivery;

  if (!Number.isFinite(price) || price <= 0) {
    return null;
  }

  return {
    id:
      rate.id ??
      rate.serviceId ??
      rate.service_id ??
      rate.code ??
      rate.codigo ??
      Math.random().toString(36).slice(2),
    name: getCarrierName(rate),
    price: price,
    deliveryTime:
      deliveryTime != null
        ? String(deliveryTime)
        : "Prazo informado pela transportadora"
  };
}

// ============================================================
// EXTRAIR FRETES DA RESPOSTA
// ============================================================

function extractShippingRates(data) {
  if (!data) {
    return [];
  }
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data.rates)) {
    return data.rates;
  }
  if (Array.isArray(data.services)) {
    return data.services;
  }
  if (Array.isArray(data.data)) {
    return data.data;
  }
  if (data.data && Array.isArray(data.data.rates)) {
    return data.data.rates;
  }
  if (data.data && Array.isArray(data.data.services)) {
    return data.data.services;
  }
  return [];
}

// ============================================================
// CALCULANDO O FRETE
// ============================================================

async function calculateShipping(event) {
  if (event) {
    event.preventDefault();
  }

  const cepInput = document.getElementById("cep");
  const button = document.getElementById("shippingButton");
  const result = document.getElementById("shippingResult");
  const quantityInput = document.getElementById("shippingQty");
  const weightInput = document.getElementById("shippingWeight");

  const cep = normalizeCep(cepInput?.value);
  if (cep.length !== 8) {
    showToast("Digite um CEP válido.");
    return;
  }

  const quantity = Number(quantityInput?.value || 1);
  const weight = Number(weightInput?.value || SHIPPING_CONFIG.defaultWeight);

  if (button) {
    button.disabled = true;
    button.textContent = "Calculando...";
  }

  if (result) {
    result.innerHTML = `
      <div class="shipping-empty">
        <div>
          <strong>Calculando frete...</strong>
          <p>Consultando as opções disponíveis.</p>
        </div>
      </div>
    `;
  }

  selectedShipping = null;

  try {
    const response = await fetch(`${SHIPPING_CONFIG.apiUrl}/api/frete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        cep: cep,
        destinationCep: cep,
        quantity: quantity,
        weight: weight,
        height: SHIPPING_CONFIG.height,
        width: SHIPPING_CONFIG.width,
        length: SHIPPING_CONFIG.length
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error || data?.message || "Não foi possível calcular o frete."
      );
    }

    const rawRates = extractShippingRates(data);
    currentShippingRates = rawRates.map(normalizeShippingRate).filter(Boolean);

    // Remove duplicados
    const uniqueRates = [];
    const seen = new Set();
    currentShippingRates.forEach(rate => {
      const key = `${rate.name}-${rate.price}-${rate.deliveryTime}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueRates.push(rate);
      }
    });
    currentShippingRates = uniqueRates;

    renderShippingOptions();
  } catch (error) {
    console.error("Erro ao calcular frete:", error);
    if (result) {
      result.innerHTML = `
        <div class="shipping-empty shipping-error">
          <div>
            <strong>Não foi possível calcular o frete</strong>
            <p>${escapeHtml(error.message || "Verifique o CEP e tente novamente.")}</p>
          </div>
        </div>
      `;
    }
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Calcular frete";
    }
  }
}

// ============================================================
// RENDERIZAR OPÇÕES DE FRETE
// ============================================================

function renderShippingOptions() {
  const result = document.getElementById("shippingResult");
  if (!result) return;

  if (!currentShippingRates.length) {
    result.innerHTML = `
      <div class="shipping-empty">
        <div>
          <strong>Nenhuma opção de frete encontrada</strong>
          <p>O SuperFrete não retornou opções disponíveis para este CEP.</p>
        </div>
      </div>
    `;
    return;
  }

  let html = `
    <div class="shipping-options">
      <div class="shipping-options-title">
        <strong>Escolha a forma de entrega</strong>
        <span>Selecione uma opção</span>
      </div>
  `;

  currentShippingRates.forEach((rate, index) => {
    const inputId = `shipping-${index}`;
    html += `
      <label class="shipping-option" for="${inputId}">
        <input type="radio" id="${inputId}" name="shippingOption" value="${escapeHtml(String(rate.id))}" onchange="selectShippingOption(${index})">
        <span class="shipping-radio"></span>
        <span class="shipping-option-content">
          <strong>${escapeHtml(rate.name)}</strong>
          <small>Prazo: ${escapeHtml(rate.deliveryTime)}</small>
        </span>
        <span class="shipping-option-price">${formatMoney(rate.price)}</span>
      </label>
    `;
  });

  // Sempre disponibiliza combinar entrega
  html += `
    <label class="shipping-option shipping-combine" for="shipping-combine">
      <input type="radio" id="shipping-combine" name="shippingOption" value="combine" onchange="selectCombineDelivery()">
      <span class="shipping-radio"></span>
      <span class="shipping-option-content">
        <strong>Combinar entrega</strong>
        <small>Combine a forma de entrega diretamente com a loja.</small>
      </span>
      <span class="shipping-option-price">A combinar</span>
    </label>
  `;

  html += `</div>`;
  result.innerHTML = html;
}

// ============================================================
// SELECIONAR FRETE
// ============================================================

function selectShippingOption(index) {
  const rate = currentShippingRates[index];
  if (!rate) return;

  selectedShipping = {
    type: "shipping",
    id: rate.id,
    name: rate.name,
    price: rate.price,
    deliveryTime: rate.deliveryTime
  };
  updateSelectedShipping();
}

// ============================================================
// COMBINAR ENTREGA
// ============================================================

function selectCombineDelivery() {
  selectedShipping = {
    type: "combine",
    id: "combine",
    name: "Combinar entrega",
    price: 0,
    deliveryTime: "A combinar"
  };
  updateSelectedShipping();
}

// ============================================================
// ATUALIZAR VISUAL DA OPÇÃO SELECIONADA
// ============================================================

function updateSelectedShipping() {
  document.querySelectorAll(".shipping-option").forEach(option => {
    const radio = option.querySelector('input[type="radio"]');
    option.classList.toggle("selected", Boolean(radio?.checked));
  });
}

// ============================================================
// CHECKOUT WHATSAPP
// ============================================================

function checkout() {
  if (!cart.length) {
    showToast("Adicione pelo menos um produto ao carrinho.");
    return;
  }

  if (!selectedShipping) {
    showToast("Selecione uma opção de frete antes de finalizar.");
    document.getElementById("frete")?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  const cep = document.getElementById("cep")?.value?.trim();
  const street = document.getElementById("addressStreet")?.value?.trim();
  const number = document.getElementById("addressNumber")?.value?.trim();
  const complement = document.getElementById("addressComplement")?.value?.trim();
  const neighborhood = document.getElementById("addressNeighborhood")?.value?.trim();
  const city = document.getElementById("addressCity")?.value?.trim();
  const state = document.getElementById("addressState")?.value?.trim()?.toUpperCase();

  if (!cep || normalizeCep(cep).length !== 8) {
    showToast("Informe um CEP válido.");
    return;
  }

  if (!number) {
    showToast("Informe o número do endereço.");
    document.getElementById("addressNumber")?.focus();
    return;
  }

  if (!street) {
    showToast("Informe a rua ou avenida.");
    return;
  }

  if (!neighborhood) {
    showToast("Informe o bairro.");
    return;
  }

  if (!city) {
    showToast("Informe a cidade.");
    return;
  }

  if (!state) {
    showToast("Informe o estado.");
    return;
  }

  const subtotal = getCartSubtotal();
  const shippingPrice = selectedShipping.type === "shipping" ? selectedShipping.price : 0;
  const total = subtotal + shippingPrice;

  let message = `Olá! Gostaria de finalizar meu pedido pela WJ Imports.%0A%0A`;
  message += `*PRODUTOS*%0A`;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    message += `• ${encodeURIComponent(item.name)} — ${item.quantity}x — ${encodeURIComponent(formatMoney(itemTotal))}%0A`;
  });

  message += `%0A`;
  message += `*SUBTOTAL:* ${encodeURIComponent(formatMoney(subtotal))}%0A`;
  message += `%0A`;
  message += `*ENTREGA:*%0A`;

  if (selectedShipping.type === "combine") {
    message += `• Forma: Combinar entrega%0A`;
  } else {
    message += `• Transportadora: ${encodeURIComponent(selectedShipping.name)}%0A`;
    message += `• Prazo: ${encodeURIComponent(selectedShipping.deliveryTime)}%0A`;
    message += `• Frete: ${encodeURIComponent(formatMoney(selectedShipping.price))}%0A`;
  }

  message += `%0A`;
  message += `*ENDEREÇO DE ENTREGA:*%0A`;
  message += `${encodeURIComponent(street)}, ${encodeURIComponent(number)}%0A`;
  if (complement) {
    message += `Complemento: ${encodeURIComponent(complement)}%0A`;
  }
  message += `${encodeURIComponent(neighborhood)}%0A`;
  message += `${encodeURIComponent(city)} - ${encodeURIComponent(state)}%0A`;
  message += `CEP: ${encodeURIComponent(formatCep(cep))}%0A`;
  message += `%0A`;
  message += `*TOTAL:* ${encodeURIComponent(formatMoney(total))}%0A`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(url, "_blank");
}

// ============================================================
// EVENTOS
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  renderCategories();
  renderProducts();
  updateCart();

  // CEP
  const cepInput = document.getElementById("cep");
  if (cepInput) {
    cepInput.addEventListener("input", () => {
      const formatted = formatCep(cepInput.value);
      cepInput.value = formatted;
      if (normalizeCep(formatted).length === 8) {
        lookupCep();
      }
    });
  }

  // UF sempre em maiúsculas
  const stateInput = document.getElementById("addressState");
  if (stateInput) {
    stateInput.addEventListener("input", () => {
      stateInput.value = stateInput.value
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 2);
    });
  }

  // Fechar carrinho clicando fora
  const cartModal = document.getElementById("cartModal");
  if (cartModal) {
    cartModal.addEventListener("click", event => {
      if (event.target === cartModal) {
        closeCart();
      }
    });
  }

  // ESC fecha os modais
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") {
      return;
    }
    closeCart();
    const imageModal = document.getElementById("imageModal");
    if (imageModal) {
      imageModal.classList.remove("open");
    }
  });
});