import nodemailer from "nodemailer"

/* -------------------------------------------------
   ENV CHECK (non-blocking)
-------------------------------------------------- */
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  ADMIN_EMAIL,
} = process.env

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.warn("⚠️ SMTP env vars missing — emails will be skipped")
}

/* -------------------------------------------------
   TRANSPORTER
-------------------------------------------------- */
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465, // ✅ FIX: match port correctly
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ✅ keep (ISP / Windows safe)
  },
})

/* -------------------------------------------------
   CUSTOMER ORDER CONFIRMATION
-------------------------------------------------- */
export async function sendOrderConfirmationEmail({
  to,
  orderId,
  totalAmount,
  items,
}: {
  to: string
  orderId: string
  totalAmount: number
  items: {
    name: string
    quantity: number
    size?: string | null
    color?: string | null
  }[]
}) {
  if (!SMTP_USER || !SMTP_PASS) return

  try {
    await transporter.sendMail({
      from: `"Desi Edit" <${SMTP_USER}>`,
      to,
      subject: "Your Desi Edit Order is Confirmed 🛍️",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6">
          <h2>Thank you for your order!</h2>

          <p>Your order has been successfully placed.</p>

          <p>
            <strong>Order ID:</strong> ${orderId}<br/>
            <strong>Total Amount:</strong> ₹${totalAmount.toLocaleString()}
          </p>
          <h3>Items</h3>
          <ul>
            ${items
              .map(
                (item) => `
                <li>
                  <strong>${item.name}</strong><br/>
                  ${item.color ? `<br/>Color: ${item.color}` : ""}
                  ${item.size ? `<br/>Size: ${item.size}` : ""}
                  Qty: ${item.quantity}  
                </li>
              `
              )
              .join("")}
          </ul>

          <p>We’ll notify you once your order is shipped.</p>

          <hr />

          <p style="font-size: 12px; color: #666">
            Desi Edit · Crafted with love 🇮🇳
          </p>
        </div>
      `,
    })

    console.log("📧 Customer order email sent:", to)
  } catch (error) {
    console.error("❌ Customer email failed:", error)
    // DO NOT throw — order must succeed even if email fails
  }
}

/* -------------------------------------------------
   ADMIN ORDER ALERT
-------------------------------------------------- */
export async function sendAdminOrderAlertEmail({
  orderId,
  customerEmail,
  totalAmount,
  items,
}: {
  orderId: string
  customerEmail: string
  totalAmount: number
  items: {
    name: string
    quantity: number
    size?: string | null
    color?: string | null
  }[]
}) {
  if (!SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) return

  try {
    await transporter.sendMail({
      from: `"Desi Edit Orders" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `🆕 New Order Received – ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif">
          <h2>New Order Received</h2>

          <p>
            <strong>Order ID:</strong> ${orderId}<br/>
            <strong>Customer:</strong> ${customerEmail}<br/>
            <strong>Total:</strong> ₹${totalAmount.toLocaleString()}
          </p>
          <h3>Items:</h3>
          <ul>
            ${items
              .map(
                (item) => `
                <li>
                  <strong>${item.name}</strong><br/>
                  ${item.color ? `<br/>Color: ${item.color}` : ""}
                  ${item.size ? `<br/>Size: ${item.size}` : ""}
                  Qty: ${item.quantity}
                  
                </li>
              `
              )
              .join("")}
          </ul>

          <p>Login to admin panel to view details.</p>
        </div>
      `,
    })

    console.log("📧 Admin order alert sent")
  } catch (error) {
    console.error("❌ Admin email failed:", error)
  }
}
