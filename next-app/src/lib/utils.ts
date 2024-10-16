import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// export const convertPaymentMapToHumanReadable = (payment: any) => {
//   const paymentMap = new Map<`0x${string}`, number>(
//     Object.entries(payment) as [`0x${string}`, number][]
//   );
//   const result = new Map<string, number>();

//   paymentMap.forEach((value, key) => {
//     const token = KNOWN_PAYMENT.get(key);
//     if (token) {
//       result.set(
//         token.ticker,
//         convertAmountFromOnChainToHumanReadable(value, token.unit)
//       );
//     } else {
//       result.set(key, value);
//     }
//   });

//   return JSON.stringify(Object.fromEntries(result));
// };
