import { IinvoiceDetails } from "./common-model"

export function purchaseStatusDataAdd(): { readonly label: string, readonly value: string }[] {
    return (
        [
            { label: 'Draft', value: 'draft' },
            { label: 'Processing', value: 'processing' },
            { label: 'Received', value: 'received' },
        ]
    )
}
export function purchaseStatusData(): { readonly label: string, readonly value: string }[] {
    return (
        [
            { label: 'Draft', value: 'draft' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'Processing', value: 'processing' },
            { label: 'Received', value: 'received' },
            { label: 'Partially Received', value: 'partially_received' },
            { label: 'Returned', value: 'returned' },
        ]
    )
}
export function paymentTypeData(): { readonly label: string, readonly value: string }[] {
    return (
        [
            { label: 'Card', value: 'card' },
            { label: 'Cash', value: 'cash' },
            { label: 'Bank', value: 'bank' },
            { label: 'Cheque', value: 'cheque' },
        ]
    )
}
export function paymentStatusData(): { readonly label: string, readonly value: string }[] {
    return (
        [
            { label: 'Due', value: 'due' },
            { label: 'Paid', value: 'paid' },
            { label: 'Partially Paid', value: 'partially_paid' },
            { label: 'Credit', value: 'credit' },
        ]
    )
}
export function defaultInvoiceDetials(): IinvoiceDetails {
    return {
        logo: '/images/logo1.png',
        footer: "Thank You ! Please visit again",
        footer2: "شكرًا لك !",
        name: 'Poslix',
        tell: "09123456789",
        date: new Date(),
        isMultiLang: false,
        orderNo: 'Order No:',
        orderNo2: "المرجع",
        txtDate: 'Date:',
        txtDate2: "التاریخ",
        txtQty: "Qty",
        txtQty2: "الکمیه",
        txtItem: "Item",
        txtItem2: "بند الموارد",
        txtAmount: "Amount",
        txtAmount2: "السعر",
        txtTax: "Tax",
        txtTax2: "الضرائب",
        txtTotal: "Total",
        txtTotal2: "المجموع",
        txtCustomer: "Customer",
        txtCustomer2: "الزبون"
    }
}
export function BusinessTypeData(): { readonly label: string, readonly value: number }[] {
    return (
        [
            { label: 'Grocery', value: 1 },
            { label: 'Boutiques', value: 2 },
            { label: 'Tailor', value: 3 },
        ]
    )
}
export function productTypeData(): { readonly label: string, readonly value: string }[] {
    return (
        [
            { value: 'single', label: 'single' },
            { value: 'variable', label: 'Variation' },
            { value: 'package', label: 'package' },
            { value: 'tailoring_package', label: 'Tailoring Package' }
        ]
    )
}