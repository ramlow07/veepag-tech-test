/**
 * Database seed script — populates products, subscriptions, and transactions
 * for local development and manual testing.
 *
 * Usage:  npm run seed
 *
 * WARNING: clears ALL existing data in the collections before seeding.
 */

// Load .env (dotenv is available transitively via @nestjs/config)
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config();
} catch {
  // dotenv not available — rely on environment variables
}

import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017/veepag';

const daysAgo = (n: number): Date =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const oid = () => new mongoose.Types.ObjectId();

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db!;
  const Products = db.collection('products');
  const Subscriptions = db.collection('subscriptions');
  const Transactions = db.collection('transactions');

  // ── Clear ──────────────────────────────────────────────────────────────────
  await Promise.all([
    Products.deleteMany({}),
    Subscriptions.deleteMany({}),
    Transactions.deleteMany({}),
  ]);
  console.log('🧹 Cleared existing collections');

  // ── Products ───────────────────────────────────────────────────────────────
  const starterId = oid();
  const proId = oid();
  const businessId = oid();
  const enterpriseId = oid();

  await Products.insertMany([
    {
      _id: starterId,
      name: 'Plano Starter',
      description:
        'Ideal para freelancers e pequenos projetos. Acesso às funcionalidades essenciais da plataforma.',
      price: 2990, // R$ 29,90
      currency: 'BRL',
      billingCycle: 'MONTHLY',
      status: 'ACTIVE',
      createdAt: daysAgo(120),
      updatedAt: daysAgo(120),
    },
    {
      _id: proId,
      name: 'Plano Pro',
      description:
        'Para profissionais e equipes em crescimento. Recursos avançados e suporte prioritário.',
      price: 8990, // R$ 89,90
      currency: 'BRL',
      billingCycle: 'MONTHLY',
      status: 'ACTIVE',
      createdAt: daysAgo(120),
      updatedAt: daysAgo(120),
    },
    {
      _id: businessId,
      name: 'Plano Business',
      description:
        'Solução completa para empresas. Relatórios avançados, API dedicada e gerente de conta.',
      price: 19990, // R$ 199,90
      currency: 'BRL',
      billingCycle: 'QUARTERLY',
      status: 'ACTIVE',
      createdAt: daysAgo(120),
      updatedAt: daysAgo(120),
    },
    {
      _id: enterpriseId,
      name: 'Plano Enterprise',
      description:
        'Para grandes operações com alta demanda. SLA garantido, infraestrutura dedicada e suporte 24/7.',
      price: 59990, // R$ 599,90
      currency: 'BRL',
      billingCycle: 'ANNUAL',
      status: 'ACTIVE',
      createdAt: daysAgo(120),
      updatedAt: daysAgo(120),
    },
  ]);
  console.log('✅ Created 4 products');

  // ── Subscription IDs ───────────────────────────────────────────────────────
  // João Silva       CPF: 529.982.247-25  raw: 52998224725  (3 subs)
  // Maria Santos     CPF: 111.444.777-35  raw: 11144477735  (3 subs)
  // Carlos Oliveira  CPF: 987.654.321-00  raw: 98765432100  (2 subs)
  // Ana Pereira      CPF: 123.456.789-09  raw: 12345678909  (2 subs)
  // Roberto Lima     CPF: 321.654.987-91  raw: 32165498791  (2 subs)

  const subJoaoPro = oid();
  const subJoaoStarter = oid();
  const subJoaoBusiness = oid();

  const subMariaBusiness = oid();
  const subMariaStarter = oid();
  const subMariaEnterprise = oid();

  const subCarlosEnterprise = oid();
  const subCarlosPro = oid();

  const subAnaStarter = oid();
  const subAnaBusiness = oid();

  const subRobertoPro = oid();
  const subRobertoEnterprise = oid();

  // ── Subscriptions (12) ─────────────────────────────────────────────────────
  await Subscriptions.insertMany([
    // ─ João Silva (52998224725) ─────────────────────────────────────────────
    {
      _id: subJoaoPro,
      productId: proId,
      productSnapshot: { name: 'Plano Pro', price: 8990, currency: 'BRL', billingCycle: 'MONTHLY' },
      customerName: 'João Silva',
      customerEmail: 'joao.silva@email.com',
      customerCpf: '52998224725',
      status: 'ACTIVE',
      cancelledAt: null,
      cancellationReason: null,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(60),
    },
    {
      _id: subJoaoStarter,
      productId: starterId,
      productSnapshot: { name: 'Plano Starter', price: 2990, currency: 'BRL', billingCycle: 'MONTHLY' },
      customerName: 'João Silva',
      customerEmail: 'joao.silva@email.com',
      customerCpf: '52998224725',
      status: 'CANCELLED',
      cancelledAt: daysAgo(65),
      cancellationReason: 'Migração para plano superior',
      createdAt: daysAgo(90),
      updatedAt: daysAgo(65),
    },
    {
      _id: subJoaoBusiness,
      productId: businessId,
      productSnapshot: { name: 'Plano Business', price: 19990, currency: 'BRL', billingCycle: 'QUARTERLY' },
      customerName: 'João Silva',
      customerEmail: 'joao.silva@email.com',
      customerCpf: '52998224725',
      status: 'PENDING',
      cancelledAt: null,
      cancellationReason: null,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },

    // ─ Maria Santos (11144477735) ───────────────────────────────────────────
    {
      _id: subMariaBusiness,
      productId: businessId,
      productSnapshot: { name: 'Plano Business', price: 19990, currency: 'BRL', billingCycle: 'QUARTERLY' },
      customerName: 'Maria Santos',
      customerEmail: 'maria.santos@email.com',
      customerCpf: '11144477735',
      status: 'ACTIVE',
      cancelledAt: null,
      cancellationReason: null,
      createdAt: daysAgo(110),
      updatedAt: daysAgo(20),
    },
    {
      _id: subMariaStarter,
      productId: starterId,
      productSnapshot: { name: 'Plano Starter', price: 2990, currency: 'BRL', billingCycle: 'MONTHLY' },
      customerName: 'Maria Santos',
      customerEmail: 'maria.santos@email.com',
      customerCpf: '11144477735',
      status: 'PAYMENT_FAILED',
      cancelledAt: null,
      cancellationReason: null,
      createdAt: daysAgo(8),
      updatedAt: daysAgo(8),
    },
    {
      _id: subMariaEnterprise,
      productId: enterpriseId,
      productSnapshot: { name: 'Plano Enterprise', price: 59990, currency: 'BRL', billingCycle: 'ANNUAL' },
      customerName: 'Maria Santos',
      customerEmail: 'maria.santos@email.com',
      customerCpf: '11144477735',
      status: 'ACTIVE',
      cancelledAt: null,
      cancellationReason: null,
      createdAt: daysAgo(15),
      updatedAt: daysAgo(15),
    },

    // ─ Carlos Oliveira (98765432100) ────────────────────────────────────────
    {
      _id: subCarlosEnterprise,
      productId: enterpriseId,
      productSnapshot: { name: 'Plano Enterprise', price: 59990, currency: 'BRL', billingCycle: 'ANNUAL' },
      customerName: 'Carlos Oliveira',
      customerEmail: 'carlos.oliveira@email.com',
      customerCpf: '98765432100',
      status: 'ACTIVE',
      cancelledAt: null,
      cancellationReason: null,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(45),
    },
    {
      _id: subCarlosPro,
      productId: proId,
      productSnapshot: { name: 'Plano Pro', price: 8990, currency: 'BRL', billingCycle: 'MONTHLY' },
      customerName: 'Carlos Oliveira',
      customerEmail: 'carlos.oliveira@email.com',
      customerCpf: '98765432100',
      status: 'CANCELLED',
      cancelledAt: daysAgo(50),
      cancellationReason: 'Serviço não atende às necessidades atuais',
      createdAt: daysAgo(80),
      updatedAt: daysAgo(50),
    },

    // ─ Ana Pereira (12345678909) ────────────────────────────────────────────
    {
      _id: subAnaStarter,
      productId: starterId,
      productSnapshot: { name: 'Plano Starter', price: 2990, currency: 'BRL', billingCycle: 'MONTHLY' },
      customerName: 'Ana Pereira',
      customerEmail: 'ana.pereira@email.com',
      customerCpf: '12345678909',
      status: 'ACTIVE',
      cancelledAt: null,
      cancellationReason: null,
      createdAt: daysAgo(20),
      updatedAt: daysAgo(20),
    },
    {
      _id: subAnaBusiness,
      productId: businessId,
      productSnapshot: { name: 'Plano Business', price: 19990, currency: 'BRL', billingCycle: 'QUARTERLY' },
      customerName: 'Ana Pereira',
      customerEmail: 'ana.pereira@email.com',
      customerCpf: '12345678909',
      status: 'PAYMENT_FAILED',
      cancelledAt: null,
      cancellationReason: null,
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },

    // ─ Roberto Lima (32165498791) ───────────────────────────────────────────
    {
      _id: subRobertoPro,
      productId: proId,
      productSnapshot: { name: 'Plano Pro', price: 8990, currency: 'BRL', billingCycle: 'MONTHLY' },
      customerName: 'Roberto Lima',
      customerEmail: 'roberto.lima@email.com',
      customerCpf: '32165498791',
      status: 'ACTIVE',
      cancelledAt: null,
      cancellationReason: null,
      createdAt: daysAgo(55),
      updatedAt: daysAgo(55),
    },
    {
      _id: subRobertoEnterprise,
      productId: enterpriseId,
      productSnapshot: { name: 'Plano Enterprise', price: 59990, currency: 'BRL', billingCycle: 'ANNUAL' },
      customerName: 'Roberto Lima',
      customerEmail: 'roberto.lima@email.com',
      customerCpf: '32165498791',
      status: 'PENDING',
      cancelledAt: null,
      cancellationReason: null,
      createdAt: daysAgo(0),
      updatedAt: daysAgo(0),
    },
  ]);
  console.log('✅ Created 12 subscriptions');

  // ── Transactions (15) ──────────────────────────────────────────────────────
  // PENDING subs have no transactions (payment didn't run yet).
  // ACTIVE subs: at least 1 APPROVED, some have 2 (renewal simulation).
  // PAYMENT_FAILED subs: 1 DECLINED.
  // CANCELLED subs: 1 APPROVED (from when they were active).

  await Transactions.insertMany([
    // João Pro (ACTIVE) — initial + renewal = 2
    {
      subscriptionId: subJoaoPro,
      amount: 8990, currency: 'BRL', status: 'APPROVED', failureReason: null,
      paymentDetails: { cardHolderName: 'JOAO SILVA', cardLastFour: '1234', cardBrand: 'visa', expiryMonth: 12, expiryYear: 2027 },
      processedAt: daysAgo(60), createdAt: daysAgo(60), updatedAt: daysAgo(60),
    },
    {
      subscriptionId: subJoaoPro,
      amount: 8990, currency: 'BRL', status: 'APPROVED', failureReason: null,
      paymentDetails: { cardHolderName: 'JOAO SILVA', cardLastFour: '1234', cardBrand: 'visa', expiryMonth: 12, expiryYear: 2027 },
      processedAt: daysAgo(30), createdAt: daysAgo(30), updatedAt: daysAgo(30),
    },

    // João Starter (CANCELLED) — was approved once = 1
    {
      subscriptionId: subJoaoStarter,
      amount: 2990, currency: 'BRL', status: 'APPROVED', failureReason: null,
      paymentDetails: { cardHolderName: 'JOAO SILVA', cardLastFour: '1234', cardBrand: 'visa', expiryMonth: 12, expiryYear: 2027 },
      processedAt: daysAgo(90), createdAt: daysAgo(90), updatedAt: daysAgo(90),
    },

    // João Business (PENDING) — no transactions

    // Maria Business (ACTIVE) — initial + renewal = 2
    {
      subscriptionId: subMariaBusiness,
      amount: 19990, currency: 'BRL', status: 'APPROVED', failureReason: null,
      paymentDetails: { cardHolderName: 'MARIA SANTOS', cardLastFour: '5678', cardBrand: 'mastercard', expiryMonth: 6, expiryYear: 2028 },
      processedAt: daysAgo(110), createdAt: daysAgo(110), updatedAt: daysAgo(110),
    },
    {
      subscriptionId: subMariaBusiness,
      amount: 19990, currency: 'BRL', status: 'APPROVED', failureReason: null,
      paymentDetails: { cardHolderName: 'MARIA SANTOS', cardLastFour: '5678', cardBrand: 'mastercard', expiryMonth: 6, expiryYear: 2028 },
      processedAt: daysAgo(20), createdAt: daysAgo(20), updatedAt: daysAgo(20),
    },

    // Maria Starter (PAYMENT_FAILED) — declined = 1
    {
      subscriptionId: subMariaStarter,
      amount: 2990, currency: 'BRL', status: 'DECLINED', failureReason: 'insufficient_funds',
      paymentDetails: { cardHolderName: 'MARIA SANTOS', cardLastFour: '0002', cardBrand: 'elo', expiryMonth: 3, expiryYear: 2026 },
      processedAt: daysAgo(8), createdAt: daysAgo(8), updatedAt: daysAgo(8),
    },

    // Maria Enterprise (ACTIVE) — initial + renewal = 2
    {
      subscriptionId: subMariaEnterprise,
      amount: 59990, currency: 'BRL', status: 'APPROVED', failureReason: null,
      paymentDetails: { cardHolderName: 'MARIA SANTOS', cardLastFour: '5678', cardBrand: 'mastercard', expiryMonth: 6, expiryYear: 2028 },
      processedAt: daysAgo(15), createdAt: daysAgo(15), updatedAt: daysAgo(15),
    },
    {
      subscriptionId: subMariaEnterprise,
      amount: 59990, currency: 'BRL', status: 'APPROVED', failureReason: null,
      paymentDetails: { cardHolderName: 'MARIA SANTOS', cardLastFour: '5678', cardBrand: 'mastercard', expiryMonth: 6, expiryYear: 2028 },
      processedAt: daysAgo(2), createdAt: daysAgo(2), updatedAt: daysAgo(2),
    },

    // Carlos Enterprise (ACTIVE) — initial = 1
    {
      subscriptionId: subCarlosEnterprise,
      amount: 59990, currency: 'BRL', status: 'APPROVED', failureReason: null,
      paymentDetails: { cardHolderName: 'CARLOS OLIVEIRA', cardLastFour: '9999', cardBrand: 'amex', expiryMonth: 11, expiryYear: 2029 },
      processedAt: daysAgo(45), createdAt: daysAgo(45), updatedAt: daysAgo(45),
    },

    // Carlos Pro (CANCELLED) — approved once = 1
    {
      subscriptionId: subCarlosPro,
      amount: 8990, currency: 'BRL', status: 'APPROVED', failureReason: null,
      paymentDetails: { cardHolderName: 'CARLOS OLIVEIRA', cardLastFour: '9999', cardBrand: 'amex', expiryMonth: 11, expiryYear: 2029 },
      processedAt: daysAgo(80), createdAt: daysAgo(80), updatedAt: daysAgo(80),
    },

    // Ana Starter (ACTIVE) — initial = 1
    {
      subscriptionId: subAnaStarter,
      amount: 2990, currency: 'BRL', status: 'APPROVED', failureReason: null,
      paymentDetails: { cardHolderName: 'ANA PEREIRA', cardLastFour: '4321', cardBrand: 'hipercard', expiryMonth: 9, expiryYear: 2026 },
      processedAt: daysAgo(20), createdAt: daysAgo(20), updatedAt: daysAgo(20),
    },

    // Ana Business (PAYMENT_FAILED) — declined = 1
    {
      subscriptionId: subAnaBusiness,
      amount: 19990, currency: 'BRL', status: 'DECLINED', failureReason: 'do_not_honor',
      paymentDetails: { cardHolderName: 'ANA PEREIRA', cardLastFour: '0000', cardBrand: 'visa', expiryMonth: 9, expiryYear: 2026 },
      processedAt: daysAgo(3), createdAt: daysAgo(3), updatedAt: daysAgo(3),
    },

    // Roberto Pro (ACTIVE) — initial + renewal = 2
    {
      subscriptionId: subRobertoPro,
      amount: 8990, currency: 'BRL', status: 'APPROVED', failureReason: null,
      paymentDetails: { cardHolderName: 'ROBERTO LIMA', cardLastFour: '7777', cardBrand: 'mastercard', expiryMonth: 7, expiryYear: 2027 },
      processedAt: daysAgo(55), createdAt: daysAgo(55), updatedAt: daysAgo(55),
    },
    {
      subscriptionId: subRobertoPro,
      amount: 8990, currency: 'BRL', status: 'APPROVED', failureReason: null,
      paymentDetails: { cardHolderName: 'ROBERTO LIMA', cardLastFour: '7777', cardBrand: 'mastercard', expiryMonth: 7, expiryYear: 2027 },
      processedAt: daysAgo(25), createdAt: daysAgo(25), updatedAt: daysAgo(25),
    },

    // Roberto Enterprise (PENDING) — no transactions
  ]);
  console.log('✅ Created 15 transactions');

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(64));
  console.log('📋  SEED SUMMARY');
  console.log('═'.repeat(64));

  console.log('\n🧑‍💼  Test CPFs for "Minhas Assinaturas":');
  console.log('  João Silva       529.982.247-25   Pro ACTIVE · Starter CANCELLED · Business PENDING');
  console.log('  Maria Santos     111.444.777-35   Business ACTIVE · Starter PAYMENT_FAILED · Enterprise ACTIVE');
  console.log('  Carlos Oliveira  987.654.321-00   Enterprise ACTIVE · Pro CANCELLED');
  console.log('  Ana Pereira      123.456.789-09   Starter ACTIVE · Business PAYMENT_FAILED');
  console.log('  Roberto Lima     321.654.987-91   Pro ACTIVE · Enterprise PENDING');

  console.log('\n🛒  Checkout URLs:');
  console.log(`  /checkout/${starterId.toString()}   Plano Starter  R$29,90/mês`);
  console.log(`  /checkout/${proId.toString()}   Plano Pro      R$89,90/mês`);
  console.log(`  /checkout/${businessId.toString()}   Plano Business R$199,90/trimestre`);
  console.log(`  /checkout/${enterpriseId.toString()}   Plano Enterprise R$599,90/ano`);

  console.log('\n💳  Payment simulation (card last 4 digits):');
  console.log('  Any digits (valid expiry)  → APPROVED');
  console.log('  0002                       → DECLINED — insufficient_funds');
  console.log('  0000                       → DECLINED — do_not_honor');
  console.log('  Expired date               → DECLINED — card_expired');

  console.log('\n' + '═'.repeat(64));

  await mongoose.disconnect();
  console.log('\n✅ Seed complete — database is ready for testing!\n');
}

seed().catch((err: Error) => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
