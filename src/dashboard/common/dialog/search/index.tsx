import { ReactElement, useCallback, useEffect, useState } from "react";
import { DashboardDialog, DashboardDialogProps } from "..";
import { InputText } from "primereact/inputtext";
import "./index.css";
import { Dropdown, DropdownProps } from "primereact/dropdown";
import {
    ListData,
    MakesListData,
    getAutoMakeModelList,
    getInventoryAutomakesList,
} from "http/services/inventory-service";

import defaultMakesLogo from "assets/images/default-makes-logo.svg";
import { ContactType } from "common/models/contact";
import { getContactsTypeList } from "http/services/contacts-service";
import { InputNumber } from "primereact/inputnumber";

const INPUT_NUMBER_MAX_LENGTH = 10;

export enum SEARCH_FORM_TYPE {
    CONTACTS,
    INVENTORY,
}

enum DROPDOWN_TYPE {
    MAKE = "Make",
    MODEL = "Model",
    TYPE = "type",
}

export enum SEARCH_FIELD_TYPE {
    TEXT = "text",
    NUMBER = "number",
    DROPDOWN = "dropdown",
}

export interface SearchField<T> {
    key: keyof T & string;
    label?: string;
    value: string | undefined;
    type: SEARCH_FIELD_TYPE;
}
interface AdvancedSearchDialogProps<T> extends DashboardDialogProps {
    onInputChange: (key: keyof T, value: string) => void;
    fields: SearchField<T>[];
    onSearchClear?: (key: keyof T) => void;
    searchForm: SEARCH_FORM_TYPE;
}
export const AdvancedSearchDialog = <T,>({
    visible,
    buttonDisabled,
    onHide,
    onInputChange,
    onSearchClear,
    fields,
    action,
    searchForm,
}: AdvancedSearchDialogProps<T>): ReactElement => {
    const [automakesList, setAutomakesList] = useState<MakesListData[]>([]);
    const [automakesModelList, setAutomakesModelList] = useState<ListData[]>([]);
    const [typeList, setTypeList] = useState<ContactType[]>([]);
    const [selectedType, setSelectedType] = useState<string>("");

    const autoMake = fields.find((field) => field.key === "Make")?.value;

    useEffect(() => {
        if (searchForm === SEARCH_FORM_TYPE.INVENTORY) {
            getInventoryAutomakesList().then((list) => {
                if (list) {
                    const upperCasedList = list.map((item) => ({
                        ...item,
                        name: item.name.toUpperCase(),
                    }));
                    setAutomakesList(upperCasedList);
                }
            });
        }
        if (searchForm === SEARCH_FORM_TYPE.CONTACTS) {
            getContactsTypeList("0").then((response) => {
                if (response) {
                    const types = response as ContactType[];
                    setTypeList(types);
                }
            });
        }
    }, []);

    const handleSelectMake = useCallback(() => {
        if (!autoMake) return;
        const formatedMake = autoMake.toLowerCase().replaceAll(" ", "");
        getAutoMakeModelList(formatedMake).then((list) => {
            if (list && Object.keys(list).length) {
                setAutomakesModelList(list);
            } else {
                setAutomakesModelList([]);
            }
        });
    }, [autoMake]);

    useEffect(() => {
        if (autoMake) handleSelectMake();
    }, [handleSelectMake, autoMake]);

    const selectedAutoMakesTemplate = (option: MakesListData, props: DropdownProps) => {
        if (option) {
            return (
                <div className='flex align-items-center'>
                    <img
                        alt={option.name}
                        src={option?.logo || defaultMakesLogo}
                        className='mr-2 dropdown-icon'
                    />
                    <div>{option.name}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const autoMakesOptionTemplate = (option: MakesListData) => {
        return (
            <div className='flex align-items-center'>
                <img
                    alt={option.name}
                    src={option?.logo || defaultMakesLogo}
                    className='mr-2 dropdown-icon'
                />
                <div>{option.name}</div>
            </div>
        );
    };

    return (
        <DashboardDialog
            className='search-dialog'
            footer='Search'
            header='Advanced search'
            visible={visible}
            buttonDisabled={buttonDisabled}
            action={action}
            onHide={onHide}
            draggable
        >
            <div className='flex flex-column gap-4 pt-4'>
                {fields &&
                    fields.map(({ key, value, type, label }) => (
                        <span className='p-float-label p-input-icon-right' key={key}>
                            {type === SEARCH_FIELD_TYPE.TEXT && (
                                <InputText
                                    type='tel'
                                    className='w-full'
                                    value={value ?? ""}
                                    onChange={({ target }) => onInputChange(key, target.value)}
                                />
                            )}
                            {type === SEARCH_FIELD_TYPE.NUMBER && (
                                <InputNumber
                                    type='tel'
                                    className='w-full'
                                    useGrouping={false}
                                    maxLength={INPUT_NUMBER_MAX_LENGTH}
                                    value={Number(value) || null}
                                    onChange={({ value }) => {
                                        if (
                                            value &&
                                            value?.toString().length >= INPUT_NUMBER_MAX_LENGTH
                                        )
                                            return;
                                        onInputChange(key, value?.toString() || "");
                                    }}
                                />
                            )}
                            {type === SEARCH_FIELD_TYPE.DROPDOWN &&
                                searchForm === SEARCH_FORM_TYPE.INVENTORY && (
                                    <Dropdown
                                        className='w-full'
                                        optionLabel='name'
                                        optionValue='name'
                                        value={value ?? ""}
                                        filter
                                        editable
                                        valueTemplate={selectedAutoMakesTemplate}
                                        itemTemplate={autoMakesOptionTemplate}
                                        options={
                                            key === DROPDOWN_TYPE.MAKE
                                                ? automakesList
                                                : automakesModelList
                                        }
                                        onChange={({ target }) => onInputChange(key, target.value)}
                                    />
                                )}
                            {type === SEARCH_FIELD_TYPE.DROPDOWN &&
                                searchForm === SEARCH_FORM_TYPE.CONTACTS && (
                                    <Dropdown
                                        className='w-full'
                                        optionLabel='name'
                                        optionValue='id'
                                        value={
                                            typeList.find((type) => type.name === selectedType)?.id
                                        }
                                        filter
                                        options={typeList}
                                        onChange={({ target }) => {
                                            const selected = typeList.find(
                                                (type) => type.id === target.value
                                            );
                                            setSelectedType(selected?.name || "");
                                            onInputChange(key, target.value);
                                        }}
                                    />
                                )}
                            {value && onSearchClear && (
                                <i
                                    className={`pi pi-times cursor-pointer search-dialog__clear ${
                                        type === "dropdown" && "pr-4"
                                    }`}
                                    onClick={() => {
                                        if (key === DROPDOWN_TYPE.TYPE) setSelectedType("");
                                        onSearchClear(key);
                                    }}
                                />
                            )}
                            <label className='float-label'>{label || key}</label>
                        </span>
                    ))}
            </div>
        </DashboardDialog>
    );
};
