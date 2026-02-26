import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { isValidCpf, maskCpf, stripCpf } from "../../../utils/cpf.utils";
import type { CheckoutFormData } from "../checkout.types";

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void;
  submitting: boolean;
  submitError?: string;
}

const CARD_BRANDS = ["visa", "mastercard", "amex", "elo", "hipercard", "outro"];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR + i);

type FormErrors = Partial<Record<keyof CheckoutFormData, string>>;

const empty: CheckoutFormData = {
  customerName: "",
  customerEmail: "",
  customerCpf: "",
  cardHolderName: "",
  cardLastFour: "",
  cardBrand: "",
  expiryMonth: "",
  expiryYear: "",
};

function validate(data: CheckoutFormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.customerName.trim()) errors.customerName = "Nome obrigatório";
  if (!data.customerEmail.trim()) {
    errors.customerEmail = "E-mail obrigatório";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) {
    errors.customerEmail = "E-mail inválido";
  }
  const cpfRaw = stripCpf(data.customerCpf);
  if (!cpfRaw) {
    errors.customerCpf = "CPF obrigatório";
  } else if (!isValidCpf(cpfRaw)) {
    errors.customerCpf = "CPF inválido";
  }
  if (!data.cardHolderName.trim())
    errors.cardHolderName = "Nome no cartão obrigatório";
  if (!data.cardLastFour) {
    errors.cardLastFour = "Últimos 4 dígitos obrigatórios";
  } else if (!/^\d{4}$/.test(data.cardLastFour)) {
    errors.cardLastFour = "Exatamente 4 dígitos numéricos";
  }
  if (!data.cardBrand) errors.cardBrand = "Bandeira obrigatória";
  if (!data.expiryMonth) errors.expiryMonth = "Mês obrigatório";
  if (!data.expiryYear) errors.expiryYear = "Ano obrigatório";
  return errors;
}

export function CheckoutForm({
  onSubmit,
  submitting,
  submitError,
}: CheckoutFormProps) {
  const [form, setForm] = useState<CheckoutFormData>(empty);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof CheckoutFormData, boolean>>
  >({});

  function set(field: keyof CheckoutFormData, value: string) {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) {
      const e = validate(next);
      setErrors((prev) => ({ ...prev, [field]: e[field] }));
    }
  }

  function handleCpf(e: ChangeEvent<HTMLInputElement>) {
    set("customerCpf", maskCpf(e.target.value));
  }

  function handleBlur(field: keyof CheckoutFormData) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const e = validate(form);
    setErrors((prev) => ({ ...prev, [field]: e[field] }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const allTouched = Object.fromEntries(
      Object.keys(empty).map((k) => [k, true]),
    ) as Record<keyof CheckoutFormData, boolean>;
    setTouched(allTouched);
    const e2 = validate(form);
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;
    onSubmit({ ...form, customerCpf: stripCpf(form.customerCpf) });
  }

  const err = (f: keyof CheckoutFormData) =>
    touched[f] ? errors[f] : undefined;

  return (
    <form className="checkout-form" onSubmit={handleSubmit} noValidate>
      {/* ── Customer ── */}
      <section className="checkout-form__section">
        <h3 className="checkout-form__section-title">Dados Pessoais</h3>
        <Input
          label="Nome completo"
          placeholder="João da Silva"
          value={form.customerName}
          onChange={(e) => set("customerName", e.target.value)}
          onBlur={() => handleBlur("customerName")}
          error={err("customerName")}
          autoComplete="name"
        />
        <Input
          label="E-mail"
          type="email"
          placeholder="joao@email.com"
          value={form.customerEmail}
          onChange={(e) => set("customerEmail", e.target.value)}
          onBlur={() => handleBlur("customerEmail")}
          error={err("customerEmail")}
          autoComplete="email"
        />
        <Input
          label="CPF"
          placeholder="000.000.000-00"
          value={form.customerCpf}
          onChange={handleCpf}
          onBlur={() => handleBlur("customerCpf")}
          error={err("customerCpf")}
          inputMode="numeric"
          maxLength={14}
        />
      </section>

      <div className="divider" />

      {/* ── Payment ── */}
      <section className="checkout-form__section">
        <h3 className="checkout-form__section-title">Dados do Cartão</h3>
        <p className="checkout-form__note">
          Simulação — use <code>0002</code> (saldo insuficiente),{" "}
          <code>0000</code> (recusado), qualquer outro número = aprovado.
        </p>
        <Input
          label="Nome no cartão"
          placeholder="JOAO DA SILVA"
          value={form.cardHolderName}
          onChange={(e) => set("cardHolderName", e.target.value.toUpperCase())}
          onBlur={() => handleBlur("cardHolderName")}
          error={err("cardHolderName")}
          autoComplete="cc-name"
          style={{ fontFamily: "var(--font-mono)" }}
        />
        <div className="grid-2">
          <Input
            label="Últimos 4 dígitos"
            placeholder="1234"
            value={form.cardLastFour}
            onChange={(e) =>
              set("cardLastFour", e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            onBlur={() => handleBlur("cardLastFour")}
            error={err("cardLastFour")}
            inputMode="numeric"
            maxLength={4}
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em" }}
          />
          <div className="field">
            <label className="field-label">Bandeira</label>
            <div
              className={`field-wrap${err("cardBrand") ? " field-wrap--error" : ""}`}
            >
              <select
                className="field-input field-select"
                value={form.cardBrand}
                onChange={(e) => {
                  set("cardBrand", e.target.value);
                  handleBlur("cardBrand");
                }}
              >
                <option value="">Selecione</option>
                {CARD_BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b.charAt(0).toUpperCase() + b.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {err("cardBrand") && (
              <span className="field-error">{err("cardBrand")}</span>
            )}
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label className="field-label">Mês de validade</label>
            <div
              className={`field-wrap${err("expiryMonth") ? " field-wrap--error" : ""}`}
            >
              <select
                className="field-input field-select"
                value={form.expiryMonth}
                onChange={(e) => {
                  set("expiryMonth", e.target.value);
                  handleBlur("expiryMonth");
                }}
              >
                <option value="">MM</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
            {err("expiryMonth") && (
              <span className="field-error">{err("expiryMonth")}</span>
            )}
          </div>
          <div className="field">
            <label className="field-label">Ano de validade</label>
            <div
              className={`field-wrap${err("expiryYear") ? " field-wrap--error" : ""}`}
            >
              <select
                className="field-input field-select"
                value={form.expiryYear}
                onChange={(e) => {
                  set("expiryYear", e.target.value);
                  handleBlur("expiryYear");
                }}
              >
                <option value="">AAAA</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            {err("expiryYear") && (
              <span className="field-error">{err("expiryYear")}</span>
            )}
          </div>
        </div>
      </section>

      {submitError && (
        <div className="alert alert--danger" role="alert">
          {submitError}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={submitting}
        style={{ width: "100%" }}
      >
        {submitting ? "Processando..." : "Confirmar Assinatura"}
      </Button>
    </form>
  );
}
