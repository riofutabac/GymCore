export class RenewMembershipDto {
  paymentMethod: string; // 'CASH', 'CARD', 'TRANSFER'
  amount: number;
  description?: string;
  paymentInfo?: any;
}