import { CurrencyInput } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { InputNumberProps } from "primereact/inputnumber";
import { ReactElement } from "react";
import { useStore } from "store/hooks";

interface PayOffItemProps extends InputNumberProps {
    numberSign?: "+" | "-" | "=";
}

const PayOffItem = observer(({ title, numberSign, ...props }: PayOffItemProps): ReactElement => {
    return (
        <div className='take-payment__item'>
            <label className='take-payment__label'>
                {numberSign && <span className='take-payment__sign'>({numberSign})</span>}
                &nbsp;
                {title}
            </label>
            <CurrencyInput className='take-payment__input' {...props} />
        </div>
    );
});

export const AccountCashDealInfo = observer((): ReactElement => {
    const store = useStore().accountStore;
    const {
        accountPaymentsInfo: { CashDealPayoff },
        accountTakePayment: {
            PayoffReserve,
            PayoffDiscount,
            PayoffLoanFees,
            PayoffServiceContractWithholding,
            PayoffGAPWithholding,
            PayoffVSIWithholding,
            PayoffMiscWithholding,
            PayoffMiscProfitComission,
        },
        changeAccountTakePayment,
    } = store;
    return (
        <div className='take-payment__card'>
            <h3 className='take-payment__title'>Cash Deal Payoff</h3>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Down Payment Balance</label>
                <span className='take-payment__value pr-8'>
                    $ {CashDealPayoff?.DownPaymentBalance}
                </span>
            </div>

            <hr className='form-line' />

            <div className='take-payment__item'>
                <label className='take-payment__label'>Amount Financed/Balance</label>
                <span className='take-payment__value pr-8'>
                    $ {CashDealPayoff?.AmountFinancedBalance}
                </span>
            </div>

            <PayOffItem
                title='Reserve'
                value={PayoffReserve}
                numberSign='-'
                onChange={({ value }) => changeAccountTakePayment("PayoffReserve", value || 0)}
            />

            <PayOffItem
                title='Discount'
                value={PayoffDiscount}
                numberSign='-'
                onChange={({ value }) => changeAccountTakePayment("PayoffDiscount", value || 0)}
            />

            <PayOffItem
                title='Loan Fees'
                value={PayoffLoanFees}
                numberSign='-'
                onChange={({ value }) => changeAccountTakePayment("PayoffLoanFees", value || 0)}
            />

            <PayOffItem
                title='Service Contract Withholding'
                value={PayoffServiceContractWithholding}
                numberSign='-'
                onChange={({ value }) =>
                    changeAccountTakePayment("PayoffServiceContractWithholding", value || 0)
                }
            />

            <PayOffItem
                title='GAP Withholding'
                value={PayoffGAPWithholding}
                numberSign='-'
                onChange={({ value }) =>
                    changeAccountTakePayment("PayoffGAPWithholding", value || 0)
                }
            />

            <PayOffItem
                title='VSI Withholding'
                value={PayoffVSIWithholding}
                numberSign='-'
                onChange={({ value }) =>
                    changeAccountTakePayment("PayoffVSIWithholding", value || 0)
                }
            />

            <PayOffItem
                title='Miscellaneous Withholding'
                value={PayoffMiscWithholding}
                numberSign='-'
                onChange={({ value }) =>
                    changeAccountTakePayment("PayoffMiscWithholding", value || 0)
                }
            />

            <PayOffItem
                title='Miscellaneous Profit/Commission'
                value={PayoffMiscProfitComission}
                numberSign='+'
                onChange={({ value }) =>
                    changeAccountTakePayment("PayoffMiscProfitComission", value || 0)
                }
            />

            <div className='take-payment__item'>
                <label className='take-payment__label'>
                    <span className='take-payment__sign'>(=) </span>Net Check from Lender
                </label>
                <span className='take-payment__value pr-8'>
                    $ {CashDealPayoff?.UnearnedInterest}
                </span>
            </div>
        </div>
    );
});