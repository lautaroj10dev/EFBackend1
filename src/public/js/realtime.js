const socket = io();

const productsList = document.getElementById("productsList");
const createForm = document.getElementById("createForm");
const deleteForm = document.getElementById("deleteForm");

socket.on("products", (products) => {
  productsList.innerHTML = "";

  products.forEach((p) => {
    const li = document.createElement("li");
    li.innerText = `${p._id} - ${p.title} - $${p.price} - ${p.category}`;
    productsList.appendChild(li);
  });
});

createForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(createForm);

  const product = {
    title: formData.get("title"),
    description: formData.get("description"),
    code: formData.get("code"),
    price: Number(formData.get("price")),
    status: true,
    stock: Number(formData.get("stock")),
    category: formData.get("category"),
    thumbnails: []
  };

  socket.emit("createProduct", product);
  createForm.reset();
});

deleteForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(deleteForm);
  const pid = formData.get("pid");

  socket.emit("deleteProduct", pid);
  deleteForm.reset();
}); 