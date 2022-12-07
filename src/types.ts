import {either} from 'fp-ts';

export type CustomDecoder<I, A> = (u: I) => either.Either<string, A>

export type BaseProofType = {
    auth47_response: '1.0';
    challenge: string;
    signature: string;
}

export type AddressProofType = BaseProofType & {
    address: string;
}

export type NymProofType = BaseProofType & {
    nym: string;
}

export type NymProofContainer = {
    _tag: 'NymProof'
    value: NymProofType
}

export type AddressProofContainer = {
    _tag: 'AddressProof'
    value: AddressProofType
}

export type ProofContainer = NymProofContainer | AddressProofContainer

interface ValidProofContainerBrand {
    readonly ValidProofContainer: unique symbol;
}

export type ValidProofContainer = ProofContainer & ValidProofContainerBrand;

interface NonEmptyStringBrand {
    readonly NonEmptyString: unique symbol;
}

export type NonEmptyString = string & NonEmptyStringBrand;

interface NonEmptyBase58StringBrand {
    readonly NonEmptyBase58String: unique symbol;
}

export type NonEmptyBase58String = NonEmptyString & NonEmptyBase58StringBrand;

interface NonEmptyBase64StringBrand {
    readonly NonEmptyBase64String: unique symbol;
}

export type NonEmptyBase64String = NonEmptyString & NonEmptyBase64StringBrand;

interface BTCAddressBrand {
    readonly BTCAddress: unique symbol;
}

export type BTCAddress = NonEmptyString & BTCAddressBrand;

interface PaymentCodeBrand extends NonEmptyBase58StringBrand {
    readonly PaymentCode: unique symbol;
}

export type PaymentCode = NonEmptyBase58String & PaymentCodeBrand;

interface AlphaNumericStringBrand {
    readonly AlphaNumericString: unique symbol;
}

export type AlphaNumericString = string & AlphaNumericStringBrand;
