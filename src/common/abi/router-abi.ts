import { parseAbi } from 'viem';

export const ROUTER_ABI = parseAbi([
  'function getAmountsIn(uint256 amountOut, address[] path) view returns (uint256[] amounts)'
]);