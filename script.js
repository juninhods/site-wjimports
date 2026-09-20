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
      "imgs/yara1.jpg",
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
  } ,
  {
    id: 20,
    name: "Carregador USB-C (Iphone)",
    cat: "Eletroeletrônicos",
    price: 80.99,
    image: [
      "imgs/usbc.jpg",
      "imgs/usbc2.jpg"
    ]
  } ,
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
  } ,
   {
    id: 22,
    name: "TV Box UNI TV",
    cat: "Eletroeletrônicos",
    price: 300.00,
    image: [
      "imgs/unitv.jpg",
    ]
  } ,
  {
    id: 23,
    name: "Tablet Redmi Pad 2 Wi-Fi 256GB",
    cat: "Eletroeletrônicos",
    price: 3000.00,
    image: [
      "imgs/tabletxiaomi1.jpg",
      "imgs/tabletxiaomi2.jpg",
      "imgs/tabletxiaomi3.jpg",
    ]
  } ,


  

  

];


/* =====================================================
   CARRINHO
===================================================== */

let cart = JSON.parse(
  localStorage.getItem("wjCart") || "[]"
);


/* =====================================================
   CONTROLE DO MODAL DE IMAGEM
===================================================== */

let modalProductId = null;

let modalImageIndex = 0;


/* =====================================================
   CATEGORIAS
===================================================== */

const cats = [

  "Eletroeletrônicos",

  "Câmeras e Segurança",

  "Relógios",

  "Perfumes Importados",

  "Dia a Dia/Esportes",

  "Dia a Dia/Lazer"

];


document.getElementById("categoryGrid").innerHTML =

  cats.map(cat => `

    <div
      class="category"
      onclick="setCategory('${cat}')"
    >

      <h3>
        ${cat}
      </h3>

      <p>
        Ver produtos
      </p>

    </div>

  `).join("");


document.getElementById("categoryFilter").innerHTML +=

  cats.map(cat => `

    <option value="${cat}">
      ${cat}
    </option>

  `).join("");


/* =====================================================
   DINHEIRO
===================================================== */

function money(value) {

  return value.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );

}


/* =====================================================
   TROCAR IMAGEM DO PRODUTO
===================================================== */

function changeImage(productId, direction) {

  const product = products.find(
    item => item.id === productId
  );


  if (!product) return;


  if (product.currentImage === undefined) {

    product.currentImage = 0;

  }


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


  const imageElement =
    document.getElementById(
      `product-image-${productId}`
    );


  if (imageElement) {

    imageElement.src =
      product.image[product.currentImage];

  }


  const counter =
    document.getElementById(
      `image-counter-${productId}`
    );


  if (counter) {

    counter.textContent =
      `${product.currentImage + 1}/${product.image.length}`;

  }

}


/* =====================================================
   ABRIR IMAGEM GRANDE
===================================================== */

function openImage(productId) {

  const product = products.find(
    item => item.id === productId
  );


  if (!product) return;


  modalProductId = productId;


  modalImageIndex =
    product.currentImage || 0;


  updateModalImage();


  const modal =
    document.getElementById("imageModal");


  if (!modal) return;


  modal.style.display = "flex";


  document.body.style.overflow = "hidden";

}


/* =====================================================
   ATUALIZAR IMAGEM GRANDE
===================================================== */

function updateModalImage() {

  const product = products.find(
    item => item.id === modalProductId
  );


  if (!product) return;


  const modalImage =
    document.getElementById("modalImage");


  const counter =
    document.getElementById(
      "modalImageCounter"
    );


  modalImage.src =
    product.image[modalImageIndex];


  modalImage.alt =
    product.name;


  counter.textContent =
    `${modalImageIndex + 1}/${product.image.length}`;

}


/* =====================================================
   TROCAR IMAGEM NO MODAL
===================================================== */

function changeModalImage(direction, event) {

  if (event) {

    event.stopPropagation();

  }


  const product = products.find(
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


  /* Atualiza também a imagem do card */

  const productImage =
    document.getElementById(
      `product-image-${product.id}`
    );


  if (productImage) {

    productImage.src =
      product.image[modalImageIndex];

  }


  /* Atualiza contador do card */

  const productCounter =
    document.getElementById(
      `image-counter-${product.id}`
    );


  if (productCounter) {

    productCounter.textContent =
      `${modalImageIndex + 1}/${product.image.length}`;

  }

}


/* =====================================================
   FECHAR IMAGEM GRANDE
===================================================== */

function closeImage(event) {

  if (event) {

    event.stopPropagation();

  }


  const modal =
    document.getElementById("imageModal");


  if (!modal) return;


  modal.style.display = "none";


  document.body.style.overflow = "";


  modalProductId = null;


  modalImageIndex = 0;

}


/* =====================================================
   TECLADO
===================================================== */

document.addEventListener(
  "keydown",
  function(event) {

    const modal =
      document.getElementById("imageModal");


    if (!modal) return;


    if (modal.style.display !== "flex") {

      return;

    }


    /* ESC */

    if (event.key === "Escape") {

      closeImage();

    }


    /* SETA ESQUERDA */

    if (event.key === "ArrowLeft") {

      changeModalImage(-1);

    }


    /* SETA DIREITA */

    if (event.key === "ArrowRight") {

      changeModalImage(1);

    }

  }
);


/* =====================================================
   PRODUTOS
===================================================== */

function renderProducts() {

  const search =
    document.getElementById("search")
      .value
      .toLowerCase();


  const category =
    document.getElementById("categoryFilter")
      .value;


  const sort =
    document.getElementById("sort")
      .value;


  let list = products.filter(product =>

    (
      category === "Todos" ||
      product.cat === category
    )

    &&

    product.name
      .toLowerCase()
      .includes(search)

  );


  /* ===================================================
     ORDENAÇÃO
  =================================================== */

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
        a.name.localeCompare(b.name)
    );

  }


  document.getElementById(
    "resultText"
  ).textContent =
    `${list.length} produto(s) encontrado(s).`;


  /* ===================================================
     RENDERIZAR
  =================================================== */

  document.getElementById(
    "productGrid"
  ).innerHTML =

    list.map(product => {

      if (
        product.currentImage ===
        undefined
      ) {

        product.currentImage = 0;

      }


      const hasMultipleImages =
        product.image.length > 1;


      return `

        <article class="product">


          <div class="product-img">


            <!-- IMAGEM -->

            <img
              id="product-image-${product.id}"
              src="${product.image[product.currentImage]}"
              alt="${product.name}"
              onclick="openImage(${product.id})"
              style="cursor: zoom-in;"
            >


            ${
              hasMultipleImages

              ? `

                <!-- SETA ESQUERDA -->

                <button
                  type="button"
                  class="image-arrow image-arrow-left"
                  onclick="changeImage(${product.id}, -1)"
                  aria-label="Imagem anterior"
                >
                  ‹
                </button>


                <!-- SETA DIREITA -->

                <button
                  type="button"
                  class="image-arrow image-arrow-right"
                  onclick="changeImage(${product.id}, 1)"
                  aria-label="Próxima imagem"
                >
                  ›
                </button>


                <!-- CONTADOR -->

                <div
                  class="image-counter"
                  id="image-counter-${product.id}"
                >
                  ${product.currentImage + 1}/${product.image.length}
                </div>

              `

              : ""

            }


          </div>


          <div class="product-body">


            <span class="tag">
              ${product.cat}
            </span>


            <h3>
              ${product.name}
            </h3>


            <div class="price">
              ${money(product.price)}
            </div>


            <div class="stock">
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

    }).join("");

}


/* =====================================================
   CATEGORIA
===================================================== */

function setCategory(category) {

  document.getElementById(
    "categoryFilter"
  ).value = category;


  document.getElementById(
    "produtos"
  ).scrollIntoView({
    behavior: "smooth"
  });


  renderProducts();

}


/* =====================================================
   CARRINHO
===================================================== */

function addToCart(id) {

  const product =
    products.find(
      item => item.id === id
    );


  if (!product) return;


  cart.push(product);


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


  document.getElementById(
    "cartCount"
  ).textContent =
    cart.length;

}


/* =====================================================
   ABRIR CARRINHO
===================================================== */

function openCart() {

  document.getElementById(
    "cartModal"
  ).style.display =
    "block";


  renderCart();

}


/* =====================================================
   FECHAR CARRINHO
===================================================== */

function closeCart() {

  document.getElementById(
    "cartModal"
  ).style.display =
    "none";

}


/* =====================================================
   MOSTRAR CARRINHO
===================================================== */

function renderCart() {

  const box =
    document.getElementById(
      "cartItems"
    );


  if (!cart.length) {

    box.innerHTML =
      "<p>Seu carrinho está vazio.</p>";


    document.getElementById(
      "cartTotal"
    ).textContent =
      money(0);


    return;

  }


  box.innerHTML =
    cart.map(
      (product, index) => `

        <div class="cart-item">

          <span>
            ${product.name}
          </span>


          <span>

            ${money(product.price)}


            <button
              onclick="removeItem(${index})"
            >
              Remover
            </button>

          </span>

        </div>

      `
    ).join("");


  document.getElementById(
    "cartTotal"
  ).textContent =

    money(

      cart.reduce(
        (total, product) =>
          total + product.price,
        0
      )

    );

}


/* =====================================================
   REMOVER CARRINHO
===================================================== */

function removeItem(index) {

  cart.splice(
    index,
    1
  );


  saveCart();


  renderCart();

}


/* =====================================================
   WHATSAPP
===================================================== */

function checkout() {

  if (!cart.length) {

    return toast(
      "Seu carrinho está vazio."
    );

  }


  const text =

    "Olá, WJ Imports! Quero fazer um pedido:%0A" +

    cart
      .map(
        product =>
          `- ${product.name} — ${money(product.price)}`
      )
      .join("%0A");


  window.open(
    "https://wa.me/13996905523?text=" + text,
    "_blank"
  );

}


/* =====================================================
   FRETE
===================================================== */

function calculateShipping(event) {

  event.preventDefault();


  const cep =
    document.getElementById("cep")
      .value
      .replace(/\D/g, "");


  if (cep.length !== 8) {

    return toast(
      "Digite um CEP válido."
    );

  }


  const region =
    Number(
      cep.substring(0, 1)
    );


  const pac =
    region >= 0 &&
    region <= 4

      ? 24.90

      : 34.90;


  const sedex =
    pac + 18;


  document.getElementById(
    "shippingResult"
  ).innerHTML = `

    <b>
      Simulação para
      ${cep.substring(0, 5)}-${cep.substring(5)}
    </b>

    <br>

    PAC:
    ${money(pac)}
    — 5 a 10 dias úteis

    <br>

    SEDEX:
    ${money(sedex)}
    — 2 a 5 dias úteis

    <br>

    <small>
      Valores demonstrativos.
      Para cálculo real, conecte uma API de frete.
    </small>

  `;

}


/* =====================================================
   TOAST
===================================================== */

function toast(message) {

  const toastElement =
    document.getElementById("toast");


  toastElement.textContent =
    message;


  toastElement.style.display =
    "block";


  setTimeout(() => {

    toastElement.style.display =
      "none";

  }, 1800);

}


/* =====================================================
   MÁSCARA CEP
===================================================== */

document
  .getElementById("cep")
  .addEventListener(
    "input",
    event => {

      const value =
        event.target.value
          .replace(/\D/g, "")
          .slice(0, 8);


      event.target.value =

        value.length > 5

          ? value.slice(0, 5)
            + "-"
            + value.slice(5)

          : value;

    }
  );


/* =====================================================
   INICIAR
===================================================== */

renderProducts();

saveCart();