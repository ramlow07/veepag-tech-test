import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { BillingCycle, ProductStatus, type Product } from '../../../types/product.types';
import { formatBillingCycle } from '../../../utils/format.utils';
import type { CreateProductDto, UpdateProductDto } from '../../../api/products.api';

interface ProductFormProps {
  initialValues?: Product;
  isEdit: boolean;
  onSubmit: (dto: CreateProductDto | UpdateProductDto) => Promise<void>;
}

interface FormData {
  name: string;
  description: string;
  priceInput: string;
  billingCycle: BillingCycle | '';
  status: ProductStatus;
}

interface FormErrors {
  name?: string;
  description?: string;
  priceInput?: string;
  billingCycle?: string;
}

const CYCLE_OPTIONS: { value: BillingCycle; sub: string }[] = [
  { value: BillingCycle.MONTHLY,    sub: '1x / mês' },
  { value: BillingCycle.QUARTERLY,  sub: '1x / trim.' },
  { value: BillingCycle.SEMIANNUAL, sub: '1x / sem.' },
  { value: BillingCycle.ANNUAL,     sub: '1x / ano' },
];

function centsToDisplay(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

function priceToCents(value: string): number {
  return Math.round(parseFloat(value.replace(',', '.')) * 100);
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Nome obrigatório';
  } else if (data.name.trim().length < 3) {
    errors.name = 'Mínimo 3 caracteres';
  } else if (data.name.length > 120) {
    errors.name = 'Máximo 120 caracteres';
  }

  if (data.description.length > 500) {
    errors.description = 'Máximo 500 caracteres';
  }

  if (!data.priceInput) {
    errors.priceInput = 'Preço obrigatório';
  } else {
    const n = parseFloat(data.priceInput.replace(',', '.'));
    if (isNaN(n) || n <= 0) errors.priceInput = 'Preço inválido';
  }

  if (!data.billingCycle) {
    errors.billingCycle = 'Selecione o ciclo de cobrança';
  }

  return errors;
}

export function ProductForm({ initialValues, isEdit, onSubmit }: ProductFormProps) {
  const [form, setForm] = useState<FormData>({
    name: initialValues?.name ?? '',
    description: initialValues?.description ?? '',
    priceInput: initialValues ? centsToDisplay(initialValues.price) : '',
    billingCycle: initialValues?.billingCycle ?? '',
    status: initialValues?.status ?? ProductStatus.ACTIVE,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const dto: CreateProductDto | UpdateProductDto = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: priceToCents(form.priceInput),
      billingCycle: form.billingCycle as BillingCycle,
      ...(isEdit ? { status: form.status } : {}),
    };

    try {
      await onSubmit(dto);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar produto');
      setSubmitting(false);
    }
  }

  const descLen = form.description.length;
  const descClass =
    descLen > 480 ? 'char-counter char-counter--limit' :
    descLen > 400 ? 'char-counter char-counter--near' :
    'char-counter';

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      <Input
        label="Nome do produto"
        value={form.name}
        onChange={e => set('name', e.target.value)}
        placeholder="Ex: Plano Pro"
        error={errors.name}
        maxLength={120}
      />

      <div className="field">
        <label className="field-label">Descrição <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span></label>
        <div className={`field-wrap field-wrap--textarea${errors.description ? ' field-wrap--error' : ''}`}>
          <textarea
            className="field-textarea"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Descreva o que está incluso no plano..."
            maxLength={500}
            rows={3}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {errors.description
            ? <span className="field-error">{errors.description}</span>
            : <span />
          }
          <span className={descClass}>{descLen}/500</span>
        </div>
      </div>

      <Input
        label="Preço (R$)"
        value={form.priceInput}
        onChange={e => set('priceInput', e.target.value)}
        placeholder="Ex: 29,90"
        error={errors.priceInput}
        hint="Informe o valor em reais. Ex: 99,90"
      />

      <div className="field">
        <label className="field-label">Ciclo de cobrança</label>
        <div className="cycle-selector">
          {CYCLE_OPTIONS.map(opt => (
            <div
              key={opt.value}
              className={`cycle-option${form.billingCycle === opt.value ? ' cycle-option--selected' : ''}`}
              onClick={() => set('billingCycle', opt.value)}
              role="radio"
              aria-checked={form.billingCycle === opt.value}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && set('billingCycle', opt.value)}
            >
              <span className="cycle-option__label">{formatBillingCycle(opt.value)}</span>
              <span className="cycle-option__sub">{opt.sub}</span>
            </div>
          ))}
        </div>
        {errors.billingCycle && (
          <span className="field-error">{errors.billingCycle}</span>
        )}
      </div>

      {isEdit && (
        <div className="field">
          <label className="field-label">Status</label>
          <div className="filter-tabs">
            {[ProductStatus.ACTIVE, ProductStatus.INACTIVE].map(s => (
              <button
                key={s}
                type="button"
                className={`filter-tab${form.status === s ? ' filter-tab--active' : ''}`}
                onClick={() => set('status', s)}
              >
                {s === ProductStatus.ACTIVE ? 'Ativo' : 'Inativo'}
              </button>
            ))}
          </div>
        </div>
      )}

      {submitError && (
        <div className="alert alert--danger product-form__error">{submitError}</div>
      )}

      <div className="product-form__actions">
        <Button type="submit" variant="primary" loading={submitting}>
          {isEdit ? 'Salvar alterações' : 'Criar produto'}
        </Button>
      </div>
    </form>
  );
}
