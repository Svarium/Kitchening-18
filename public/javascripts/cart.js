const $ = (el) => document.querySelector(el);
const cardsContainer = $("#cards-container");
const clearCart = $("#clear-cart");
const btnBuy = $("#btn-buy");
const outputTotal = $("#output-total");
const URL_API_SERVER = "http://localhost:3000/api";

const getOrder = () => {
  return fetch(`${URL_API_SERVER}/cart/getOrderPending`, {
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
};

const convertFormatPeso = (n) =>
  n.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });

const paintProducts = ({ products }) => {
  cardsContainer.innerHTML = "";
  if (products.length) {
    products.forEach(
      ({ title, description, images, Cart, id, price, discount }) => {
        const priceWithDiscount = discount
          ? price - (price * discount) / 100
          : price;
        const priceFormatARG = convertFormatPeso(priceWithDiscount);
        const template = `
              <!-- COURSE TEMPLATE CARD -->
              <div class="card col-12 col-lg-8 my-5">
                <div class="card-body row">
                  
                  <img class="col-4" style="width:150px" style="object-fit: contain;" src="/images/courses/${
                    images[0].name
                  }" alt="">
                  <div class="col-8 position-relative">
                    <button onclick="removeProductToCart(${id})" class="fs-5 p-0 border-0 bg-transparent position-absolute text-danger " style="top:-3px;right:10px"><i style="padding:2px" class="rounded-circle btn-clear far fa-times-circle"></i></button>
    
                    <h5 class="card-title">${title}</h5>
                    <p class="card-text text-truncate">${description}</p>
                    <p class="card-text">${priceFormatARG}${
          discount
            ? `<span class="text-danger mx-3">${discount}% OFF</span>`
            : ""
        }</p>
                    <p class="d-flex align-items-center gap-2">
                      <label for=""></label>
                      <button onclick="lessProduct(${id},${
          Cart.quantity
        })" class="btn btn-light">-</button>
                      <output style="width:50px"  class="form-control text-center">
                        ${Cart.quantity}
                      </output>
                      <button onclick="moreProduct(${id})" class="btn btn-light">+</button>
                      <a href="/courses/detail/${id}" class="btn btn-outline-dark">Ver más</a>
                    </p>
                  </div>
               
                </div>
              </div>
      `;
        cardsContainer.innerHTML += template;
      }
    );
    return;
  }
  cardsContainer.innerHTML = "<h1>No existen productos en el carrito</h1>";
};

const paintTotal = (n) => {
  outputTotal.textContent = convertFormatPeso(n);
};

window.addEventListener("load", async () => {
  try {
    const { ok, data } = await getOrder();
    if (ok) {
      paintProducts({ products: data.cart });
      paintTotal(data.total);
    }

    console.log({ ok, data });
  } catch (error) {
    console.log(error);
  }
});

const moreProduct = async (id) => {
  const objCourseId = {
    courseId: id,
  };
  const { ok } = await fetch(`${URL_API_SERVER}/cart/moreQuantity`, {
    method: "PUT",
    body: JSON.stringify(objCourseId),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  if (ok) {
    const { ok, data } = await getOrder();
    if (ok) {
      paintProducts({ products: data.cart });
      paintTotal(data.total);
    }
  }
};

const lessProduct = async (id, quantity) => {
  const objCourseId = {
    courseId: id,
  };

  if (quantity > 1) {
    const { ok } = await fetch(`${URL_API_SERVER}/cart/lessQuantity`, {
      method: "PUT",
      body: JSON.stringify(objCourseId),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

    if (ok) {
      const { ok, data } = await getOrder();
      if (ok) {
        paintProducts({ products: data.cart });
        paintTotal(data.total);
      }
    }
  }
};

const removeProductToCart = async (id) => {
  try {
    const result = await Swal.fire({
      title: "¿Estas seguro de quitar el producto?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Quitar",
    });

    if (result.isConfirmed) {
      const objCourseId = {
        courseId: id,
      };
      const { ok } = await fetch(`${URL_API_SERVER}/cart/removeProduct`, {
        method: "DELETE",
        body: JSON.stringify(objCourseId),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());

      if (ok) {
        const { ok, data } = await getOrder();
        if (ok) {
          paintProducts({ products: data.cart });
          paintTotal(data.total);
        }

        Swal.fire({
          title: "Producto eliminado del carrito",
          icon: "success",
          showConfirmButton: false,
          timer: 800,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

clearCart.addEventListener("click", async () => {
  try {
    const result = await Swal.fire({
      title: "¿Estas seguro de borrar todo el carrito?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Quitar",
    });

    if (result.isConfirmed) {
      const { ok } = await fetch(`${URL_API_SERVER}/cart/clearCart`, {
        method: "DELETE",
      }).then((res) => res.json());

      if (ok) {
        const { ok, data } = await getOrder();

        if (ok) {
          paintProducts({ products: data.cart });
          paintTotal(data.total);
        }

        Swal.fire({
          title: "Proceso completado",
          icon: "success",
          showConfirmButton: false,
          timer: 1400,
        })
      }
    }
  } catch (error) {
    console.log(error)
  }
});

btnBuy.addEventListener("click", async () => {
  const result = await Swal.fire({
    title: "¿Estas seguro realizar la compra?",
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Confirmar",
  });

  if (result.isConfirmed) {
    const { ok } = await fetch(`${URL_API_SERVER}/cart/statusOrder`, {
      method: "PUT",
      body: JSON.stringify({ status: "completed" }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

    let timerInterval;
    const result = await Swal.fire({
      title: "Procesando la compra",
      text: "Esperar mientras se realiza la compra",
      timer: 5000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const b = Swal.getHtmlContainer().querySelector("b");
        timerInterval = setInterval(() => {
          b.textContent = Swal.getTimerLeft();
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    });

    if (result.dismiss === Swal.DismissReason.timer) {
      
      await Swal.fire({
        title: ok ? "Gracias por su compra" : "Upss hubo error",
        icon: ok ? 'success': 'error',
        showConfirmButton:false,
        timer:1000
      })

      ok && (location.href = "/")

    }
  }
});
