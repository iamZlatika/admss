import { ReportServiceColumns, ReportServices } from "common/models/reports";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { ReactElement, useEffect, useState } from "react";
import { ReportSelect } from "../../common";
import { Status } from "common/models/base-response";
import { TOAST_LIFETIME } from "common/settings";
import { getReportColumns } from "http/services/reports.service";
import { useStore } from "store/hooks";
import { useToast } from "dashboard/common/toast";

const dataSetValues: ReportServices[] = [
    ReportServices.INVENTORY,
    ReportServices.CONTACTS,
    ReportServices.DEALS,
    ReportServices.ACCOUNTS,
];

export const ReportColumnSelect = observer((): ReactElement => {
    const store = useStore().reportStore;
    const { report } = store;
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const toast = useToast();
    const [availableValues, setAvailableValues] = useState<ReportServiceColumns[]>([]);
    const [selectedValues, setSelectedValues] = useState<ReportServiceColumns[]>([]);
    const [dataSet, setDataSet] = useState<ReportServices | null>(null);

    useEffect(() => {
        if (report?.columns) {
            setSelectedValues(report.columns.filter(Boolean));
        }
        return () => {
            setSelectedValues([]);
            setAvailableValues([]);
            setDataSet(null);
        };
    }, [report]);

    useEffect(() => {
        const useruid = authUser?.useruid;
        if (dataSet && useruid)
            getReportColumns({ service: dataSet, useruid }).then((response) => {
                if (response?.status === Status.ERROR) {
                    toast.current?.show({
                        severity: "error",
                        summary: Status.ERROR,
                        detail: response?.error,
                        life: TOAST_LIFETIME,
                    });
                } else {
                    setAvailableValues(
                        response.filter(
                            (availableItem: ReportServiceColumns) =>
                                !selectedValues.some(
                                    (selectedItem) => selectedItem.data === availableItem.data
                                )
                        )
                    );
                }
            });
    }, [dataSet, authUser?.useruid]);

    useEffect(() => {
        store.reportColumns = selectedValues;
    }, [selectedValues]);

    const [currentItem, setCurrentItem] = useState<ReportServiceColumns | null>(null);
    const moveItem = (
        item: ReportServiceColumns,
        from: ReportServiceColumns[],
        to: ReportServiceColumns[],
        setFrom: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>,
        setTo: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>
    ) => {
        setFrom(from.filter((i) => i !== item));
        setTo([...to, item]);
        setCurrentItem(null);
    };

    const moveAllItems = (
        from: ReportServiceColumns[],
        to: ReportServiceColumns[],
        setFrom: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>,
        setTo: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>
    ) => {
        setTo([...to, ...from]);
        setFrom([]);
    };

    const changeAvailableOrder = (
        item: ReportServiceColumns,
        direction: "up" | "down" | "top" | "bottom"
    ) => {
        if (direction === "up") {
            const index = availableValues.indexOf(item);
            const newItems = [...availableValues];
            newItems.splice(index - 1, 0, newItems.splice(index, 1)[0]);
            setAvailableValues(newItems);
        } else if (direction === "down") {
            const index = availableValues.indexOf(item);
            const newItems = [...availableValues];
            newItems.splice(index + 1, 0, newItems.splice(index, 1)[0]);
            setAvailableValues(newItems);
        } else if (direction === "top") {
            const valuesWithoutItem = availableValues.filter((i) => i !== item);
            setAvailableValues([item, ...valuesWithoutItem]);
        } else if (direction === "bottom") {
            const valuesWithoutItem = availableValues.filter((i) => i !== item);
            setAvailableValues([...valuesWithoutItem, item]);
        }
    };

    const changeSelectedOrder = (
        item: ReportServiceColumns,
        direction: "up" | "down" | "top" | "bottom"
    ) => {
        if (direction === "up") {
            const index = selectedValues.indexOf(item);
            const newItems = [...selectedValues];
            newItems.splice(index - 1, 0, newItems.splice(index, 1)[0]);
            setSelectedValues(newItems);
        } else if (direction === "down") {
            const index = selectedValues.indexOf(item);
            const newItems = [...selectedValues];
            newItems.splice(index + 1, 0, newItems.splice(index, 1)[0]);
            setSelectedValues(newItems);
        } else if (direction === "top") {
            const valuesWithoutItem = selectedValues.filter((i) => i !== item);
            setSelectedValues([item, ...valuesWithoutItem]);
        } else if (direction === "bottom") {
            const valuesWithoutItem = selectedValues.filter((i) => i !== item);
            setSelectedValues([...valuesWithoutItem, item]);
        }
    };

    const handleItemDoubleClick = (item: ReportServiceColumns) => {
        if (availableValues.includes(item)) {
            moveItem(item, availableValues, selectedValues, setAvailableValues, setSelectedValues);
        } else if (selectedValues.includes(item)) {
            moveItem(item, selectedValues, availableValues, setSelectedValues, setAvailableValues);
        }
    };

    const ControlButton = (
        icon: string,
        action: () => void,
        tooltip: string,
        disabled?: boolean
    ) => {
        return (
            <Button
                className='report-control__button'
                icon={`pi pi-angle-${icon}`}
                disabled={disabled || !!report.isdefault}
                tooltip={tooltip}
                tooltipOptions={{ position: "mouse" }}
                outlined
                onClick={() => {
                    return action();
                }}
            />
        );
    };

    return (
        <div className='col-12 report-controls'>
            <div className='report-controls__top'>
                <span className='p-float-label'>
                    <Dropdown
                        className='report-controls__dropdown'
                        options={dataSetValues}
                        value={dataSet}
                        emptyMessage='-'
                        disabled={!!report.isdefault}
                        onChange={(e) => setDataSet(e.value)}
                        pt={{
                            wrapper: {
                                className: "capitalize",
                            },
                        }}
                    />
                    <label className='float-label'>Data Set</label>
                </span>
            </div>
            <div className='report-control'>
                {ControlButton(
                    "up",
                    () => currentItem && changeAvailableOrder(currentItem, "up"),
                    "Up",
                    availableValues.findIndex((i) => i === currentItem) === 0 || !currentItem
                )}
                {ControlButton(
                    "double-up",
                    () => currentItem && changeAvailableOrder(currentItem, "top"),
                    "Top",
                    availableValues.findIndex((i) => i === currentItem) === 0 || !currentItem
                )}
                {ControlButton(
                    "down",
                    () => currentItem && changeAvailableOrder(currentItem, "down"),
                    "Down",
                    availableValues.findIndex((i) => i === currentItem) ===
                        availableValues.length - 1 || !currentItem
                )}
                {ControlButton(
                    "double-down",
                    () => currentItem && changeAvailableOrder(currentItem, "bottom"),
                    "Bottom",
                    availableValues.findIndex((i) => i === currentItem) ===
                        availableValues.length - 1 || !currentItem
                )}
            </div>
            <ReportSelect
                header='Available'
                values={availableValues}
                currentItem={currentItem}
                onItemClick={(item) => setCurrentItem(item)}
                onItemDoubleClick={(item) => handleItemDoubleClick(item)}
            />
            <div className='report-control'>
                {ControlButton(
                    "right",
                    () =>
                        currentItem &&
                        moveItem(
                            currentItem,
                            availableValues,
                            selectedValues,
                            setAvailableValues,
                            setSelectedValues
                        ),
                    "Move Right",
                    !!selectedValues.includes(currentItem!) || !currentItem
                )}

                {ControlButton(
                    "double-right",
                    () =>
                        moveAllItems(
                            availableValues,
                            selectedValues,
                            setAvailableValues,
                            setSelectedValues
                        ),
                    "Move All",
                    !availableValues.length
                )}

                {ControlButton(
                    "left",
                    () =>
                        currentItem &&
                        moveItem(
                            currentItem,
                            selectedValues,
                            availableValues,
                            setSelectedValues,
                            setAvailableValues
                        ),
                    "Move Left",
                    !!availableValues.includes(currentItem!) || !currentItem
                )}

                {ControlButton(
                    "double-left",
                    () =>
                        moveAllItems(
                            selectedValues,
                            availableValues,
                            setSelectedValues,
                            setAvailableValues
                        ),
                    "Move All",
                    !selectedValues.length
                )}
            </div>
            <ReportSelect
                header='Selected'
                values={selectedValues}
                currentItem={currentItem}
                onItemClick={(item) => setCurrentItem(item)}
                onItemDoubleClick={(item) => handleItemDoubleClick(item)}
            />
            <div className='report-control'>
                {ControlButton(
                    "up",
                    () => currentItem && changeSelectedOrder(currentItem, "up"),
                    "Up",
                    selectedValues.findIndex((i) => i === currentItem) === 0 || !currentItem
                )}

                {ControlButton(
                    "double-up",
                    () => currentItem && changeSelectedOrder(currentItem, "top"),
                    "Top",
                    selectedValues.findIndex((i) => i === currentItem) === 0 || !currentItem
                )}

                {ControlButton(
                    "down",
                    () => currentItem && changeSelectedOrder(currentItem, "down"),
                    "Down",
                    selectedValues.findIndex((i) => i === currentItem) ===
                        selectedValues.length - 1 || !currentItem
                )}

                {ControlButton(
                    "double-down",
                    () => currentItem && changeSelectedOrder(currentItem, "bottom"),
                    "Bottom",
                    selectedValues.findIndex((i) => i === currentItem) ===
                        selectedValues.length - 1 || !currentItem
                )}
            </div>
        </div>
    );
});
