// checkout.js
document.addEventListener("DOMContentLoaded", () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartList = document.getElementById("checkout-items");
  const totalElement = document.getElementById("checkout-total");

  // Display cart items
  let total = 0;
  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - Ksh.${item.price} × ${item.quantity}`;
    cartList.appendChild(li);
    total += item.price * item.quantity;
  });

  totalElement.textContent = total.toFixed(2);

  // Handle form submission
  const form = document.getElementById("checkout-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const order = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      address: document.getElementById("address").value,
      items: cart,
      total,
      date: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });

      const data = await res.json();
      alert(data.message);

      localStorage.removeItem("cart");
      window.location.href = "index.html";
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to save order. Please try again.");
    }
  });
});
