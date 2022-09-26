import { Contract } from '@ethersproject/contracts';
import { abiERC20 } from '@metamask/metamask-eth-abis';
import { BN, toUtf8 } from 'ethereumjs-util';
import { StaticWeb3Provider } from '../../StaticWeb3Provider';
import { ERC20 } from '../../constants';
import { BigNumber } from '@ethersproject/bignumber';
import { AbiCoder } from '@ethersproject/abi';
import { ethersBigNumberToBN } from '../../util';

export class ERC20Standard {
  private provider: StaticWeb3Provider;

  constructor(provider: StaticWeb3Provider) {
    this.provider = provider;
  }

  /**
   * Get balance or count for current account on specific asset contract.
   *
   * @param address - Asset ERC20 contract address.
   * @param selectedAddress - Current account public address.
   * @returns Promise resolving to BN object containing balance for current account on specific asset contract.
   */
  async getBalanceOf(address: string, selectedAddress: string): Promise<BN> {
    const contract = new Contract(address, abiERC20, this.provider);
    return contract.balanceOf(selectedAddress).then(ethersBigNumberToBN);
  }

  /**
   * Query for the decimals for a given ERC20 asset.
   *
   * @param address - ERC20 asset contract string.
   * @returns Promise resolving to the 'decimals'.
   */
  async getTokenDecimals(address: string): Promise<string> {
    const contract = new Contract(address, abiERC20, this.provider);
    return contract
      .decimals()
      .then((result: BigNumber | string) => result.toString());
  }

  /**
   * Query for symbol for a given ERC20 asset.
   *
   * @param address - ERC20 asset contract address.
   * @returns Promise resolving to the 'symbol'.
   */
  async getTokenSymbol(address: string): Promise<string> {
    // Signature for calling `symbol()`
    const payload = { to: address, data: '0x95d89b41' };
    const result = await this.provider.call(payload);

    const abiCoder = new AbiCoder();

    // Parse as string
    try {
      const decoded = abiCoder.decode(['string'], result)[0];
      if (decoded) {
        return decoded;
      }
    } catch {
      // Ignore error
    }

    // Parse as bytes
    try {
      const utf8 = toUtf8(result);
      return utf8;
    } catch {
      // Ignore error
    }

    throw new Error('Failed to parse token symbol');
  }

  /**
   * Query if a contract implements an interface.
   *
   * @param address - Asset contract address.
   * @param userAddress - The public address for the currently active user's account.
   * @returns Promise resolving an object containing the standard, decimals, symbol and balance of the given contract/userAddress pair.
   */
  async getDetails(
    address: string,
    userAddress?: string,
  ): Promise<{
    standard: string;
    symbol: string | undefined;
    decimals: string | undefined;
    balance: BN | undefined;
  }> {
    const [decimals, symbol] = await Promise.all([
      this.getTokenDecimals(address),
      this.getTokenSymbol(address),
    ]);
    let balance;
    if (userAddress) {
      balance = await this.getBalanceOf(address, userAddress);
    }
    return {
      decimals,
      symbol,
      balance,
      standard: ERC20,
    };
  }
}
