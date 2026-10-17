import React, { useState } from "react";
import {
  X,
  CreditCard,
  QrCode,
  Building2,
  Lock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { createPayment } from "../../services/paymentService";
import { LoadingSpinner } from "../common/LoadingSpinner";

export default function PaymentModal({ event, user, onSuccess, onClose }) {
  const price = Number(event.ticket_price || 0);
  const formattedPrice = `₹${price.toFixed(2)}`;

  const [paymentMethod, setPaymentMethod] = useState("upi"); 
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [bank, setBank] = useState("sbi");

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [paidResult, setPaidResult] = useState(null);

  const handlePay = async (e) => {
    e.preventDefault();
    setError("");
    setProcessing(true);

    try {
      
      const txId = "TXN_" + Math.random().toString(36).substring(2, 10).toUpperCase() + "_" + Date.now().toString().slice(-4);

      
      const paymentRecord = await createPayment({
        user_id: user.id,
        event_id: event.event_id || event.id,
        amount: price,
        currency: "INR",
        transaction_id: txId,
      });

      setPaidResult(paymentRecord);
      setProcessing(false);
      if (paymentRecord.payment_status === "completed" && onSuccess) {
        await onSuccess(paymentRecord);
      }
    } catch (err) {
      setError(err.message || "Payment authorization failed. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <>
      
      <div
        onClick={processing ? undefined : onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1200,
          backgroundColor: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(6px)",
        }}
      />

      
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1201,
          width: "min(520px, 94vw)",
          backgroundColor: "var(--bg-primary)",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.35)",
          border: "1px solid var(--border-color)",
          overflow: "hidden",
        }}
      >
        
        <div
          style={{
            padding: "1.25rem 1.5rem",
            backgroundColor: "var(--bg-elevated)",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, var(--color-primary), #818cf8)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Secure Checkout</h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>256-Bit SSL Encrypted Payment</p>
            </div>
          </div>
          {!processing && (
            <button onClick={onClose} className="btn btn-ghost btn-icon">
              <X size={20} />
            </button>
          )}
        </div>

        
        <div style={{ padding: "1.5rem" }}>
          {paidResult ? (
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "1rem 0" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#dcfce7",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 0.25rem" }}>
                {paidResult.payment_status === "completed" ? "Payment Successful" : "Payment Request Recorded"}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
                {paidResult.payment_status === "completed"
                  ? <>Your payment for <strong>{event.title}</strong> is complete.</>
                  : <>The payment record for <strong>{event.title}</strong> is pending confirmation. This demo does not process a real charge. Registration will be confirmed after an admin verifies the payment.</>}
              </p>

              <div
                style={{
                  width: "100%",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1rem 1.25rem",
                  border: "1px solid var(--border-color)",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Amount:</span>
                  <strong style={{ color: "var(--color-primary)", fontSize: "1rem" }}>{formattedPrice}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Transaction ID:</span>
                  <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-primary)" }}>
                    {paidResult.transaction_id}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Status:</span>
                  <span style={{ color: paidResult.payment_status === "completed" ? "#16a34a" : "#d97706", fontWeight: 700 }}>
                    {(paidResult.payment_status || "pending").toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            
            <form onSubmit={handlePay} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              
              <div
                style={{
                  padding: "1rem 1.25rem",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                    Event Pass
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "0.15rem" }}>
                    {event.title}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Price</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--color-primary)" }}>{formattedPrice}</div>
                </div>
              </div>

              
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.5rem" }}>
                  Select Payment Method
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.6rem" }}>
                  {[
                    { id: "upi", label: "UPI / QR", icon: QrCode },
                    { id: "card", label: "Card", icon: CreditCard },
                    { id: "netbanking", label: "Net Banking", icon: Building2 },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id)}
                      style={{
                        padding: "0.75rem 0.5rem",
                        borderRadius: "var(--radius-lg)",
                        border: paymentMethod === id ? "2px solid var(--color-primary)" : "1px solid var(--border-color)",
                        backgroundColor: paymentMethod === id ? "var(--color-primary-light)" : "var(--bg-elevated)",
                        color: paymentMethod === id ? "var(--color-primary)" : "var(--text-primary)",
                        fontWeight: paymentMethod === id ? 700 : 500,
                        fontSize: "0.8rem",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.4rem",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Icon size={18} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              
              {paymentMethod === "upi" && (
                <div>
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>
                    Enter Virtual Payment Address (VPA / UPI ID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. name@upi or 9876543210@paytm"
                    className="form-input"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                  />
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
                    Supports Google Pay, PhonePe, Paytm &amp; Cred UPI.
                  </div>
                </div>
              )}

              {paymentMethod === "card" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>Card Number</label>
                    <input
                      type="text"
                      placeholder="4532 •••• •••• 8892"
                      className="form-input"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                      required
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <label className="form-label" style={{ fontSize: "0.8rem" }}>Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        className="form-input"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: "0.8rem" }}>CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        className="form-input"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div>
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Select Bank</label>
                  <select className="form-input" value={bank} onChange={(e) => setBank(e.target.value)}>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="kotak">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              
              {error && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "#fee2e2",
                    borderRadius: "var(--radius-md)",
                    color: "var(--color-danger)",
                    fontSize: "0.825rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              
              <button
                type="submit"
                disabled={processing}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "0.875rem",
                  fontSize: "1rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                {processing ? (
                  <>
                    <LoadingSpinner size="sm" /> Processing Payment...
                  </>
                ) : (
                  <>
                    Pay {formattedPrice} &amp; Confirm Registration <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35rem",
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                }}
              >
                <ShieldCheck size={14} style={{ color: "#16a34a" }} /> Demo payment simulation mode active. No actual charge will be made.
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
