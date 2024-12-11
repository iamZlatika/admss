import { ACCOUNT_PAYMENT_METHODS } from "common/constants/account-options";
import { CurrencyInput, DateInput } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";
import { useStore } from "store/hooks";

export const PayOffInfo = observer((): ReactElement => {
    const store = useStore().accountStore;

    const {
        accountTakePayment: {
            PayOffBalancePaydown,
            PayOffDownPayment,
            PayOffFees,
            PaymentDate,
            PaymentMethod,
            CheckNumber,
            PaymentTakenBy,
        },
        accountExtData: { Total_Paid },
        changeAccountTakePayment,
        accountDrawers,
    } = store;

    return (
        <div className='take-payment__card'>
            <h3 className='take-payment__title'>Pay Off Account</h3>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Payment Date</label>
                <DateInput
                    className='take-payment__input'
                    date={PaymentDate}
                    onChange={({ target: { value } }) =>
                        changeAccountTakePayment("PaymentDate", Number(value))
                    }
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Pmt Method</label>
                <Dropdown
                    id='pmtMethod'
                    options={[...ACCOUNT_PAYMENT_METHODS]}
                    optionValue='name'
                    optionLabel='name'
                    value={PaymentMethod}
                    onChange={(e) => changeAccountTakePayment("PaymentMethod", e.value)}
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Check#</label>
                <InputText
                    id='checkNumber'
                    value={CheckNumber}
                    onChange={(e) => changeAccountTakePayment("CheckNumber", e.target.value)}
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Balance Paydown</label>
                <CurrencyInput
                    className='take-payment__input'
                    value={PayOffBalancePaydown}
                    onChange={(e) => changeAccountTakePayment("PayOffBalancePaydown", e.value || 0)}
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Down Payment</label>
                <CurrencyInput
                    className='take-payment__input'
                    value={PayOffDownPayment}
                    onChange={(e) => changeAccountTakePayment("PayOffDownPayment", e.value || 0)}
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Fees Payment</label>
                <CurrencyInput
                    className='take-payment__input'
                    value={PayOffFees}
                    onChange={(e) => changeAccountTakePayment("PayOffFees", e.value || 0)}
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label take-payment__label--green'>
                    Total Paid:
                </label>
                <span className='take-payment__value take-payment__value--green'>
                    $ {Total_Paid?.toFixed(2) || "0.00"}
                </span>
            </div>
            <hr className='form-line' />
            <div className='take-payment__item'>
                <label className='take-payment__label'>Cash Drawer</label>
                <Dropdown
                    id='cashDrawer'
                    optionLabel='drawer'
                    optionValue='drawer'
                    onChange={(e) => changeAccountTakePayment("CashDrawer", e.value)}
                    options={accountDrawers}
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Payoff Taken By</label>
                <InputText
                    id='payoffTakenBy'
                    value={PaymentTakenBy}
                    onChange={(e) => changeAccountTakePayment("PaymentTakenBy", e.target.value)}
                />
            </div>
            <Button label='Apply Payment' className='pay-off__button' outlined />
        </div>
    );
});
