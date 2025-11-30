import { customAlphabet } from 'nanoid';

const nanoId = customAlphabet('1234567890abcdef', 15);

export function generateOrderId(): string {
   return nanoId().toUpperCase();
}