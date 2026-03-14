// Type declaration for iyzipay module
declare module 'iyzipay' {
    interface IyzipayConfig {
        apiKey: string;
        secretKey: string;
        uri: string;
    }

    interface CheckoutFormInitialize {
        create(request: any, callback: (err: any, result: any) => void): void;
    }

    interface CheckoutFormRetrieve {
        retrieve(request: any, callback: (err: any, result: any) => void): void;
    }

    class Iyzipay {
        constructor(config: IyzipayConfig);
        checkoutFormInitialize: CheckoutFormInitialize;
        checkoutForm: CheckoutFormRetrieve;

        static CURRENCY: {
            TRY: string;
            EUR: string;
            USD: string;
            GBP: string;
        };
        static PAYMENT_GROUP: {
            PRODUCT: string;
            LISTING: string;
            SUBSCRIPTION: string;
        };
        static BASKET_ITEM_TYPE: {
            PHYSICAL: string;
            VIRTUAL: string;
        };
        static PAYMENT_CHANNEL: {
            WEB: string;
            MOBILE: string;
            MOBILE_WEB: string;
        };
    }

    export = Iyzipay;
}
