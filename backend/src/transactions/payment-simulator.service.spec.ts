import { FailureReason } from './enums/failure-reason.enum';
import { TransactionStatus } from './enums/transaction-status.enum';
import { PaymentSimulatorService } from './payment-simulator.service';

describe('PaymentSimulatorService', () => {
  let service: PaymentSimulatorService;

  const nextYear = new Date().getFullYear() + 1;

  const validCard = {
    cardHolderName: 'John Doe',
    cardLastFour: '1234',
    cardBrand: 'visa',
    expiryMonth: 12,
    expiryYear: nextYear,
  };

  beforeEach(() => {
    service = new PaymentSimulatorService();
  });

  it('approves a card with valid expiry and non-magic last four', () => {
    const result = service.simulate(validCard);
    expect(result.status).toBe(TransactionStatus.APPROVED);
    expect(result.failureReason).toBeNull();
  });

  it('declines an expired card (past year)', () => {
    const result = service.simulate({ ...validCard, expiryYear: 2020, expiryMonth: 1 });
    expect(result.status).toBe(TransactionStatus.DECLINED);
    expect(result.failureReason).toBe(FailureReason.CARD_EXPIRED);
  });

  it('declines when cardLastFour is 0000 (do_not_honor)', () => {
    const result = service.simulate({ ...validCard, cardLastFour: '0000' });
    expect(result.status).toBe(TransactionStatus.DECLINED);
    expect(result.failureReason).toBe(FailureReason.DO_NOT_HONOR);
  });

  it('declines when cardLastFour is 0002 (insufficient_funds)', () => {
    const result = service.simulate({ ...validCard, cardLastFour: '0002' });
    expect(result.status).toBe(TransactionStatus.DECLINED);
    expect(result.failureReason).toBe(FailureReason.INSUFFICIENT_FUNDS);
  });

  it('checks expiry priority: expired card wins over magic number', () => {
    // Even if it would be a do_not_honor, expired should be caught first
    const result = service.simulate({
      ...validCard,
      cardLastFour: '0000',
      expiryYear: 2020,
      expiryMonth: 1,
    });
    expect(result.failureReason).toBe(FailureReason.CARD_EXPIRED);
  });
});
