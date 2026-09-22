/* =====================================================
   WJ IMPORTS — CATÁLOGO + CARRINHO + CHECKOUT + SUPERFRETE
===================================================== */


/* =====================================================
   PRODUTOS
===================================================== */

const products = [

  {
    id: 1,
    name: "SmartWatch",
    cat: "Dia a Dia/Esportes",
    price: 200.90,
    image: [
      "imgs/relogio1.jpg",
      "imgs/relogio2.jpg",
      "imgs/relogio3.jpg"
    ]
  },

  {
    id: 2,
    name: "SmartWatch preto",
    cat: "Dia a Dia/Lazer",
    price: 200.90,
    image: [
      "imgs/preto1.jpg",
      "imgs/preto2.jpg",
      "imgs/preto3.jpg"
    ]
  },

  {
    id: 3,
    name: "SMARTWATCH PARA CORRIDAS",
    cat: "ESPORTES/LAZER",
    price: 500.00,
    image: [
      "imgs/redondo1.jpg",
      "imgs/redondo2.jpg",
      "imgs/redondo3.jpg"
    ]
  },

  {
    id: 4,
    name: "Câmera IP",
    cat: "Câmeras e Segurança",
    price: 799.90,
    image: [
      "imgs/cam-ip1.jpg",
      "imgs/cam-ip2.jpg",
      "imgs/cam-ip3.jpg"
    ]
  },

  {
    id: 13,
    name: "Perfume Importado 100ml",
    cat: "Perfumes Importados",
    price: 299.90,
    image: [
      "imgs/asad1.jpg",
      "imgs/asad2.jpg",
      "imgs/asad3.jpg"
    ]
  },

  {
    id: 14,
    name: "Perfume Lataffa Yara 200ml",
    cat: "Perfumes Importados",
    price: 349.90,
    image: [
      "imgs/yara1.jpg",
      "imgs/yara2.jpg",
      "imgs/yara3.jpg"
    ]
  },

  {
    id: 15,
    name: "Perfume Lataffa Eclaire 100ml",
    cat: "Perfumes Importados",
    price: 369.90,
    image: [
      "imgs/eclaire1.jpg",
      "imgs/eclaire2.jpg",
      "imgs/eclaire3.jpg"
    ]
  },

  {
    id: 16,
    name: "Kit Casal Asad Elixir + Asad Yara",
    cat: "Perfumes Importados",
    price: 319.90,
    image: [
      "imgs/asad1.jpg",
      "imgs/yara1.jpg"
    ]
  },

  {
    id: 17,
    name: "Caixa de Som JBL",
    cat: "Eletroeletrônicos",
    price: 99.99,
    image: [
      "imgs/jbl1.jpg",
      "imgs/jbl2.jpg",
      "imgs/jbl3.jpg"
    ]
  },

  {
    id: 18,
    name: "Power Bank 22000mha",
    cat: "Eletroeletrônicos",
    price: 299.99,
    image: [
      "imgs/bank1.jpg",
      "imgs/bank2.jpg",
      "imgs/bank3.jpg"
    ]
  },

  {
    id: 19,
    name: "Fone de Ouvido",
    cat: "Eletroeletrônicos",
    price: 80.99,
    image: [
      "imgs/fone1.jpg",
      "imgs/fone2.jpg"
    ]
  },

  {
    id: 20,
    name: "Carregador USB-C (Iphone)",
    cat: "Eletroeletrônicos",
    price: 80.99,
    image: [
      "imgs/usbc.jpg",
      "imgs/usbc2.jpg"
    ]
  },

  {
    id: 21,
    name: "Controle PS4",
    cat: "Eletroeletrônicos",
    price: 80.99,
    image: [
      "imgs/ps4.jpg",
      "imgs/ps42.jpg",
      "imgs/ps43.jpg"
    ]
  },

  {
    id: 22,
    name: "TV Box UNI TV",
    cat: "Eletroeletrônicos",
    price: 300.00,
    image: [
      "imgs/unitv.jpg"
    ]
  },

  {
    id: 23,
    name: "Tablet Redmi Pad 2 Wi-Fi 256GB",
    cat: "Eletroeletrônicos",
    price: 3000.00,
    image: [
      "imgs/tabletxiaomi1.jpg",
      "imgs/tabletxiaomi2.jpg",
      "imgs/tabletxiaomi3.jpg"
    ]
  }

];


/* =====================================================
   CONFIGURAÇÃO DO FRETE
===================================================== */

const SHIPPING_CONFIG = {

  apiUrl: "",

  height: 10,

  width: 15,

  length: 20

};


/*
   Peso padrão de cada produto.

   Aqui estamos considerando:

   1 produto = 0,50 kg

   2 produtos = 1,00 kg

   3 produtos = 1,50 kg

   etc.
*/

const PESO_PADRAO_PRODUTO = 0.50;


/* =====================================================
   CARRINHO
===================================================== */

let cart = JSON.parse(
  localStorage.getItem("wjCart") || "[]"
);


/* =====================================================
   MODAL DE IMAGEM
===================================================== */

let modalProductId = null;

let modalImageIndex = 0;


/* =====================================================
   CATEGORIAS
===================================================== */

const cats = [
  ...new Set(
    products.map(product => product.cat)
  )
];


const categoryGrid =
  document.getElementById("categoryGrid");


const categoryFilter =
  document.getElementById("categoryFilter");


if (categoryGrid) {

  categoryGrid.innerHTML =
    cats.map((cat, index) => `

      <button
        class="category"
        type="button"
        onclick='setCategory(${JSON.stringify(cat)})'
      >

        <span class="category-number">
          ${String(index + 1).padStart(2, "0")}
        </span>

        <div>

          <h3>
            ${escapeHtml(cat)}
          </h3>

          <p>
            ${products.filter(
              product => product.cat === cat
            ).length}
            produto(s)
          </p>

        </div>

        <span class="category-arrow">
          →
        </span>

      </button>

    `).join("");

}


if (categoryFilter) {

  categoryFilter.innerHTML +=
    cats.map(cat => `

      <option value="${escapeHtml(cat)}">
        ${escapeHtml(cat)}
      </option>

    `).join("");

}


/* =====================================================
   FUNÇÕES BÁSICAS
===================================================== */

function money(value) {

  return Number(value || 0).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );

}


function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =====================================================
   CATEGORIA
===================================================== */

function setCategory(category) {

  if (categoryFilter) {

    categoryFilter.value = category;

  }

  const produtos =
    document.getElementById("produtos");

  if (produtos) {

    produtos.scrollIntoView({
      behavior: "smooth"
    });

  }

  renderProducts();

}


/* =====================================================
   IMAGENS DOS PRODUTOS
===================================================== */

function changeImage(productId, direction) {

  const product =
    products.find(
      item => item.id === productId
    );

  if (
    !product ||
    !product.image ||
    !product.image.length
  ) {
    return;
  }


  product.currentImage =
    product.currentImage ?? 0;


  product.currentImage += direction;


  if (product.currentImage < 0) {

    product.currentImage =
      product.image.length - 1;

  }


  if (
    product.currentImage >=
    product.image.length
  ) {

    product.currentImage = 0;

  }


  const image =
    document.getElementById(
      `product-image-${productId}`
    );


  const counter =
    document.getElementById(
      `image-counter-${productId}`
    );


  if (image) {

    image.src =
      product.image[
        product.currentImage
      ];

  }


  if (counter) {

    counter.textContent =
      `${product.currentImage + 1}/${product.image.length}`;

  }

}


/* =====================================================
   ABRIR IMAGEM
===================================================== */

function openImage(productId) {

  const product =
    products.find(
      item => item.id === productId
    );


  if (!product) return;


  modalProductId = productId;


  modalImageIndex =
    product.currentImage || 0;


  updateModalImage();


  const modal =
    document.getElementById("imageModal");


  if (modal) {

    modal.style.display = "flex";

  }


  document.body.style.overflow =
    "hidden";

}


/* =====================================================
   ATUALIZAR MODAL
===================================================== */

function updateModalImage() {

  const product =
    products.find(
      item => item.id === modalProductId
    );


  if (!product) return;


  const image =
    document.getElementById("modalImage");


  const counter =
    document.getElementById(
      "modalImageCounter"
    );


  if (image) {

    image.src =
      product.image[modalImageIndex];

    image.alt =
      product.name;

  }


  if (counter) {

    counter.textContent =
      `${modalImageIndex + 1}/${product.image.length}`;

  }

}


/* =====================================================
   TROCAR IMAGEM DO MODAL
===================================================== */

function changeModalImage(
  direction,
  event
) {

  event?.stopPropagation();


  const product =
    products.find(
      item => item.id === modalProductId
    );


  if (!product) return;


  modalImageIndex += direction;


  if (modalImageIndex < 0) {

    modalImageIndex =
      product.image.length - 1;

  }


  if (
    modalImageIndex >=
    product.image.length
  ) {

    modalImageIndex = 0;

  }


  product.currentImage =
    modalImageIndex;


  updateModalImage();


  const image =
    document.getElementById(
      `product-image-${product.id}`
    );


  const counter =
    document.getElementById(
      `image-counter-${product.id}`
    );


  if (image) {

    image.src =
      product.image[modalImageIndex];

  }


  if (counter) {

    counter.textContent =
      `${modalImageIndex + 1}/${product.image.length}`;

  }

}


/* =====================================================
   FECHAR MODAL DE IMAGEM
===================================================== */

function closeImage(event) {

  if (
    event &&
    event.target !== event.currentTarget &&
    !event.target.classList.contains(
      "close-image"
    )
  ) {

    return;

  }


  const modal =
    document.getElementById("imageModal");


  if (modal) {

    modal.style.display = "none";

  }


  document.body.style.overflow = "";


  modalProductId = null;

  modalImageIndex = 0;

}


/* =====================================================
   TECLADO — MODAL
===================================================== */

document.addEventListener(
  "keydown",
  event => {

    const modal =
      document.getElementById(
        "imageModal"
      );


    if (
      !modal ||
      modal.style.display !== "flex"
    ) {

      return;

    }


    if (event.key === "Escape") {

      closeImage();

    }


    if (event.key === "ArrowLeft") {

      changeModalImage(-1);

    }


    if (event.key === "ArrowRight") {

      changeModalImage(1);

    }

  }
);


/* =====================================================
   RENDERIZAR PRODUTOS
===================================================== */

function renderProducts() {

  const searchElement =
    document.getElementById("search");


  const categoryElement =
    document.getElementById(
      "categoryFilter"
    );


  const sortElement =
    document.getElementById("sort");


  const productGrid =
    document.getElementById(
      "productGrid"
    );


  if (!productGrid) return;


  const search =
    searchElement
      ? searchElement.value
          .trim()
          .toLowerCase()
      : "";


  const category =
    categoryElement
      ? categoryElement.value
      : "Todos";


  const sort =
    sortElement
      ? sortElement.value
      : "default";


  let list =
    products.filter(product =>

      (
        category === "Todos" ||
        product.cat === category
      )

      &&

      product.name
        .toLowerCase()
        .includes(search)

    );


  if (sort === "low") {

    list.sort(
      (a, b) =>
        a.price - b.price
    );

  }


  if (sort === "high") {

    list.sort(
      (a, b) =>
        b.price - a.price
    );

  }


  if (sort === "name") {

    list.sort(
      (a, b) =>
        a.name.localeCompare(
          b.name,
          "pt-BR"
        )
    );

  }


  const resultText =
    document.getElementById(
      "resultText"
    );


  if (resultText) {

    resultText.textContent =
      `${list.length} produto(s) encontrado(s).`;

  }


  productGrid.innerHTML =
    list.map(product => {

      product.currentImage =
        product.currentImage ?? 0;


      const hasMultiple =
        product.image.length > 1;


      return `

        <article class="product">

          <div class="product-img">

            <span class="product-badge">
              ${escapeHtml(product.cat)}
            </span>


            <img
              id="product-image-${product.id}"
              src="${product.image[product.currentImage]}"
              alt="${escapeHtml(product.name)}"
              loading="lazy"
              onclick="openImage(${product.id})"
            >


            ${
              hasMultiple
              ?

              `

                <button
                  class="image-arrow image-arrow-left"
                  type="button"
                  onclick="changeImage(${product.id}, -1)"
                  aria-label="Imagem anterior"
                >
                  ‹
                </button>


                <button
                  class="image-arrow image-arrow-right"
                  type="button"
                  onclick="changeImage(${product.id}, 1)"
                  aria-label="Próxima imagem"
                >
                  ›
                </button>


                <div
                  class="image-counter"
                  id="image-counter-${product.id}"
                >
                  ${product.currentImage + 1}/${product.image.length}
                </div>

              `

              :

              ""

            }

          </div>


          <div class="product-body">

            <h3>
              ${escapeHtml(product.name)}
            </h3>


            <div class="price">
              ${money(product.price)}
            </div>


            <div class="stock">
              <span></span>
              Disponível
            </div>


            <button
              type="button"
              onclick="addToCart(${product.id})"
            >
              Adicionar ao carrinho
            </button>

          </div>

        </article>

      `;

    }).join("")

    ||

    `

      <div class="empty-products">

        <h3>
          Nenhum produto encontrado.
        </h3>

        <p>
          Tente outro termo ou categoria.
        </p>

      </div>

    `;

}


/* =====================================================
   QUANTIDADE TOTAL DO CARRINHO
===================================================== */

function getCartQuantity() {

  return cart.reduce(
    (total, item) => {

      return total +
        Math.max(
          1,
          Number(
            item.quantity || 1
          )
        );

    },
    0
  );

}


/* =====================================================
   PESO TOTAL DO CARRINHO
===================================================== */

function getCartWeight() {

  return (
    getCartQuantity() *
    PESO_PADRAO_PRODUTO
  );

}


/* =====================================================
   ADICIONAR AO CARRINHO
===================================================== */

function addToCart(id) {

  const product =
    products.find(
      item => item.id === id
    );


  if (!product) return;


  const existing =
    cart.find(
      item => item.id === product.id
    );


  if (existing) {

    existing.quantity =
      Math.max(
        1,
        Number(
          existing.quantity || 1
        )
      ) + 1;

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      price: product.price,

      quantity: 1

    });

  }


  saveCart();


  toast(
    "Produto adicionado ao carrinho!"
  );

}


/* =====================================================
   SALVAR CARRINHO
===================================================== */

function saveCart() {

  localStorage.setItem(
    "wjCart",
    JSON.stringify(cart)
  );


  const cartCount =
    document.getElementById(
      "cartCount"
    );


  if (cartCount) {

    cartCount.textContent =
      getCartQuantity();

  }

}


/* =====================================================
   ABRIR CARRINHO
===================================================== */

function openCart() {

  const modal =
    document.getElementById(
      "cartModal"
    );


  if (modal) {

    modal.style.display = "block";

  }


  renderCart();

}


/* =====================================================
   FECHAR CARRINHO
===================================================== */

function closeCart() {

  const modal =
    document.getElementById(
      "cartModal"
    );


  if (modal) {

    modal.style.display = "none";

  }

}


/* =====================================================
   RENDERIZAR CARRINHO
===================================================== */

function renderCart() {

  const box =
    document.getElementById(
      "cartItems"
    );


  if (!box) return;


  if (!cart.length) {

    box.innerHTML = `

      <div class="cart-empty">

        <strong>
          Seu carrinho está vazio.
        </strong>

        <p>
          Adicione um produto para continuar.
        </p>

      </div>

    `;


    const total =
      document.getElementById(
        "cartTotal"
      );


    if (total) {

      total.textContent =
        money(0);

    }


    return;

  }


  box.innerHTML =
    cart.map((product, index) => {

      const quantity =
        Math.max(
          1,
          Number(
            product.quantity || 1
          )
        );


      const subtotal =
        Number(
          product.price || 0
        ) * quantity;


      return `

        <div class="cart-item">

          <div>

            <strong>
              ${escapeHtml(product.name)}
            </strong>

            <small>
              ${money(product.price)}
              cada
            </small>

          </div>


          <div class="cart-item-actions">

            <div class="quantity-control">

              <button
                type="button"
                onclick="changeCartQuantity(${index}, -1)"
              >
                −
              </button>

              <span>
                ${quantity}
              </span>

              <button
                type="button"
                onclick="changeCartQuantity(${index}, 1)"
              >
                +
              </button>

            </div>


            <strong>
              ${money(subtotal)}
            </strong>


            <button
              type="button"
              onclick="removeItem(${index})"
            >
              Remover
            </button>

          </div>

        </div>

      `;

    }).join("");


  const total =
    cart.reduce(
      (sum, product) => {

        return sum +
          (
            Number(
              product.price || 0
            )

            *

            Math.max(
              1,
              Number(
                product.quantity || 1
              )
            )
          );

      },
      0
    );


  const cartTotal =
    document.getElementById(
      "cartTotal"
    );


  if (cartTotal) {

    cartTotal.textContent =
      money(total);

  }

}


/* =====================================================
   ALTERAR QUANTIDADE
===================================================== */

function changeCartQuantity(
  index,
  change
) {

  const item = cart[index];


  if (!item) return;


  const current =
    Math.max(
      1,
      Number(
        item.quantity || 1
      )
    );


  const next =
    current + change;


  if (next <= 0) {

    cart.splice(index, 1);

  } else {

    item.quantity = next;

  }


  saveCart();

  renderCart();

}


/* =====================================================
   REMOVER ITEM
===================================================== */

function removeItem(index) {

  cart.splice(index, 1);

  saveCart();

  renderCart();

}


/* =====================================================
   CHECKOUT
===================================================== */

function checkout() {

  if (!cart.length) {

    toast(
      "Seu carrinho está vazio."
    );

    return;

  }


  const checkoutView =
    document.getElementById(
      "checkoutView"
    );


  const cartModal =
    document.getElementById(
      "cartModal"
    );


  /*
     Se o novo checkout existir no HTML,
     abre ele.

     Não abre o WhatsApp diretamente.
  */

  if (checkoutView) {

    if (cartModal) {

      cartModal.style.display =
        "none";

    }


    checkoutView.style.display =
      "block";


    checkoutView.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });


    updateCheckoutSummary();


    return;

  }


  /*
     Fallback para o HTML antigo.
  */

  const total =
    cart.reduce(
      (sum, product) => {

        return sum +
          (
            Number(
              product.price || 0
            )

            *

            Math.max(
              1,
              Number(
                product.quantity || 1
              )
            )
          );

      },
      0
    );


  const text = [

    "Olá, WJ Imports! Quero fazer um pedido:",

    "",

    ...cart.map(product => {

      const quantity =
        Math.max(
          1,
          Number(
            product.quantity || 1
          )
        );


      const subtotal =
        Number(
          product.price || 0
        ) * quantity;


      return `• ${product.name} — ${quantity}x — ${money(subtotal)}`;

    }),

    "",

    `Total dos produtos: ${money(total)}`

  ].join("\n");


  window.open(
    "https://wa.me/5513996905523?text=" +
    encodeURIComponent(text),
    "_blank"
  );

}


/* =====================================================
   RESUMO DO CHECKOUT
===================================================== */

function updateCheckoutSummary() {

  const box =
    document.getElementById(
      "checkoutSummary"
    );


  if (!box) return;


  if (!cart.length) {

    box.innerHTML = `
      <p>
        Seu carrinho está vazio.
      </p>
    `;

    return;

  }


  const productTotal =
    cart.reduce(
      (sum, product) => {

        return sum +
          (
            Number(
              product.price || 0
            )

            *

            Math.max(
              1,
              Number(
                product.quantity || 1
              )
            )
          );

      },
      0
    );


  box.innerHTML = `

    <div class="checkout-products">

      ${cart.map(product => {

        const quantity =
          Math.max(
            1,
            Number(
              product.quantity || 1
            )
          );


        const subtotal =
          Number(
            product.price || 0
          ) * quantity;


        return `

          <div class="checkout-product">

            <span>
              ${escapeHtml(product.name)}
              × ${quantity}
            </span>

            <strong>
              ${money(subtotal)}
            </strong>

          </div>

        `;

      }).join("")}

    </div>


    <div class="checkout-total-row">

      <span>
        Produtos
      </span>

      <strong>
        ${money(productTotal)}
      </strong>

    </div>


    <div
      class="checkout-total-row"
      id="checkoutShippingSummary"
    >

      <span>
        Frete
      </span>

      <strong>
        A calcular
      </strong>

    </div>


    <div class="checkout-total-final">

      <span>
        Total
      </span>

      <strong id="checkoutGrandTotal">
        ${money(productTotal)}
      </strong>

    </div>

  `;

}


/* =====================================================
   CEP / VIACEP
===================================================== */

async function buscarEnderecoPorCep(
  cep
) {

  cep =
    String(cep || "")
      .replace(/\D/g, "");


  if (cep.length !== 8) {

    return;

  }


  const street =
    document.getElementById(
      "addressStreet"
    );


  const neighborhood =
    document.getElementById(
      "addressNeighborhood"
    );


  const city =
    document.getElementById(
      "addressCity"
    );


  const state =
    document.getElementById(
      "addressState"
    );


  try {

    const response =
      await fetch(
        `https://viacep.com.br/ws/${cep}/json/`
      );


    if (!response.ok) {

      throw new Error(
        "Erro ao consultar CEP."
      );

    }


    const data =
      await response.json();


    if (data.erro) {
      const status = document.getElementById("addressStatus");
      if (status) status.textContent = "CEP não encontrado. Preencha o endereço manualmente.";
      return;
    }


    if (street) {

      street.value =
        data.logradouro || "";

    }


    if (neighborhood) {

      neighborhood.value =
        data.bairro || "";

    }


    if (city) {

      city.value =
        data.localidade || "";

    }


    if (state) {
      state.value = data.uf || "";
    }
    const status = document.getElementById("addressStatus");
    const missing = [];
    if (!data.logradouro) missing.push("rua");
    if (!data.bairro) missing.push("bairro");
    if (status) status.textContent = missing.length ? `CEP localizado. Preencha manualmente: ${missing.join(" e ")}.` : "CEP localizado. Endereço preenchido automaticamente.";

  } catch (error) {

    console.error(
      "Erro ViaCEP:",
      error
    );


    toast(
      "Não foi possível buscar o endereço."
    );

  }

}


/* =====================================================
   FORMATAR CEP
===================================================== */

function formatCep(cep) {

  const value =
    String(cep || "")
      .replace(/\D/g, "");


  if (value.length !== 8) {

    return value;

  }


  return (
    value.slice(0, 5) +
    "-" +
    value.slice(5)
  );

}


/* =====================================================
   FRETE — NOME AMIGÁVEL
===================================================== */

function friendlyCarrierName(
  rate
) {

  const original =
    String(
      rate.name ||
      rate.service ||
      rate.carrier ||
      ""
    ).toLowerCase();


  if (
    original.includes("pac")
  ) {

    return "PAC";

  }


  if (
    original.includes("sedex")
  ) {

    return "SEDEX";

  }


  if (
    original.includes("jadlog")
  ) {

    return "Jadlog";

  }


  if (
    original.includes("j&t") ||
    original.includes("j&t express") ||
    original.includes("jet")
  ) {

    return "J&T Express";

  }


  if (
    original.includes("loggi")
  ) {

    return "Loggi";

  }


  return (
    rate.name ||
    rate.service ||
    "Transportadora"
  );

}


/* =====================================================
   PRAZO DO FRETE
===================================================== */

function formatDelivery(rate) {

  const days =
    rate.deliveryTime ??
    rate.delivery_time ??
    rate.deadline ??
    rate.deliveryDays;


  if (
    days === undefined ||
    days === null ||
    days === ""
  ) {

    return "Prazo informado pela transportadora";

  }


  return `${days} dia(s) útil(eis)`;

}


/* =====================================================
   CALCULAR FRETE
===================================================== */

async function calculateShipping(event) {
  if (event) event.preventDefault();
  const cepElement = document.getElementById("cep");
  const result = document.getElementById("shippingResult");
  const button = document.getElementById("shippingButton");
  const cep = cepElement?.value.replace(/\D/g, "") || "";
  if (cep.length !== 8) return toast("Digite um CEP válido.");

  const qty = getCartQuantity();
  const weight = getCartWeight();
  if (qty <= 0) return toast("Adicione produtos ao carrinho primeiro.");
  if (button) { button.disabled = true; button.textContent = "Calculando..."; }
  if (result) result.innerHTML = `<div class="shipping-loading"><span></span><p>Consultando opções de envio...</p></div>`;

  try {
    const response = await fetch(`${SHIPPING_CONFIG.apiUrl}/api/frete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cep, quantity: qty, weight, height: SHIPPING_CONFIG.height, width: SHIPPING_CONFIG.width, length: SHIPPING_CONFIG.length })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Não foi possível calcular o frete.");
    const options = Array.isArray(data.rates) ? data.rates : [];

    if (result) {
      result.innerHTML = `
        <div class="shipping-results-head"><div><span class="eyebrow">OPÇÕES DE ENVIO</span><h3>Para ${formatCep(cep)}</h3></div><small>SuperFrete</small></div>
        <div class="shipping-options">
          ${options.map((rate, index) => {
            const isCombine = rate.combine === true;
            const name = isCombine ? "Combinar entrega" : friendlyCarrierName(rate);
            const delivery = isCombine ? "Entre em contato para combinar" : formatDelivery(rate);
            const price = isCombine ? "A combinar" : money(rate.price);
            return `<label class="shipping-option"><input type="radio" name="selectedShipping" value="${escapeHtml(String(rate.id ?? index))}" data-price="${isCombine ? "" : Number(rate.price || 0)}" data-name="${escapeHtml(name)}" data-delivery="${escapeHtml(delivery)}" data-combine="${isCombine}" onchange="selectShipping(this)"><div class="shipping-option-content"><div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(delivery)}</span></div><strong class="shipping-price">${price}</strong></div></label>`;
          }).join("")}
        </div>`;
    }
    window.shippingRates = options;
    window.selectedShipping = null;
  } catch (error) {
    console.error("Erro no cálculo do frete:", error);
    if (result) result.innerHTML = `<div class="shipping-error"><strong>Não foi possível calcular agora.</strong><p>${escapeHtml(error.message)}</p><small>Confira a configuração da SuperFrete no servidor.</small></div>`;
  } finally {
    if (button) { button.disabled = false; button.textContent = "Calcular frete"; }
  }
}

/* =====================================================
   SELECIONAR FRETE
===================================================== */

function selectShipping(input) {
  if (!input) return;
  const price = input.dataset.price ? Number(input.dataset.price) : null;
  const name = input.dataset.name || "Envio";
  const delivery = input.dataset.delivery || "";
  const combine = input.dataset.combine === "true";
  window.selectedShipping = { name, price, delivery, combine };
  const shippingSummary = document.getElementById("checkoutShippingSummary");
  const grandTotal = document.getElementById("checkoutGrandTotal");
  const productTotal = getCartProductTotal();
  if (shippingSummary) shippingSummary.innerHTML = `<span>Frete</span><strong>${combine ? "A combinar" : money(price)}</strong>`;
  if (grandTotal) grandTotal.textContent = combine ? `${money(productTotal)} + frete a combinar` : money(productTotal + Number(price || 0));
}

function getCartProductTotal() {
  return cart.reduce((sum, product) => sum + Number(product.price || 0) * Math.max(1, Number(product.quantity || 1)), 0);
}

function getDeliveryMethod() {
  return document.querySelector('input[name="deliveryMethod"]:checked')?.value || "shipping";
}

function changeDeliveryMethod(method) {
  const addressBox = document.getElementById("shippingAddressBox");
  const combineBox = document.getElementById("combineDeliveryBox");
  document.querySelectorAll(".delivery-method").forEach(el => el.classList.toggle("active", el.querySelector("input")?.value === method));
  if (addressBox) addressBox.style.display = method === "shipping" ? "block" : "none";
  if (combineBox) combineBox.style.display = method === "combine" ? "block" : "none";
  window.selectedShipping = method === "combine" ? { name: "Combinar entrega", price: null, delivery: "A combinar", combine: true } : null;
  updateCheckoutSummary();
}

/* =====================================================
   FINALIZAR PEDIDO
===================================================== */

function finalizeCheckout() {
  if (!cart.length) return toast("Seu carrinho está vazio.");
  const method = getDeliveryMethod();
  const shipping = window.selectedShipping;
  const productTotal = getCartProductTotal();
  let addressText = "";
  let deliveryText = "";
  let totalText = money(productTotal);

  if (method === "combine") {
    const local = document.getElementById("combineLocation")?.value.trim() || "";
    if (!local) return toast("Informe o local para combinar a entrega.");
    deliveryText = `Forma de entrega: Combinar entrega\nLocal: ${local}`;
    totalText = `${money(productTotal)} + entrega a combinar`;
  } else {
    if (!shipping || shipping.combine) return toast("Calcule e selecione uma opção de frete antes de finalizar.");
    const cep = document.getElementById("cep")?.value.replace(/\D/g, "") || "";
    const street = document.getElementById("addressStreet")?.value.trim() || "";
    const number = document.getElementById("addressNumber")?.value.trim() || "";
    const complement = document.getElementById("addressComplement")?.value.trim() || "";
    const neighborhood = document.getElementById("addressNeighborhood")?.value.trim() || "";
    const city = document.getElementById("addressCity")?.value.trim() || "";
    const state = document.getElementById("addressState")?.value.trim().toUpperCase() || "";
    if (cep.length !== 8) return toast("Digite um CEP válido.");
    if (!number) return toast("Informe o número do endereço.");
    if (!street || !neighborhood || !city || !state) return toast("Complete os dados do endereço ou preencha manualmente os campos que o CEP não encontrou.");
    addressText = [`${street}, ${number}`, complement ? `Complemento: ${complement}` : null, `Bairro: ${neighborhood}`, `Cidade: ${city} - ${state}`, `CEP: ${formatCep(cep)}`].filter(Boolean).join("\n");
    deliveryText = `Forma de envio: ${shipping.name}\nFrete: ${money(shipping.price)}\nPrazo: ${shipping.delivery || "Informado pela transportadora"}`;
    totalText = money(productTotal + Number(shipping.price || 0));
  }

  const itemsText = cart.map(product => {
    const quantity = Math.max(1, Number(product.quantity || 1));
    const subtotal = Number(product.price || 0) * quantity;
    return `• ${product.name} — ${quantity}x — ${money(subtotal)}`;
  }).join("\n");

  const message = ["Olá, WJ Imports! 👋", "", "Quero finalizar meu pedido:", "", "🛒 PRODUTOS", itemsText, "", `💰 Total dos produtos: ${money(productTotal)}`, "", "📦 ENTREGA", deliveryText, addressText ? "" : null, addressText ? "📍 ENDEREÇO DE ENTREGA" : null, addressText || null, "", `💵 TOTAL: ${totalText}`].filter(line => line !== null).join("\n");
  window.open("https://wa.me/5513996905523?text=" + encodeURIComponent(message), "_blank");
}

/* =====================================================
   VOLTAR PARA O CARRINHO
===================================================== */

function backToCart() {

  const checkoutView =
    document.getElementById(
      "checkoutView"
    );


  const cartModal =
    document.getElementById(
      "cartModal"
    );


  if (checkoutView) {

    checkoutView.style.display =
      "none";

  }


  if (cartModal) {

    cartModal.style.display =
      "block";

    renderCart();

  }

}


/* =====================================================
   CEP — FORMATAÇÃO E BUSCA AUTOMÁTICA
===================================================== */

function setupCep() {

  const cep =
    document.getElementById("cep");


  if (!cep) return;


  cep.addEventListener(
    "input",
    event => {

      let value =
        event.target.value
          .replace(/\D/g, "")
          .slice(0, 8);


      if (value.length > 5) {

        value =
          value.slice(0, 5) +
          "-" +
          value.slice(5);

      }


      event.target.value =
        value;

    }
  );


  cep.addEventListener(
    "blur",
    () => {

      const value =
        cep.value.replace(
          /\D/g,
          ""
        );


      if (value.length === 8) {

        buscarEnderecoPorCep(
          value
        );

      }

    }
  );

}


/* =====================================================
   TOAST
===================================================== */

function toast(message) {

  const element =
    document.getElementById(
      "toast"
    );


  if (!element) {

    alert(message);

    return;

  }


  element.textContent =
    message;


  element.style.display =
    "block";


  clearTimeout(
    window.__toastTimer
  );


  window.__toastTimer =
    setTimeout(
      () => {

        element.style.display =
          "none";

      },
      2200
    );

}


/* =====================================================
   FECHAR MODAIS AO CLICAR FORA
===================================================== */

window.addEventListener(
  "click",
  event => {

    const cartModal =
      document.getElementById(
        "cartModal"
      );


    const imageModal =
      document.getElementById(
        "imageModal"
      );


    if (
      cartModal &&
      event.target === cartModal
    ) {

      closeCart();

    }


    if (
      imageModal &&
      event.target === imageModal
    ) {

      closeImage();

    }

  }
);


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupCep();

    renderProducts();

    saveCart();

    updateCheckoutSummary();

  }
);


/*
   Também executa imediatamente caso
   o script esteja sendo carregado
   depois do HTML.
*/

if (
  document.readyState ===
  "interactive" ||
  document.readyState ===
  "complete"
) {

  setupCep();

  renderProducts();

  saveCart();

}