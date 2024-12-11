import { DashboardDialog, DashboardDialogProps } from "dashboard/common/dialog";
import "./index.css";
import { CurrencyInput } from "dashboard/common/form/inputs";
import { Dropdown } from "primereact/dropdown";
import { useMemo, useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { addAccountFee } from "http/services/accounts.service";
import { useParams } from "react-router-dom";
import { useToast } from "dashboard/common/toast";
import { Status } from "common/models/base-response";
import { TOAST_LIFETIME } from "common/settings";
import { ACCOUNT_FEE_TYPES } from "common/constants/account-options";

interface AddFeeDialogProps extends DashboardDialogProps {}
type AddFeeInfo = {
    type: string;
    other: string;
    amount: number;
    reason: string;
    description: string;
};

const initialAddFee: AddFeeInfo = {
    type: "",
    other: "",
    amount: 0,
    reason: "",
    description: "",
};

export const AddFeeDialog = ({ onHide, action, visible }: AddFeeDialogProps) => {
    const { id } = useParams();
    const [addFee, setAddFee] = useState<AddFeeInfo>(initialAddFee);
    const toast = useToast();

    const handleSaveAddFee = () => {
        addAccountFee(id!, addFee).then((res) => {
            if (res?.status === Status.ERROR) {
                toast.current?.show({
                    severity: "error",
                    summary: Status.ERROR,
                    detail: res.error,
                    life: TOAST_LIFETIME,
                });
            } else {
                action && action();
                toast.current?.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Fee added successfully!",
                    life: TOAST_LIFETIME,
                });
                setAddFee(initialAddFee);
                onHide();
            }
        });
    };

    const buttonDisabled = useMemo(() => {
        return !addFee.type || !addFee.amount || !addFee.reason || !addFee.description;
    }, [addFee]);

    return (
        <DashboardDialog
            className='dialog__add-fee add-fee'
            footer='Save'
            header='Add Fee'
            visible={visible}
            onHide={onHide}
            action={handleSaveAddFee}
            buttonDisabled={buttonDisabled}
            cancelButton
        >
            <span className='p-float-label'>
                <Dropdown
                    className='w-full'
                    value={addFee.type}
                    onChange={({ value }) => {
                        if (value !== "Other") {
                            setAddFee({ ...addFee, type: value, other: "" });
                        } else {
                            setAddFee({ ...addFee, type: value });
                        }
                    }}
                    options={[...ACCOUNT_FEE_TYPES]}
                    optionLabel='name'
                    optionValue='name'
                    pt={{
                        wrapper: {
                            style: { minHeight: "235px" },
                        },
                    }}
                />
                <label className='float-label'>Type</label>
            </span>
            <span className='p-float-label'>
                <InputText
                    className='w-full'
                    disabled={addFee.type !== "Other"}
                    value={addFee.other}
                    onChange={({ target: { value } }) => {
                        setAddFee({ ...addFee, other: value });
                    }}
                />
                <label className='float-label'>Other</label>
            </span>

            <div className='splitter mb-2'>
                <hr className='splitter__line flex-1' />
            </div>

            <div className='add-fee__control'>
                <CurrencyInput
                    required
                    className='add-fee__input'
                    value={addFee.amount}
                    onChange={({ value }) => setAddFee({ ...addFee, amount: value || 0 })}
                    title='Principal'
                    labelPosition='top'
                />
            </div>

            <span className='p-float-label'>
                <InputText
                    required
                    className='w-full'
                    value={addFee.reason}
                    onChange={({ target: { value } }) => {
                        setAddFee({ ...addFee, reason: value });
                    }}
                />
                <label className='float-label'>Reason</label>
            </span>

            <span className='p-float-label'>
                <InputTextarea
                    className='w-full add-fee__area'
                    value={addFee.description}
                    onChange={({ target: { value } }) => {
                        setAddFee({ ...addFee, description: value });
                    }}
                />
                <label className='float-label'>Description</label>
            </span>

            <p className='add-fee__remember'>
                <span className='add-fee__remember--bold'>REMEMBER!</span> Crediting fees is not the
                same as taking a payment. Use this screen to add or remove a charge. If you are
                taking a payment, use the "Take Payment" Screen, and select "Misc / Fee Payment" as
                the payment type.
            </p>
        </DashboardDialog>
    );
};
